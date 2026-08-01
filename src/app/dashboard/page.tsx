'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Video, BarChart3, Clock, CheckCircle2, ArrowRight, Plus, Play, Sparkles } from 'lucide-react';

interface SessionSummary {
  id: string;
  role_title: string | null;
  status: string;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  created: { label: 'Not Started', badge: 'badge-yellow' },
  in_progress: { label: 'In Progress', badge: 'badge-navy' },
  completed: { label: 'Completed', badge: 'badge-green' },
  analyzed: { label: 'Report Ready', badge: 'badge-green' },
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
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: '#fef3c7',
          border: '1px solid #fde68a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#d97706',
          flexShrink: 0,
        }}
      >
        <Video size={24} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: '160px' }}>
        <div style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a', marginBottom: '4px' }}>
          {session.role_title || 'Untitled Assessment Call'}
        </div>
        <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={14} />
          {dateStr} at {timeStr}
          {duration && <span style={{ marginLeft: '10px' }}>· {duration}</span>}
        </div>
      </div>

      {/* Status */}
      <div className={`badge ${cfg.badge}`} style={{ flexShrink: 0 }}>
        <CheckCircle2 size={14} /> {cfg.label}
      </div>

      {/* Action */}
      <div style={{ flexShrink: 0 }}>
        {session.status === 'analyzed' ? (
          <Link
            href={`/report/${session.id}`}
            className="btn-primary"
            style={{ padding: '8px 18px', fontSize: '13px' }}
          >
            View Evaluation <ArrowRight size={14} />
          </Link>
        ) : session.status === 'in_progress' ? (
          <Link
            href={`/interview/${session.id}`}
            className="btn-navy"
            style={{ padding: '8px 18px', fontSize: '13px' }}
          >
            Resume Call <Play size={14} />
          </Link>
        ) : (
          <Link
            href={`/interview/${session.id}`}
            className="btn-navy"
            style={{ padding: '8px 18px', fontSize: '13px' }}
          >
            Start Call <Play size={14} />
          </Link>
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
    <div style={{ minHeight: '100vh', background: '#faf5ef' }}>
      <Navbar />

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 24px 80px' }}>
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
            <div className="badge badge-yellow" style={{ marginBottom: 12 }}>
              <Sparkles size={14} /> Candidate Evaluation Dashboard
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: '8px' }}>
              Assessment Dashboard
            </h1>
            <p style={{ color: '#475569', fontSize: '15px' }}>
              Your technical video call assessment history and performance reports
            </p>
          </div>
          <Link href="/new" className="btn-primary" id="new-session-btn">
            <Plus size={18} /> New Assessment
          </Link>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '20px',
            marginBottom: '40px',
          }}
        >
          {[
            { label: 'Total Assessments', value: sessions.length, icon: Video, color: '#f59e0b', bg: '#fef3c7' },
            { label: 'Reports Ready', value: analyzed, icon: BarChart3, color: '#059669', bg: '#d1fae5' },
            { label: 'In Progress', value: inProgress, icon: Clock, color: '#2563eb', bg: '#dbeafe' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={26} color={stat.color} />
                </div>
                <div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>{stat.value}</div>
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{stat.label}</div>
                </div>
              </div>
            );
          })}
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
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Video size={36} color="#f59e0b" />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
              No assessment calls yet
            </h2>
            <p style={{ color: '#475569', marginBottom: '28px', fontSize: '15px' }}>
              Start your first video call assessment to receive detailed domain performance reports.
            </p>
            <Link href="/new" className="btn-primary" style={{ padding: '14px 32px' }}>
              Start Your First Assessment
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
              Recent Assessment Calls
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
