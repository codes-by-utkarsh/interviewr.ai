'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Report, Turn } from '@/lib/types';
import {
  Award,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ChevronDown,
  Clock,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Lightbulb,
  Check,
  XCircle
} from 'lucide-react';

function ScoreCircle({ score, size = 130 }: { score: number; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = (s: number) =>
    s >= 80 ? '#059669' : s >= 60 ? '#f59e0b' : '#e11d48';

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
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
            fontSize: '32px',
            fontWeight: 800,
            color: getColor(score),
            lineHeight: 1,
          }}
        >
          {score}
        </div>
        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>/ 100</div>
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
    s >= 80 ? '#059669' : s >= 60 ? '#f59e0b' : '#e11d48';

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
          fontWeight: 700,
        }}
      >
        <span style={{ color: '#0f172a' }}>{formatLabel(label)}</span>
        <span style={{ color: getColor(score) }}>{score}</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: '#e2e8f0', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            borderRadius: 4,
            width: `${score}%`,
            background: getColor(score),
            transition: 'width 1s ease',
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
    if (score >= 85) return { label: 'Strong Hire', badge: 'badge-green', icon: CheckCircle2 };
    if (score >= 70) return { label: 'Lean Hire', badge: 'badge-yellow', icon: Check };
    if (score >= 55) return { label: 'Mixed — Needs Improvement', badge: 'badge-amber', icon: AlertTriangle };
    return { label: 'No Hire — Keep Practicing', badge: 'badge-red', icon: XCircle };
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
      <div style={{ minHeight: '100vh', background: '#faf5ef' }}>
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
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={36} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Generating Evaluation Report...</div>
          <div style={{ fontSize: '14px', color: '#64748b' }}>
            Analyzing candidate responses against job requirements
          </div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div style={{ minHeight: '100vh', background: '#faf5ef' }}>
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
          <XCircle size={54} color="#e11d48" />
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{error || 'Report not found'}</div>
          <Link href="/" className="btn-primary">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const verdict = getVerdict(report.overall_score);
  const VerdictIcon = verdict.icon;

  return (
    <div style={{ minHeight: '100vh', background: '#faf5ef' }}>
      <Navbar />

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 24px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className={`badge ${verdict.badge}`}>
              <VerdictIcon size={14} /> {verdict.label}
            </div>
            {sessionMeta?.role_title && (
              <div className="badge badge-navy">{sessionMeta.role_title}</div>
            )}
            {sessionMeta?.started_at && sessionMeta?.ended_at && (
              <div className="badge badge-yellow">
                <Clock size={14} /> {formatDuration(sessionMeta.started_at, sessionMeta.ended_at)}
              </div>
            )}
          </div>
          <h1 style={{ fontSize: '38px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: '12px' }}>
            interviewr.ai Candidate Evaluation Report
          </h1>
          <p style={{ color: '#475569', lineHeight: 1.7, fontSize: '16px' }}>
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
            <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: 700 }}>
              Overall Score
            </div>
          </div>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px', color: '#0f172a' }}>
              Competency Breakdown
            </h3>
            {Object.entries(report.category_scores).map(([key, value]) => (
              <CategoryBar key={key} label={key} score={value} />
            ))}
          </div>
        </div>

        {/* Strengths */}
        <div className="glass-card" style={{ padding: '32px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={22} color="#059669" /> Demonstrated Strengths
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {report.strengths.map((s, i) => (
              <div
                key={i}
                style={{
                  padding: '16px 20px',
                  background: '#d1fae5',
                  border: '1px solid #a7f3d0',
                  borderRadius: '12px',
                }}
              >
                <blockquote
                  style={{
                    fontSize: '14px',
                    color: '#065f46',
                    fontStyle: 'italic',
                    marginBottom: '8px',
                    paddingLeft: '12px',
                    borderLeft: '3px solid #059669',
                    fontWeight: 600,
                  }}
                >
                  "{s.quote}"
                </blockquote>
                <p style={{ fontSize: '14px', color: '#0f172a', lineHeight: 1.6 }}>
                  {s.comment}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Improvements */}
        <div className="glass-card" style={{ padding: '32px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TrendingUp size={22} color="#d97706" /> Areas for Competency Growth
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {report.improvements.map((imp, i) => (
              <div
                key={i}
                style={{
                  padding: '20px',
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  borderRadius: '12px',
                }}
              >
                <blockquote
                  style={{
                    fontSize: '14px',
                    color: '#92400e',
                    fontStyle: 'italic',
                    marginBottom: '10px',
                    paddingLeft: '12px',
                    borderLeft: '3px solid #d97706',
                    fontWeight: 600,
                  }}
                >
                  "{imp.quote}"
                </blockquote>
                <p style={{ fontSize: '14px', color: '#0f172a', marginBottom: '12px', lineHeight: 1.6 }}>
                  {imp.comment}
                </p>
                <div
                  style={{
                    padding: '12px 16px',
                    background: '#ffffff',
                    border: '1px solid #fde68a',
                    borderRadius: '8px',
                    fontSize: '13px',
                    lineHeight: 1.7,
                    color: '#475569',
                    display: 'flex',
                    gap: 8,
                    alignItems: 'flex-start',
                  }}
                >
                  <Lightbulb size={18} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={{ color: '#0f172a', fontWeight: 700 }}>Recommended High-Score Response: </strong>
                    {imp.better_answer}
                  </div>
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
              color: '#0f172a',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={18} color="#f59e0b" /> Full Call Transcript Log ({turns.length} Exchanges)
            </span>
            <ChevronDown size={18} style={{ transform: showTranscript ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
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
                paddingTop: '16px',
                borderTop: '1px solid #e2d9cd',
              }}
            >
              {turns.map((turn) => (
                <div
                  key={turn.id}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: turn.role === 'interviewer' ? '#f8fafc' : '#f1f5f9',
                    borderLeft: `3px solid ${turn.role === 'interviewer' ? '#f59e0b' : '#0f172a'}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: turn.role === 'interviewer' ? '#d97706' : '#0f172a',
                      marginBottom: '6px',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {turn.role === 'interviewer' ? 'ALEX (AI RECRUITER)' : 'CANDIDATE (YOU)'}
                  </div>
                  <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#334155' }}>
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
            <RotateCcw size={16} /> Practice New Assessment
          </Link>
          <Link href="/dashboard" className="btn-ghost" style={{ padding: '14px 24px', fontSize: '14px', background: '#ffffff' }}>
            View Assessment Dashboard <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
