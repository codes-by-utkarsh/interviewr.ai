'use client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

const features = [
  {
    icon: '🧠',
    title: 'Adaptive AI Interviewer',
    desc: 'Claude-powered interviewer that adapts to your answers — probes weak spots, raises difficulty on strong answers, and follows up naturally.',
  },
  {
    icon: '📄',
    title: 'Resume + JD Grounded',
    desc: 'Upload your resume and paste the job description. Every question is grounded in your actual experience and the role requirements.',
  },
  {
    icon: '💬',
    title: 'Text & Voice Modes',
    desc: 'Start with text-based practice, then upgrade to full voice conversation with AI-generated speech and real-time transcription.',
  },
  {
    icon: '📊',
    title: 'Detailed Score Report',
    desc: 'Get a comprehensive post-interview report: overall score, category breakdowns, specific strengths, and improvement areas with example answers.',
  },
  {
    icon: '📈',
    title: 'Progress Tracking',
    desc: 'See your score trend over multiple sessions. Track improvement across Communication, Technical Depth, Problem-Solving, and more.',
  },
  {
    icon: '⚡',
    title: 'Streaming Responses',
    desc: "Responses stream in real-time — no waiting for the AI to finish thinking before you see the next question. Feels like a real conversation.",
  },
];

const stats = [
  { value: '5+', label: 'Question Categories' },
  { value: '∞', label: 'Practice Sessions' },
  { value: '< 1min', label: 'Setup Time' },
  { value: '100%', label: 'Private & Secure' },
];

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <section
        style={{
          padding: '100px 24px 80px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow blobs */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '300px',
            background: 'radial-gradient(ellipse, rgba(139,92,246,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: '20%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(ellipse, rgba(6,182,212,0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', maxWidth: '780px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              background: 'rgba(139,92,246,0.1)',
              border: '1px solid rgba(139,92,246,0.25)',
              borderRadius: '999px',
              fontSize: '13px',
              color: '#a78bfa',
              fontWeight: 600,
              marginBottom: '32px',
              letterSpacing: '0.03em',
            }}
          >
            <span>✨</span>
            Powered by Claude AI
          </div>

          <h1
            style={{
              fontSize: 'clamp(40px, 6vw, 72px)',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '24px',
              letterSpacing: '-0.03em',
            }}
          >
            Ace Your Next Interview with{' '}
            <span className="gradient-text">AI-Powered</span> Practice
          </h1>

          <p
            style={{
              fontSize: '18px',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              marginBottom: '48px',
              maxWidth: '560px',
              margin: '0 auto 48px',
            }}
          >
            Upload your resume, paste the job description, and have a live adaptive mock interview with an AI that thinks like a real interviewer. Get a detailed report instantly.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/new" className="btn-primary" style={{ padding: '14px 32px', fontSize: '16px' }}>
              🎙️ Start a Mock Interview
            </Link>
            <Link href="/dashboard" className="btn-ghost" style={{ padding: '14px 28px', fontSize: '15px' }}>
              View Dashboard →
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: 'flex',
            gap: '32px',
            justifyContent: 'center',
            marginTop: '80px',
            flexWrap: 'wrap',
          }}
        >
          {stats.map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #a78bfa, #22d3ee)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '60px 24px', maxWidth: '900px', margin: '0 auto' }}>
        <h2
          style={{
            fontSize: '32px',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '48px',
            letterSpacing: '-0.02em',
          }}
        >
          How It Works
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {[
            {
              step: '01',
              title: 'Upload & Setup',
              desc: 'Upload your resume (PDF/DOCX) and paste the job description or topic syllabus. Takes under a minute.',
              icon: '📎',
            },
            {
              step: '02',
              title: 'Live Interview',
              desc: 'Chat (or speak) with the AI interviewer in real time. It adapts to your answers, follows up on weak points, and mimics a real hiring manager.',
              icon: '💬',
            },
            {
              step: '03',
              title: 'Get Your Report',
              desc: 'After the session, receive a full analysis: overall score, category breakdown, quoted strengths, improvement areas with example answers.',
              icon: '📊',
            },
          ].map((item, i) => (
            <div
              key={item.step}
              style={{
                display: 'flex',
                gap: '24px',
                padding: '32px 0',
                borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.1))',
                  border: '1px solid rgba(139,92,246,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--accent-purple)', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.08em' }}>
                  STEP {item.step}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '15px' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section style={{ padding: '60px 24px 100px', maxWidth: '1100px', margin: '0 auto' }}>
        <h2
          style={{
            fontSize: '32px',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '48px',
            letterSpacing: '-0.02em',
          }}
        >
          Everything You Need to Prepare
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
          }}
        >
          {features.map((feature) => (
            <div key={feature.title} className="glass-card" style={{ padding: '28px' }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '10px' }}>{feature.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7 }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: '80px 24px',
          textAlign: 'center',
          background: 'linear-gradient(180deg, transparent, rgba(139,92,246,0.05))',
          borderTop: '1px solid var(--border)',
        }}
      >
        <h2 style={{ fontSize: '40px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.03em' }}>
          Ready to practice?
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '40px' }}>
          No sign-up required. Just upload and start.
        </p>
        <Link href="/new" className="btn-primary" style={{ padding: '16px 40px', fontSize: '17px' }}>
          🎙️ Start Your First Interview
        </Link>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: '24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '13px',
          borderTop: '1px solid var(--border)',
        }}
      >
        interviewr.ai — AI Mock Interview Platform &nbsp;·&nbsp; Powered by Claude AI
      </footer>
    </div>
  );
}
