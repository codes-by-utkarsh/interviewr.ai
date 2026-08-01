'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(10, 10, 15, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 24px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
          }}
        >
          🎙️
        </div>
        <span
          style={{
            fontWeight: 700,
            fontSize: '18px',
            background: 'linear-gradient(135deg, #a78bfa, #22d3ee)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          interviewr.ai
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Link
          href="/"
          className="nav-link"
          style={{ color: pathname === '/' ? 'var(--text-primary)' : undefined }}
        >
          Home
        </Link>
        <Link
          href="/dashboard"
          className="nav-link"
          style={{ color: pathname === '/dashboard' ? 'var(--text-primary)' : undefined }}
        >
          Dashboard
        </Link>
        <Link href="/new" className="btn-primary" style={{ padding: '8px 18px', fontSize: '14px' }}>
          + New Interview
        </Link>
      </div>
    </nav>
  );
}
