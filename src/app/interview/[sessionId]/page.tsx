'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Turn } from '@/lib/types';

type Status = 'idle' | 'ai_thinking' | 'ai_speaking' | 'listening' | 'analyzing';

interface MessageBubbleProps {
  turn: Turn;
  isStreaming?: boolean;
}

function MessageBubble({ turn, isStreaming }: MessageBubbleProps) {
  const isInterviewer = turn.role === 'interviewer';

  return (
    <div
      className="chat-bubble"
      style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        flexDirection: isInterviewer ? 'row' : 'row-reverse',
        marginBottom: '20px',
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: isInterviewer
            ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)'
            : 'linear-gradient(135deg, #374151, #1f2937)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          flexShrink: 0,
          border: isInterviewer ? '2px solid rgba(139,92,246,0.3)' : '2px solid rgba(255,255,255,0.08)',
        }}
      >
        {isInterviewer ? '🤖' : '👤'}
      </div>

      {/* Bubble */}
      <div style={{ maxWidth: '75%' }}>
        <div
          style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            marginBottom: '6px',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textAlign: isInterviewer ? 'left' : 'right',
          }}
        >
          {isInterviewer ? 'AI Interviewer' : 'You'}
        </div>
        <div
          style={{
            padding: '14px 18px',
            borderRadius: isInterviewer ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
            background: isInterviewer
              ? 'var(--bg-card)'
              : 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(99,102,241,0.2))',
            border: isInterviewer
              ? '1px solid var(--border)'
              : '1px solid rgba(139,92,246,0.2)',
            fontSize: '15px',
            lineHeight: 1.7,
            color: 'var(--text-primary)',
            whiteSpace: 'pre-wrap',
          }}
        >
          {turn.content}
          {isStreaming && (
            <span
              style={{
                display: 'inline-block',
                width: '2px',
                height: '16px',
                background: 'var(--accent-purple)',
                marginLeft: '2px',
                verticalAlign: 'middle',
                animation: 'blink 1s step-start infinite',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function AIStatusIndicator({ status }: { status: Status }) {
  const configs = {
    idle: { color: '#4a4a68', label: 'Ready', pulse: false },
    ai_thinking: { color: '#f59e0b', label: 'Thinking...', pulse: true },
    ai_speaking: { color: '#8b5cf6', label: 'Speaking', pulse: true },
    listening: { color: '#10b981', label: 'Listening', pulse: true },
    analyzing: { color: '#06b6d4', label: 'Analyzing...', pulse: true },
  };
  const cfg = configs[status];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative', width: '10px', height: '10px' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: cfg.color,
            animation: cfg.pulse ? 'pulse-dot 1.5s ease-in-out infinite' : 'none',
          }}
        />
        {cfg.pulse && (
          <div
            style={{
              position: 'absolute',
              inset: '-4px',
              borderRadius: '50%',
              border: `1px solid ${cfg.color}`,
              animation: 'pulse-ring 1.5s ease-out infinite',
            }}
          />
        )}
      </div>
      <span style={{ fontSize: '13px', color: cfg.color, fontWeight: 600 }}>{cfg.label}</span>
    </div>
  );
}

function Waveform({ active }: { active: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '24px' }}>
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: '3px',
            borderRadius: '2px',
            background: active ? 'var(--accent-purple)' : 'var(--text-muted)',
            height: active ? '100%' : '6px',
            transition: 'height 0.3s, background 0.3s',
            animation: active ? `wave ${0.8 + i * 0.1}s ease-in-out infinite alternate` : 'none',
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function InterviewPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string>('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [streamingText, setStreamingText] = useState('');
  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [turnCount, setTurnCount] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [endDialogOpen, setEndDialogOpen] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Resolve params
  useEffect(() => {
    params.then(({ sessionId: sid }) => setSessionId(sid));
  }, [params]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turns, streamingText]);

  // Timer
  useEffect(() => {
    if (sessionStarted) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [sessionStarted]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const callTurnAPI = useCallback(
    async (candidateMessage?: string) => {
      if (!sessionId) return;
      setStatus(candidateMessage ? 'ai_thinking' : 'ai_thinking');
      setStreamingText('');

      const res = await fetch(`/api/sessions/${sessionId}/turn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateMessage: candidateMessage || null }),
      });

      if (!res.ok || !res.body) {
        setStatus('idle');
        return;
      }

      setStatus('ai_speaking');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        full += text;
        setStreamingText(full);
      }

      // Finalize: add to turns list
      setTurns((prev) => [
        ...(candidateMessage
          ? [
              ...prev,
              {
                id: `candidate-${Date.now()}`,
                session_id: sessionId,
                role: 'candidate' as const,
                content: candidateMessage,
                created_at: new Date().toISOString(),
                turn_index: prev.length,
              },
            ]
          : prev),
        {
          id: `interviewer-${Date.now()}`,
          session_id: sessionId,
          role: 'interviewer' as const,
          content: full,
          created_at: new Date().toISOString(),
          turn_index: prev.length + (candidateMessage ? 1 : 0),
        },
      ]);

      setStreamingText('');
      setTurnCount((n) => n + 1);
      setStatus('listening');

      // TTS using browser speechSynthesis
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && full) {
        const utterance = new SpeechSynthesisUtterance(full);
        utterance.rate = 0.95;
        utterance.pitch = 1;
        // Try to pick a natural voice
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Neural'))
        );
        if (preferred) utterance.voice = preferred;
        window.speechSynthesis.speak(utterance);
      }
    },
    [sessionId]
  );

  // Start interview automatically when sessionId is ready
  useEffect(() => {
    if (sessionId && !sessionStarted) {
      setSessionStarted(true);
      callTurnAPI();
    }
  }, [sessionId, sessionStarted, callTurnAPI]);

  // Voice recognition setup
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser. Use Chrome for voice mode.');
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += transcript;
        else interim += transcript;
      }
      setSpeechTranscript(final || interim);
      if (final) setInputText((prev) => prev + final + ' ');
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
    setSpeechTranscript('');
  };

  const handleSendMessage = async () => {
    const message = inputText.trim();
    if (!message || status === 'ai_thinking' || status === 'ai_speaking') return;
    setInputText('');
    setSpeechTranscript('');
    stopListening();
    await callTurnAPI(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEndInterview = async () => {
    setEndDialogOpen(false);
    setStatus('analyzing');
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const res = await fetch(`/api/sessions/${sessionId}/analyze`, { method: 'POST' });
      if (!res.ok) throw new Error('Analysis failed');
      router.push(`/report/${sessionId}`);
    } catch {
      alert('Failed to analyze interview. Please try again.');
      setStatus('idle');
    }
  };

  const isInputDisabled = status === 'ai_thinking' || status === 'ai_speaking' || status === 'analyzing';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Session header */}
      <div
        style={{
          padding: '12px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-secondary)',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <AIStatusIndicator status={status} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '13px' }}>
            ⏱️
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'var(--text-primary)' }}>
              {formatTime(elapsedSeconds)}
            </span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {turnCount} exchange{turnCount !== 1 ? 's' : ''}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Voice mode toggle */}
          <button
            onClick={() => setVoiceMode((v) => !v)}
            className="btn-ghost"
            style={{
              padding: '8px 14px',
              fontSize: '13px',
              color: voiceMode ? '#a78bfa' : undefined,
              borderColor: voiceMode ? 'rgba(139,92,246,0.4)' : undefined,
            }}
          >
            {voiceMode ? '🎙️ Voice On' : '⌨️ Text Mode'}
          </button>

          <button
            onClick={() => setEndDialogOpen(true)}
            className="btn-danger"
            disabled={status === 'analyzing' || turns.length < 2}
            style={{ padding: '8px 16px', fontSize: '13px' }}
            id="end-interview-btn"
          >
            End Interview
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '32px 24px',
          maxWidth: '860px',
          width: '100%',
          margin: '0 auto',
          minHeight: '400px',
        }}
      >
        {/* Welcome message */}
        {turns.length === 0 && !streamingText && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 24px',
              color: 'var(--text-muted)',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎙️</div>
            <div style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>Your interviewer is preparing...</div>
          </div>
        )}

        {/* Turns */}
        {turns.map((turn) => (
          <MessageBubble key={turn.id} turn={turn} />
        ))}

        {/* Streaming turn */}
        {streamingText && (
          <MessageBubble
            turn={{
              id: 'streaming',
              session_id: sessionId,
              role: 'interviewer',
              content: streamingText,
              created_at: new Date().toISOString(),
              turn_index: turns.length,
            }}
            isStreaming
          />
        )}

        {/* Analyzing indicator */}
        {status === 'analyzing' && (
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              color: 'var(--accent-cyan)',
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>📊</div>
            <div style={{ fontSize: '16px', fontWeight: 600 }}>Analyzing your interview...</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
              This usually takes 10–20 seconds
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div
        style={{
          borderTop: '1px solid var(--border)',
          padding: '16px 24px',
          background: 'var(--bg-secondary)',
        }}
      >
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          {/* Voice mode: mic button + live transcript */}
          {voiceMode && (
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={listening ? stopListening : startListening}
                disabled={isInputDisabled}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  border: 'none',
                  background: listening
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                  cursor: isInputDisabled ? 'not-allowed' : 'pointer',
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                  boxShadow: listening ? '0 0 20px rgba(16,185,129,0.4)' : 'none',
                  animation: listening ? 'pulse-dot 1.5s ease-in-out infinite' : 'none',
                }}
              >
                {listening ? '🔴' : '🎙️'}
              </button>
              <Waveform active={listening} />
              {speechTranscript && (
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontStyle: 'italic', flex: 1 }}>
                  "{speechTranscript}"
                </span>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <textarea
              ref={textareaRef}
              id="answer-input"
              className="input-field"
              placeholder={
                isInputDisabled
                  ? status === 'ai_thinking'
                    ? 'AI is thinking...'
                    : status === 'ai_speaking'
                    ? 'AI is speaking...'
                    : 'Analyzing...'
                  : 'Type your answer... (Enter to send, Shift+Enter for new line)'
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isInputDisabled}
              rows={2}
              style={{
                minHeight: '52px',
                maxHeight: '180px',
                resize: 'vertical',
                flex: 1,
                opacity: isInputDisabled ? 0.6 : 1,
                transition: 'opacity 0.2s',
                fontFamily: 'Inter, sans-serif',
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={isInputDisabled || !inputText.trim()}
              className="btn-primary"
              id="send-message-btn"
              style={{
                padding: '14px 20px',
                fontSize: '20px',
                flexShrink: 0,
                height: '52px',
              }}
            >
              ↑
            </button>
          </div>

          <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
            Press <kbd style={{ background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)' }}>Enter</kbd> to send · <kbd style={{ background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)' }}>Shift+Enter</kbd> for new line
          </div>
        </div>
      </div>

      {/* End interview confirmation dialog */}
      {endDialogOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '24px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setEndDialogOpen(false); }}
        >
          <div
            className="glass-card"
            style={{ maxWidth: '440px', width: '100%', padding: '36px' }}
          >
            <div style={{ fontSize: '40px', textAlign: 'center', marginBottom: '20px' }}>🏁</div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, textAlign: 'center', marginBottom: '12px' }}>
              End the Interview?
            </h2>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.7, marginBottom: '28px', fontSize: '14px' }}>
              This will finalize your session and generate a full analysis report with your score, strengths, and improvement areas.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setEndDialogOpen(false)}
                className="btn-ghost"
                style={{ flex: 1, justifyContent: 'center', padding: '12px' }}
              >
                Keep Going
              </button>
              <button
                onClick={handleEndInterview}
                className="btn-danger"
                style={{ flex: 1, justifyContent: 'center', padding: '12px' }}
                id="confirm-end-btn"
              >
                Get My Report
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
