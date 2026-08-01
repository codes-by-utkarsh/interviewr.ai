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
    <div className="glass-card p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-5">
      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-[#fef3c7] border border-[#fde68a] flex items-center justify-center text-[#d97706] shrink-0">
        <Video size={24} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-[160px]">
        <div className="font-bold text-base text-[#0f172a] mb-1">
          {session.role_title || 'Untitled Assessment Call'}
        </div>
        <div className="text-[13px] text-[#64748b] flex items-center gap-1.5 flex-wrap">
          <Clock size={14} className="shrink-0" />
          {dateStr} at {timeStr}
          {duration && <span className="ml-2">· {duration}</span>}
        </div>
      </div>

      {/* Status */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between md:justify-end gap-4 w-full md:w-auto mt-2 md:mt-0">
        <div className={`badge ${cfg.badge} shrink-0`}>
          <CheckCircle2 size={14} /> {cfg.label}
        </div>

        {/* Action */}
        <div className="shrink-0">
          {session.status === 'analyzed' ? (
            <Link
              href={`/report/${session.id}`}
              className="btn-primary py-2 px-4.5 text-[13px]"
            >
              View Evaluation <ArrowRight size={14} />
            </Link>
          ) : session.status === 'in_progress' ? (
            <Link
              href={`/interview/${session.id}`}
              className="btn-navy py-2 px-4.5 text-[13px]"
            >
              Resume Call <Play size={14} />
            </Link>
          ) : (
            <Link
              href={`/interview/${session.id}`}
              className="btn-navy py-2 px-4.5 text-[13px]"
            >
              Start Call <Play size={14} />
            </Link>
          )}
        </div>
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
    <div className="min-h-screen bg-[#faf5ef]">
      <Navbar />

      <div className="max-w-[960px] mx-auto px-4 py-8 md:py-12 md:px-6 mb-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-10">
          <div>
            <div className="badge badge-yellow mb-3">
              <Sparkles size={14} /> Candidate Evaluation Dashboard
            </div>
            <h1 className="text-3xl md:text-[36px] font-extrabold text-[#0f172a] tracking-tight mb-2">
              Assessment Dashboard
            </h1>
            <p className="text-[#475569] text-[15px]">
              Your technical video call assessment history and performance reports
            </p>
          </div>
          <Link href="/new" className="btn-primary w-full sm:w-auto justify-center" id="new-session-btn">
            <Plus size={18} /> New Assessment
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {[
            { label: 'Total Assessments', value: sessions.length, icon: Video, color: '#f59e0b', bg: '#fef3c7' },
            { label: 'Reports Ready', value: analyzed, icon: BarChart3, color: '#059669', bg: '#d1fae5' },
            { label: 'In Progress', value: inProgress, icon: Clock, color: '#2563eb', bg: '#dbeafe' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="glass-card p-6 flex items-center gap-4">
                <div className="w-13 h-13 rounded-xl flex items-center justify-center" style={{ background: stat.bg }}>
                  <Icon size={26} color={stat.color} />
                </div>
                <div>
                  <div className="text-[28px] font-extrabold text-[#0f172a] leading-none mb-1">{stat.value}</div>
                  <div className="text-[13px] text-[#64748b] font-semibold">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sessions list */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="glass-card shimmer h-[88px] rounded-2xl"
              />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="glass-card p-10 md:p-20 text-center">
            <div className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-full bg-[#fef3c7] flex items-center justify-center mx-auto mb-5">
              <Video size={36} color="#f59e0b" />
            </div>
            <h2 className="text-xl md:text-[24px] font-extrabold text-[#0f172a] mb-3">
              No assessment calls yet
            </h2>
            <p className="text-[#475569] mb-7 text-sm md:text-[15px] max-w-md mx-auto">
              Start your first video call assessment to receive detailed domain performance reports.
            </p>
            <Link href="/new" className="btn-primary py-3.5 px-8">
              Start Your First Assessment
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <h2 className="text-base font-bold text-[#0f172a] mb-1">
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
