'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Turn } from '@/lib/types';

export type VoiceStatus =
  | 'idle' | 'ai_thinking' | 'ai_speaking'
  | 'user_turn' | 'user_recording' | 'processing' | 'analyzing';

interface UseVoiceInterviewOptions {
  sessionId: string;
}

// ── Browser TTS fallback ──────────────────────────────────────────────────────
function speakBrowser(text: string, onEnd: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd();
    return;
  }
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 0.92;
  utt.pitch = 1;
  const voices = window.speechSynthesis.getVoices();
  const pick = voices.find(
    (v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Neural') || v.name.includes('Natural'))
  );
  if (pick) utt.voice = pick;
  utt.onend = onEnd;
  utt.onerror = onEnd;
  window.speechSynthesis.speak(utt);
}

// ── Server TTS → play audio blob ──────────────────────────────────────────────
async function speakServer(text: string, onEnd: () => void): Promise<boolean> {
  try {
    const res = await fetch('/api/voice/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return false;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.onended = () => { URL.revokeObjectURL(url); onEnd(); };
    audio.onerror = () => { URL.revokeObjectURL(url); onEnd(); };
    await audio.play();
    return true;
  } catch {
    return false;
  }
}

// ── STT: server → Web Speech fallback ────────────────────────────────────────
async function transcribeBlob(blob: Blob): Promise<string> {
  try {
    const fd = new FormData();
    fd.append('audio', blob, 'recording.webm');
    fd.append('mimeType', blob.type || 'audio/webm');
    const res = await fetch('/api/voice/stt', { method: 'POST', body: fd });
    const data = await res.json();
    if (res.ok && data.transcript) return data.transcript;
  } catch { /* fall through */ }
  return '';
}

export function useVoiceInterview({ sessionId }: UseVoiceInterviewOptions) {
  const router = useRouter();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [streamingText, setStreamingText] = useState('');
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [liveCaption, setLiveCaption] = useState('');
  const [textFallback, setTextFallback] = useState('');
  const [micError, setMicError] = useState('');
  const [ttsProvider, setTtsProvider] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startedRef = useRef(false);

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // ── Speak AI text (server TTS → browser fallback) ─────────────────────────
  const speakAI = useCallback(async (text: string) => {
    setStatus('ai_speaking');
    const onEnd = () => setStatus('user_turn');
    const serverOk = await speakServer(text, onEnd);
    if (!serverOk) {
      setTtsProvider('browser');
      speakBrowser(text, onEnd);
    } else {
      setTtsProvider('server');
    }
  }, []);

  // ── Call interviewer API (streaming) ─────────────────────────────────────
  const callTurn = useCallback(async (candidateMessage?: string) => {
    if (!sessionId) return;
    setStatus('ai_thinking');
    setStreamingText('');

    if (candidateMessage) {
      setTurns((p) => [
        ...p,
        { id: `c-${Date.now()}`, session_id: sessionId, role: 'candidate', content: candidateMessage, created_at: new Date().toISOString(), turn_index: p.length },
      ]);
    }

    const res = await fetch(`/api/sessions/${sessionId}/turn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateMessage: candidateMessage ?? null }),
    });

    if (!res.ok || !res.body) { setStatus('user_turn'); return; }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      full += decoder.decode(value, { stream: true });
      setStreamingText(full);
    }

    setTurns((p) => [
      ...p,
      { id: `i-${Date.now()}`, session_id: sessionId, role: 'interviewer', content: full, created_at: new Date().toISOString(), turn_index: p.length },
    ]);
    setStreamingText('');
    await speakAI(full);
  }, [sessionId, speakAI]);

  // ── Auto-start on mount ───────────────────────────────────────────────────
  useEffect(() => {
    if (sessionId && !startedRef.current) {
      startedRef.current = true;
      callTurn();
    }
  }, [sessionId, callTurn]);

  // ── Start recording (MediaRecorder → Web Speech API fallback) ───────────────
  const startRecording = useCallback(async () => {
    setMicError('');

    // ── Path A: MediaRecorder (Chrome, Firefox, Edge) ────────────────────────
    if (typeof window !== 'undefined' && 'MediaRecorder' in window) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mr = new MediaRecorder(stream);
        chunksRef.current = [];
        mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
        mr.start(200);
        mediaRecorderRef.current = mr;
        setStatus('user_recording');
        return;
      } catch {
        setMicError('Mic access denied. Please allow microphone in browser settings.');
        return;
      }
    }

    // ── Path B: Web Speech API (Safari / no MediaRecorder) ──────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    const SR = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SR) {
      setMicError('Your browser does not support voice input. Please use the text field below.');
      return;
    }
    const r = new SR();
    r.lang = 'en-US';
    r.continuous = false;
    r.interimResults = true;
    setStatus('user_recording');
    setLiveCaption('Listening…');
    r.onresult = (e: any) => {
      const t = Array.from(e.results as SpeechRecognitionResultList)
        .map((res: SpeechRecognitionResult) => res[0].transcript)
        .join('');
      setLiveCaption(t);
    };
    r.onend = async () => {
      const finalCaption = liveCaption;
      setLiveCaption('');
      setStatus('processing');
      if (finalCaption.trim()) {
        await callTurn(finalCaption);
      } else {
        setStatus('user_turn');
        setMicError("Couldn't hear you. Try again or type below.");
      }
    };
    r.onerror = () => { setStatus('user_turn'); };
    // Store ref so stopRecording can call r.stop()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mediaRecorderRef as any).current = { isSpeechRecognition: true, stop: () => r.stop(), stream: { getTracks: () => [] } };
    r.start();
  }, [callTurn, liveCaption]);

  // ── Stop recording & transcribe ───────────────────────────────────────────
  const stopRecording = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mr = mediaRecorderRef.current as any;
    if (!mr) return;

    // ── Path B: SpeechRecognition — just stop it, onend handles the rest ─────
    if (mr.isSpeechRecognition) {
      mr.stop();
      return;
    }

    // ── Path A: MediaRecorder — collect blob and transcribe ──────────────────
    setStatus('processing');
    await new Promise<void>((resolve) => {
      mr.onstop = () => resolve();
      mr.stop();
      mr.stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
    });

    const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' });
    const transcript = await transcribeBlob(blob);
    setLiveCaption('');

    if (!transcript.trim()) {
      setStatus('user_turn');
      setMicError("Couldn't hear you clearly. Try again or type below.");
      return;
    }

    await callTurn(transcript);
  }, [callTurn]);

  // ── Send typed text ───────────────────────────────────────────────────────
  const sendText = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setTextFallback('');
    await callTurn(text);
  }, [callTurn]);

  // ── End interview ─────────────────────────────────────────────────────────
  const endInterview = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    window.speechSynthesis?.cancel();
    setStatus('analyzing');
    const res = await fetch(`/api/sessions/${sessionId}/analyze`, { method: 'POST' });
    if (res.ok) router.push(`/report/${sessionId}`);
    else { alert('Analysis failed. Please try again.'); setStatus('user_turn'); }
  }, [sessionId, router]);

  return {
    turns, streamingText, status, elapsed, liveCaption,
    textFallback, setTextFallback, micError, ttsProvider,
    startRecording, stopRecording, sendText, endInterview,
  };
}
