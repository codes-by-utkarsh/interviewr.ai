'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useVoiceInterview, VoiceStatus } from './useVoiceInterview';
import { Turn } from '@/lib/types';

// ── Animated AI Orb ───────────────────────────────────────────────────────────
function AIOrb({ status }: { status: VoiceStatus }) {
  const cfg: Record<VoiceStatus, { color: string; label: string; rings: number }> = {
    idle:           { color: '#4a4a68', label: 'Starting…',      rings: 0 },
    ai_thinking:    { color: '#f59e0b', label: 'Thinking…',      rings: 1 },
    ai_speaking:    { color: '#8b5cf6', label: 'AI Speaking',     rings: 3 },
    user_turn:      { color: '#10b981', label: 'Your Turn',       rings: 1 },
    user_recording: { color: '#ef4444', label: '● Recording',     rings: 2 },
    processing:     { color: '#06b6d4', label: 'Processing…',     rings: 1 },
    analyzing:      { color: '#6366f1', label: 'Analyzing…',      rings: 1 },
  };
  const c = cfg[status];

  return (
    <div style={{ position: 'relative', width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Pulsing rings */}
      {Array.from({ length: c.rings }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: `2px solid ${c.color}`,
          animation: `orbRing ${1.2 + i * 0.4}s ease-out infinite`,
          animationDelay: `${i * 0.3}s`,
          opacity: 0,
        }} />
      ))}
      {/* Core orb */}
      <div style={{
        width: 100, height: 100, borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, ${c.color}cc, ${c.color}44)`,
        border: `2px solid ${c.color}55`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 40,
        animation: 'orbPulse 2.4s ease-in-out infinite',
        boxShadow: `0 0 40px ${c.color}33`,
        transition: 'background 0.4s, box-shadow 0.4s',
      }}>
        {status === 'ai_speaking' || status === 'ai_thinking' ? '🤖' : status === 'user_recording' ? '🎙️' : status === 'analyzing' ? '📊' : '🤖'}
      </div>
      {/* Status label */}
      <div style={{
        position: 'absolute', bottom: -28,
        fontSize: 13, fontWeight: 700, color: c.color,
        letterSpacing: '0.06em', whiteSpace: 'nowrap',
        textShadow: `0 0 12px ${c.color}66`,
      }}>{c.label}</div>

      <style>{`
        @keyframes orbRing {
          0%   { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes orbPulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.06); }
        }
      `}</style>
    </div>
  );
}

// ── Audio waveform bars (CSS-animated) ───────────────────────────────────────
function Waveform({ active, color = '#8b5cf6' }: { active: boolean; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 28 }}>
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} style={{
          width: 3, borderRadius: 2, background: color,
          height: active ? '100%' : 4,
          animation: active ? `waveBar ${0.6 + (i % 4) * 0.15}s ease-in-out infinite alternate` : 'none',
          animationDelay: `${i * 0.08}s`,
          transition: 'height 0.2s',
          opacity: active ? 1 : 0.3,
        }} />
      ))}
      <style>{`
        @keyframes waveBar { from { transform: scaleY(0.3); } to { transform: scaleY(1); } }
      `}</style>
    </div>
  );
}

// ── Single transcript bubble ──────────────────────────────────────────────────
function Bubble({ turn }: { turn: Turn }) {
  const isAI = turn.role === 'interviewer';
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 12, animation: 'fadeUp 0.25s ease' }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0, marginTop: 2,
        background: isAI ? 'linear-gradient(135deg,#8b5cf6,#06b6d4)' : 'rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
      }}>{isAI ? '🤖' : '👤'}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: isAI ? '#a78bfa' : '#6b7280', fontWeight: 700, marginBottom: 4, letterSpacing: '0.05em' }}>
          {isAI ? 'INTERVIEWER' : 'YOU'}
        </div>
        <div style={{
          fontSize: 14, lineHeight: 1.65, color: 'var(--text-secondary)',
          background: isAI ? 'rgba(139,92,246,0.07)' : 'rgba(255,255,255,0.04)',
          padding: '10px 14px', borderRadius: 10,
          borderLeft: `3px solid ${isAI ? '#8b5cf6' : '#374151'}`,
        }}>{turn.content}</div>
      </div>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(6px);} to {opacity:1;transform:none;}}`}</style>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function VoiceInterviewPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);

  const {
    turns, streamingText, status, elapsed,
    liveCaption, textFallback, setTextFallback,
    micError, startRecording, stopRecording,
    sendText, endInterview,
  } = useVoiceInterview({ sessionId });

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const canMic = status === 'user_turn';
  const isRecording = status === 'user_recording';
  const busy = ['ai_thinking', 'ai_speaking', 'processing', 'analyzing'].includes(status);

  // Auto-scroll transcript
  useEffect(() => {
    const el = document.getElementById('transcript-scroll');
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, streamingText]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      <Navbar />

      {/* Top bar */}
      <div style={{
        padding: '10px 20px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 15, color: elapsed > 1800 ? '#ef4444' : 'var(--text-primary)' }}>
            ⏱ {fmt(elapsed)}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{turns.length} exchanges</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowTranscript(v => !v)} className="btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }}>
            {showTranscript ? '🙈 Hide' : '📝 Transcript'}
          </button>
          <button
            onClick={() => setShowEndDialog(true)}
            className="btn-danger"
            disabled={turns.length < 2 || status === 'analyzing'}
            style={{ padding: '6px 14px', fontSize: 12 }}
            id="end-interview-btn"
          >
            End Interview
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px 20px', gap: 32 }}>

        {/* Orb */}
        <AIOrb status={status} />

        {/* Live caption / streaming text */}
        {(streamingText || liveCaption) && (
          <div style={{
            maxWidth: 600, width: '100%', padding: '14px 20px',
            background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: 12, fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)',
            textAlign: 'center',
          }}>
            {streamingText || liveCaption}
            {streamingText && (
              <span style={{ display: 'inline-block', width: 2, height: 14, background: '#8b5cf6', marginLeft: 2, verticalAlign: 'middle', animation: 'blink 1s step-start infinite' }} />
            )}
          </div>
        )}

        {/* Transcript panel */}
        {showTranscript && (
          <div id="transcript-scroll" style={{
            width: '100%', maxWidth: 700, maxHeight: 240, overflowY: 'auto',
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '16px',
          }}>
            {turns.length === 0
              ? <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>Transcript will appear here…</p>
              : turns.map(t => <Bubble key={t.id} turn={t} />)
            }
          </div>
        )}

        {/* Mic error */}
        {micError && (
          <div style={{
            maxWidth: 600, width: '100%', padding: '10px 16px',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 8, fontSize: 13, color: '#f87171',
          }}>⚠️ {micError}</div>
        )}

        {/* Mic button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <button
            id="mic-button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!canMic && !isRecording}
            style={{
              width: 88, height: 88, borderRadius: '50%', border: 'none', cursor: (canMic || isRecording) ? 'pointer' : 'not-allowed',
              background: isRecording
                ? 'linear-gradient(135deg,#ef4444,#dc2626)'
                : canMic
                  ? 'linear-gradient(135deg,#8b5cf6,#6366f1)'
                  : 'rgba(255,255,255,0.06)',
              fontSize: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: isRecording ? '0 0 32px rgba(239,68,68,0.5)' : canMic ? '0 0 24px rgba(139,92,246,0.4)' : 'none',
              animation: isRecording ? 'orbPulse 1s ease-in-out infinite' : 'none',
              opacity: (!canMic && !isRecording) ? 0.35 : 1,
            }}
          >
            {isRecording ? '⏹' : '🎙️'}
          </button>
          <Waveform active={isRecording} color={isRecording ? '#ef4444' : '#8b5cf6'} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
            {isRecording ? 'Tap to stop & send' : canMic ? 'Tap to speak' : busy ? 'Wait for AI…' : 'Ready'}
          </span>
        </div>

        {/* Text fallback */}
        <details style={{ width: '100%', maxWidth: 600 }}>
          <summary style={{ fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer', marginBottom: 8 }}>
            ⌨️ Type instead (fallback)
          </summary>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input
              id="text-fallback-input"
              className="input-field"
              placeholder="Type your answer and press Enter…"
              value={textFallback}
              disabled={busy}
              onChange={e => setTextFallback(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendText(textFallback); }}
            />
            <button onClick={() => sendText(textFallback)} disabled={busy || !textFallback.trim()} className="btn-primary" style={{ padding: '0 18px', flexShrink: 0 }}>↑</button>
          </div>
        </details>
      </div>

      {/* End dialog */}
      {showEndDialog && (
        <div onClick={e => { if (e.target === e.currentTarget) setShowEndDialog(false); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div className="glass-card" style={{ maxWidth: 420, width: '100%', padding: 36, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏁</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>End Interview?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
              This will generate your full scored report: overall score, category breakdown, strengths, and improvement areas.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowEndDialog(false)} className="btn-ghost" style={{ flex: 1, justifyContent: 'center', padding: 12 }}>Keep Going</button>
              <button onClick={() => { setShowEndDialog(false); endInterview(); }} className="btn-danger" style={{ flex: 1, justifyContent: 'center', padding: 12 }} id="confirm-end-btn">Get My Report</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes blink { 0%,100%{opacity:1}50%{opacity:0} }`}</style>
    </div>
  );
}
