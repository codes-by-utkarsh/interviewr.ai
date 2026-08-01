'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface SessionSummary {
  id: string;
  role_title: string | null;
  status: string;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; badge: string; emoji: string }> = {
  created: { label: 'Not Started', badge: 'badge-amber', emoji: '⏳' },
  in_progress: { label: 'In Progress', badge: 'badge-cyan', emoji: '🔴' },
  completed: { label: 'Completed', badge: 'badge-purple', emoji: '✅' },
  analyzed: { label: 'Report Ready', badge: 'badge-green', emoji: '📊' },
};

function SessionCard({ session }: { session: SessionSummary }) {
  const cfg = STATUS_CONFIG[session.status] || STATUS_CONFIG.created;
  const date = new Date(session.created_at);
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const duration =
    session.started_at && session.ended_at
      ? (() => {
          const ms = new Date(session.ended_at).getTime() - new Date(session.started_at).getTime();
          const m = Math.floor(ms / 60000);
          const s = Math.floor((ms % 60000) / 1000);
          return `${m}m ${s}s`;
        })()
      : null;

  return (
    <div
      className="glass-card"
      style={{
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        flexWrap: 'wrap',
        cursor: 'pointer',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.1))',
          border: '1px solid rgba(139,92,246,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          flexShrink: 0,
        }}
      >
        🎙️
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: '160px' }}>
        <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>
          {session.role_title || 'Untitled Interview'}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {dateStr} at {timeStr}
          {duration && <span style={{ marginLeft: '10px' }}>· {duration}</span>}
        </div>
      </div>

      {/* Status */}
      <div className={`badge ${cfg.badge}`} style={{ flexShrink: 0 }}>
        {cfg.emoji} {cfg.label}
      </div>

      {/* Action */}
      <div style={{ flexShrink: 0 }}>
        {session.status === 'analyzed' ? (
          <Link
            href={`/report/${session.id}`}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            View Report
          </Link>
        ) : session.status === 'in_progress' ? (
          <Link
            href={`/interview/${session.id}`}
            className="btn-ghost"
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            Resume →
          </Link>
        ) : session.status === 'created' ? (
          <Link
            href={`/interview/${session.id}`}
            className="btn-ghost"
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            Start →
          </Link>
        ) : (
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Processing...</span>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch('/api/sessions');
        const data = await res.json();
        setSessions(data.sessions || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const analyzed = sessions.filter((s) => s.status === 'analyzed').length;
  const inProgress = sessions.filter((s) => s.status === 'in_progress').length;

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px 80px' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '40px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '8px' }}>
              Dashboard
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
              Your interview practice history
            </p>
          </div>
          <Link href="/new" className="btn-primary" id="new-session-btn">
            + New Interview
          </Link>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '16px',
            marginBottom: '40px',
          }}
        >
          {[
            { label: 'Total Sessions', value: sessions.length, emoji: '🎙️', badge: 'badge-purple' },
            { label: 'Completed', value: analyzed, emoji: '📊', badge: 'badge-green' },
            { label: 'In Progress', value: inProgress, emoji: '🔴', badge: 'badge-cyan' },
          ].map((stat) => (
            <div key={stat.label} className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.emoji}</div>
              <div style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Sessions list */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="glass-card shimmer"
                style={{ height: '88px', borderRadius: '16px' }}
              />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div
            className="glass-card"
            style={{
              padding: '80px 24px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🎙️</div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>
              No interviews yet
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '15px' }}>
              Start your first mock interview to see results here
            </p>
            <Link href="/new" className="btn-primary" style={{ padding: '14px 32px' }}>
              Start Your First Interview
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Recent Sessions
            </h2>
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
