'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useVoiceInterview, VoiceStatus } from './useVoiceInterview';
import { Turn } from '@/lib/types';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  MessageSquare,
  PhoneOff,
  Subtitles,
  User,
  Bot,
  Clock,
  Send,
  Users,
  Radio,
  X,
  AlertCircle,
  Volume2
} from 'lucide-react';

// ── Audio Waveform for active speaker ───────────────────────────────────────
function SoundWave({ active, color = '#f59e0b' }: { active: boolean; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 16 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 3,
            borderRadius: 2,
            background: color,
            height: active ? '100%' : 4,
            animationName: active ? 'wavePulse' : 'none',
            animationDuration: `${0.4 + (i % 3) * 0.15}s`,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            animationDelay: `${i * 0.07}s`,
            transition: 'height 0.2s',
            opacity: active ? 1 : 0.4,
          }}
        />
      ))}
      <style>{`
        @keyframes wavePulse {
          from { transform: scaleY(0.2); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}

// ── Google Meet Call Header ──────────────────────────────────────────────────
function MeetHeader({
  roleTitle,
  elapsed,
  onEndCall,
}: {
  roleTitle?: string;
  elapsed: number;
  onEndCall: () => void;
}) {
  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <header
      style={{
        height: 64,
        padding: '0 24px',
        background: '#141517',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: '#e2e8f0',
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            color: '#f87171',
          }}
        >
          <Radio size={14} style={{ animation: 'blink 1.2s ease-in-out infinite' }} />
          REC · {fmt(elapsed)}
        </div>

        <h1 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', margin: 0 }}>
          {roleTitle || 'HirePro AI Technical Evaluation Call'}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 13, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
          <Users size={16} /> 2 Participants (AI Recruiter + You)
        </div>
        <button
          onClick={onEndCall}
          className="btn-danger"
          style={{
            background: '#ea4335',
            color: 'white',
            padding: '8px 18px',
            fontSize: 13,
            fontWeight: 700,
            borderRadius: 999,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <PhoneOff size={16} /> End Call
        </button>
      </div>
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </header>
  );
}

// ── Google Meet Control Dock at Bottom ───────────────────────────────────────
function MeetControls({
  status,
  isRecording,
  isCameraOn,
  showChat,
  showCaptions,
  micError,
  onToggleMic,
  onToggleCamera,
  onToggleChat,
  onToggleCaptions,
  onEndCall,
}: {
  status: VoiceStatus;
  isRecording: boolean;
  isCameraOn: boolean;
  showChat: boolean;
  showCaptions: boolean;
  micError?: string;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleChat: () => void;
  onToggleCaptions: () => void;
  onEndCall: () => void;
}) {
  const canMic = status === 'user_turn';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#202124',
        padding: '10px 24px',
        borderRadius: 40,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
        border: '1px solid rgba(255,255,255,0.1)',
        zIndex: 50,
      }}
    >
      {/* Mic toggle */}
      <button
        onClick={onToggleMic}
        disabled={!canMic && !isRecording}
        title={isRecording ? 'Stop speaking & send' : canMic ? 'Click to speak' : 'Waiting for AI'}
        style={{
          width: 50,
          height: 50,
          borderRadius: '50%',
          border: 'none',
          background: isRecording ? '#ea4335' : canMic ? '#3c4043' : '#2d2f31',
          color: isRecording ? '#fff' : canMic ? '#e8eaed' : '#5f6368',
          cursor: canMic || isRecording ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          boxShadow: isRecording ? '0 0 20px rgba(234,67,53,0.6)' : 'none',
        }}
      >
        {isRecording ? <Mic size={22} color="#fff" /> : <MicOff size={22} />}
      </button>

      {/* Camera toggle */}
      <button
        onClick={onToggleCamera}
        title={isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
        style={{
          width: 50,
          height: 50,
          borderRadius: '50%',
          border: 'none',
          background: isCameraOn ? '#3c4043' : '#ea4335',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
      >
        {isCameraOn ? <VideoIcon size={22} /> : <VideoOff size={22} />}
      </button>

      {/* Subtitles / Captions Toggle */}
      <button
        onClick={onToggleCaptions}
        title="Toggle Captions"
        style={{
          width: 50,
          height: 50,
          borderRadius: '50%',
          border: 'none',
          background: showCaptions ? '#f59e0b' : '#3c4043',
          color: showCaptions ? '#0f172a' : '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
      >
        <Subtitles size={22} />
      </button>

      {/* Chat toggle */}
      <button
        onClick={onToggleChat}
        title="In-call chat"
        style={{
          width: 50,
          height: 50,
          borderRadius: '50%',
          border: 'none',
          background: showChat ? '#f59e0b' : '#3c4043',
          color: showChat ? '#0f172a' : '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
      >
        <MessageSquare size={22} />
      </button>

      {/* End Call Button */}
      <button
        onClick={onEndCall}
        title="End Call"
        style={{
          width: 56,
          height: 50,
          borderRadius: 25,
          border: 'none',
          background: '#ea4335',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 18px',
          transition: 'all 0.2s',
          marginLeft: 8,
        }}
      >
        <PhoneOff size={22} />
      </button>

      {micError && (
        <div
          style={{
            position: 'absolute',
            top: -46,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#ea4335',
            color: 'white',
            padding: '6px 14px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <AlertCircle size={16} /> {micError}
        </div>
      )}
    </div>
  );
}

// ── Google Meet Side Chat Panel ──────────────────────────────────────────────
function ChatPanel({
  turns,
  streamingText,
  textFallback,
  setTextFallback,
  onSendText,
  busy,
  onClose,
}: {
  turns: Turn[];
  streamingText: string;
  textFallback: string;
  setTextFallback: (s: string) => void;
  onSendText: (s: string) => void;
  busy: boolean;
  onClose: () => void;
}) {
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [turns, streamingText]);

  return (
    <aside
      style={{
        width: 380,
        background: '#1e1f22',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        zIndex: 20,
      }}
    >
      {/* Panel Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 16, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
          <MessageSquare size={18} color="#f59e0b" /> In-call messages
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>
      </div>

      <div style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.02)', fontSize: 12, color: '#94a3b8' }}>
        Messages can be seen only by people in the call and are deleted when the call ends.
      </div>

      {/* Messages List */}
      <div ref={chatScrollRef} style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {turns.map((t) => {
          const isAI = t.role === 'interviewer';
          return (
            <div key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: isAI ? '#f59e0b' : '#38bdf8', display: 'flex', alignItems: 'center', gap: 6 }}>
                {isAI ? <Bot size={14} /> : <User size={14} />} {isAI ? 'Alex (AI Recruiter)' : 'You'}
              </div>
              <div
                style={{
                  background: isAI ? '#2d2e33' : '#0284c7',
                  color: '#fff',
                  padding: '10px 14px',
                  borderRadius: isAI ? '0 12px 12px 12px' : '12px 0 12px 12px',
                  fontSize: 13,
                  lineHeight: 1.6,
                  wordBreak: 'break-word',
                }}
              >
                {t.content}
              </div>
            </div>
          );
        })}
        {streamingText && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Bot size={14} /> Alex (AI Recruiter)
            </div>
            <div style={{ background: '#2d2e33', color: '#fff', padding: '10px 14px', borderRadius: '0 12px 12px 12px', fontSize: 13, lineHeight: 1.6 }}>
              {streamingText}
              <span style={{ display: 'inline-block', width: 2, height: 12, background: '#f59e0b', marginLeft: 4, animation: 'blink 0.8s infinite' }} />
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (textFallback.trim()) {
              onSendText(textFallback);
              setTextFallback('');
            }
          }}
          style={{ display: 'flex', gap: 8 }}
        >
          <input
            type="text"
            placeholder="Send a message..."
            value={textFallback}
            disabled={busy}
            onChange={(e) => setTextFallback(e.target.value)}
            style={{
              flex: 1,
              background: '#2b2c30',
              border: 'none',
              borderRadius: 20,
              padding: '10px 16px',
              color: '#fff',
              fontSize: 13,
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={busy || !textFallback.trim()}
            style={{
              background: '#f59e0b',
              color: '#0f172a',
              border: 'none',
              borderRadius: '50%',
              width: 38,
              height: 38,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: busy || !textFallback.trim() ? 'not-allowed' : 'pointer',
              opacity: busy || !textFallback.trim() ? 0.4 : 1,
            }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </aside>
  );
}

// ── Main Google Meet Interview Page ──────────────────────────────────────────
export default function VoiceInterviewPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);

  const {
    turns,
    streamingText,
    status,
    elapsed,
    liveCaption,
    textFallback,
    setTextFallback,
    micError,
    startRecording,
    stopRecording,
    sendText,
    endInterview,
  } = useVoiceInterview({ sessionId });

  const isRecording = status === 'user_recording';
  const isAISpeaking = status === 'ai_speaking';
  const isAIThinking = status === 'ai_thinking';
  const busy = ['ai_thinking', 'ai_speaking', 'processing', 'analyzing'].includes(status);

  // Setup webcam stream for Candidate Tile
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isCameraOn) {
      navigator.mediaDevices
        ?.getUserMedia({ video: true, audio: false })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(() => {
          setIsCameraOn(false);
        });
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isCameraOn]);

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#111214',
        color: '#fff',
        fontFamily: 'Inter, system-ui, sans-serif',
        overflow: 'hidden',
      }}
    >
      <Navbar />

      {/* Meeting Header */}
      <MeetHeader elapsed={elapsed} onEndCall={() => setShowEndDialog(true)} />

      {/* Call Content Area */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {/* Main Video Grid */}
        <main
          style={{
            flex: 1,
            padding: 24,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: 20,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* TILE 1: AI Interviewer */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              maxHeight: 520,
              minHeight: 320,
              background: '#1c1e22',
              borderRadius: 16,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: isAISpeaking
                ? '3px solid #f59e0b'
                : isAIThinking
                ? '3px solid #fbbf24'
                : '1px solid rgba(255,255,255,0.08)',
              boxShadow: isAISpeaking ? '0 0 30px rgba(245,158,11,0.3)' : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            {/* Active Speaker Tag */}
            <div
              style={{
                position: 'absolute',
                top: 16,
                left: 16,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)',
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                zIndex: 5,
              }}
            >
              <Bot size={16} color="#f59e0b" /> Alex — Senior AI Recruiter
              <SoundWave active={isAISpeaking} color="#f59e0b" />
            </div>

            {/* AI Recruiter Portrait Card */}
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                border: '3px solid #f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isAISpeaking
                  ? '0 0 40px rgba(245,158,11,0.5)'
                  : '0 10px 30px rgba(0,0,0,0.4)',
                animation: isAISpeaking ? 'aiPulse 1.5s infinite ease-in-out' : 'none',
                transition: 'all 0.3s',
              }}
            >
              <Bot size={64} color="#f59e0b" />
            </div>

            <div style={{ marginTop: 16, fontSize: 14, color: isAIThinking ? '#fbbf24' : '#94a3b8', fontWeight: 600 }}>
              {isAISpeaking ? 'Evaluating & speaking…' : isAIThinking ? 'Formulating question…' : 'Listening to candidate…'}
            </div>

            {/* Closed Captions Overlay on AI Tile */}
            {showCaptions && (streamingText || liveCaption) && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 20,
                  left: 20,
                  right: 20,
                  background: 'rgba(0, 0, 0, 0.85)',
                  backdropFilter: 'blur(10px)',
                  padding: '12px 18px',
                  borderRadius: 12,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: '#f8fafc',
                  textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.1)',
                  zIndex: 5,
                }}
              >
                {streamingText || liveCaption}
              </div>
            )}
          </div>

          {/* TILE 2: Candidate (You) */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              maxHeight: 520,
              minHeight: 320,
              background: '#1c1e22',
              borderRadius: 16,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: isRecording ? '3px solid #ea4335' : '1px solid rgba(255,255,255,0.08)',
              boxShadow: isRecording ? '0 0 30px rgba(234,67,53,0.3)' : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            {/* Webcam Video */}
            {isCameraOn ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
              />
            ) : (
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9ca3af',
                }}
              >
                <User size={54} />
              </div>
            )}

            {/* Candidate Label */}
            <div
              style={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)',
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                zIndex: 5,
              }}
            >
              {isRecording ? <Mic size={16} color="#ea4335" /> : <MicOff size={16} color="#94a3b8" />}
              <span>You (Candidate)</span>
              <SoundWave active={isRecording} color="#ea4335" />
            </div>
          </div>
        </main>

        {/* In-Call Side Chat */}
        {showChat && (
          <ChatPanel
            turns={turns}
            streamingText={streamingText}
            textFallback={textFallback}
            setTextFallback={setTextFallback}
            onSendText={sendText}
            busy={busy}
            onClose={() => setShowChat(false)}
          />
        )}
      </div>

      {/* Floating Bottom Control Bar */}
      <MeetControls
        status={status}
        isRecording={isRecording}
        isCameraOn={isCameraOn}
        showChat={showChat}
        showCaptions={showCaptions}
        micError={micError}
        onToggleMic={isRecording ? stopRecording : startRecording}
        onToggleCamera={() => setIsCameraOn((v) => !v)}
        onToggleChat={() => setShowChat((v) => !v)}
        onToggleCaptions={() => setShowCaptions((v) => !v)}
        onEndCall={() => setShowEndDialog(true)}
      />

      {/* End Call Modal Confirmation */}
      {showEndDialog && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowEndDialog(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 24,
          }}
        >
          <div
            style={{
              background: '#202124',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 24,
              maxWidth: 440,
              width: '100%',
              padding: 36,
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            }}
          >
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ea4335', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <PhoneOff size={32} color="#fff" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10, color: '#fff' }}>
              Leave & Complete Assessment?
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
              Ending the meeting will finalize evaluation and generate your full score, domain radar breakdown, and candidate feedback report.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowEndDialog(false)}
                style={{
                  flex: 1,
                  background: '#3c4043',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 999,
                  padding: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Return to Call
              </button>
              <button
                onClick={() => {
                  setShowEndDialog(false);
                  endInterview();
                }}
                style={{
                  flex: 1,
                  background: '#ea4335',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 999,
                  padding: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                End & Get Report
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes aiPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
