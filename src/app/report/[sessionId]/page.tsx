'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Report, Turn } from '@/lib/types';

function ScoreCircle({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = (s: number) =>
    s >= 80 ? '#10b981' : s >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-secondary)"
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s ease' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontSize: size > 100 ? '28px' : '20px',
            fontWeight: 800,
            color: getColor(score),
            lineHeight: 1,
          }}
        >
          {score}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>/100</div>
      </div>
    </div>
  );
}

function CategoryBar({
  label,
  score,
}: {
  label: string;
  score: number;
}) {
  const getColor = (s: number) =>
    s >= 80 ? '#10b981' : s >= 60 ? '#f59e0b' : '#ef4444';

  const formatLabel = (key: string) =>
    key
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  return (
    <div style={{ marginBottom: '16px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '6px',
          fontSize: '14px',
        }}
      >
        <span style={{ color: 'var(--text-secondary)' }}>{formatLabel(label)}</span>
        <span style={{ fontWeight: 700, color: getColor(score) }}>{score}</span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${score}%`,
            background: `linear-gradient(90deg, ${getColor(score)}, ${getColor(score)}aa)`,
          }}
        />
      </div>
    </div>
  );
}

export default function ReportPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [sessionMeta, setSessionMeta] = useState<{ role_title?: string; started_at?: string; ended_at?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/sessions/${sessionId}/report`);
        if (!res.ok) throw new Error('Report not found');
        const data = await res.json();
        setReport(data.report);
        setTurns(data.turns || []);
        setSessionMeta(data.session);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [sessionId]);

  const getVerdict = (score: number) => {
    if (score >= 85) return { label: 'Strong Hire ✅', badge: 'badge-green' };
    if (score >= 70) return { label: 'Lean Hire 👍', badge: 'badge-cyan' };
    if (score >= 55) return { label: 'Mixed — Needs Work ⚠️', badge: 'badge-amber' };
    return { label: 'No Hire — Keep Practicing 💪', badge: 'badge-red' };
  };

  const formatDuration = (start?: string, end?: string) => {
    if (!start || !end) return null;
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}m ${s}s`;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Navbar />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '120px 24px',
            gap: '20px',
          }}
        >
          <div style={{ fontSize: '60px' }}>📊</div>
          <div style={{ fontSize: '20px', fontWeight: 600 }}>Loading your report...</div>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Fetching analysis results
          </div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Navbar />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '120px 24px',
            gap: '20px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '60px' }}>❌</div>
          <div style={{ fontSize: '20px', fontWeight: 600 }}>{error || 'Report not found'}</div>
          <Link href="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const verdict = getVerdict(report.overall_score);

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div className={`badge ${verdict.badge}`}>{verdict.label}</div>
            {sessionMeta?.role_title && (
              <div className="badge badge-purple">{sessionMeta.role_title}</div>
            )}
            {sessionMeta?.started_at && sessionMeta?.ended_at && (
              <div className="badge badge-cyan">
                ⏱️ {formatDuration(sessionMeta.started_at, sessionMeta.ended_at)}
              </div>
            )}
          </div>
          <h1 style={{ fontSize: '40px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '12px' }}>
            Interview Report
          </h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '16px' }}>
            {report.summary}
          </p>
        </div>

        {/* Score + categories */}
        <div
          className="glass-card"
          style={{ padding: '36px', marginBottom: '28px', display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'center' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <ScoreCircle score={report.overall_score} size={140} />
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Overall Score
            </div>
          </div>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-secondary)' }}>
              Category Breakdown
            </h3>
            {Object.entries(report.category_scores).map(([key, value]) => (
              <CategoryBar key={key} label={key} score={value} />
            ))}
          </div>
        </div>

        {/* Strengths */}
        <div className="glass-card" style={{ padding: '32px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>✅</span> Strengths
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {report.strengths.map((s, i) => (
              <div
                key={i}
                style={{
                  padding: '16px 20px',
                  background: 'rgba(16,185,129,0.06)',
                  border: '1px solid rgba(16,185,129,0.15)',
                  borderRadius: '10px',
                }}
              >
                <blockquote
                  style={{
                    fontSize: '14px',
                    color: '#34d399',
                    fontStyle: 'italic',
                    marginBottom: '8px',
                    paddingLeft: '12px',
                    borderLeft: '3px solid #10b981',
                  }}
                >
                  "{s.quote}"
                </blockquote>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {s.comment}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Improvements */}
        <div className="glass-card" style={{ padding: '32px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📈</span> Areas to Improve
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {report.improvements.map((imp, i) => (
              <div
                key={i}
                style={{
                  padding: '20px',
                  background: 'rgba(245,158,11,0.05)',
                  border: '1px solid rgba(245,158,11,0.15)',
                  borderRadius: '10px',
                }}
              >
                <blockquote
                  style={{
                    fontSize: '14px',
                    color: '#fbbf24',
                    fontStyle: 'italic',
                    marginBottom: '10px',
                    paddingLeft: '12px',
                    borderLeft: '3px solid #f59e0b',
                  }}
                >
                  "{imp.quote}"
                </blockquote>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.6 }}>
                  {imp.comment}
                </p>
                <div
                  style={{
                    padding: '12px 16px',
                    background: 'rgba(6,182,212,0.07)',
                    border: '1px solid rgba(6,182,212,0.15)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    lineHeight: 1.7,
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span style={{ color: '#22d3ee', fontWeight: 700 }}>💡 Stronger answer: </span>
                  {imp.better_answer}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transcript toggle */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <button
            onClick={() => setShowTranscript((v) => !v)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            📝 Full Transcript
            <span style={{ fontSize: '12px', transition: 'transform 0.2s', transform: showTranscript ? 'rotate(180deg)' : 'none' }}>
              ▼
            </span>
          </button>

          {showTranscript && (
            <div
              style={{
                marginTop: '20px',
                maxHeight: '480px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {turns.map((turn) => (
                <div
                  key={turn.id}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background:
                      turn.role === 'interviewer'
                        ? 'rgba(139,92,246,0.07)'
                        : 'rgba(255,255,255,0.04)',
                    borderLeft: `3px solid ${turn.role === 'interviewer' ? '#8b5cf6' : '#4a4a68'}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: turn.role === 'interviewer' ? '#a78bfa' : 'var(--text-muted)',
                      marginBottom: '6px',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {turn.role === 'interviewer' ? 'INTERVIEWER' : 'CANDIDATE'}
                  </div>
                  <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                    {turn.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '32px', flexWrap: 'wrap' }}>
          <Link href="/new" className="btn-primary" style={{ padding: '14px 28px', fontSize: '15px' }}>
            🎙️ Practice Again
          </Link>
          <Link href="/dashboard" className="btn-ghost" style={{ padding: '14px 24px', fontSize: '14px' }}>
            View Dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}
