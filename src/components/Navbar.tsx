'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogIn, UserPlus } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: '#faf5ef',
        borderBottom: '1px solid #e2d9cd',
        padding: '0 32px',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
      }}
    >
      {/* Brand logo: interviewr.ai by Utkarsh */}
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2V10" stroke="#EF4444" strokeWidth="3.5" strokeLinecap="round"/>
          <path d="M16 22V30" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round"/>
          <path d="M2 16H10" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round"/>
          <path d="M22 16H30" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round"/>
          <path d="M6.1 6.1L11.75 11.75" stroke="#EC4899" strokeWidth="3" strokeLinecap="round"/>
          <path d="M20.25 20.25L25.9 25.9" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round"/>
          <path d="M25.9 6.1L20.25 11.75" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
          <path d="M11.75 20.25L6.1 25.9" stroke="#06B6D4" strokeWidth="3" strokeLinecap="round"/>
        </svg>
        <div>
          <div style={{ fontWeight: 800, fontSize: '22px', color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1 }}>
            interviewr.<span style={{ color: '#f59e0b' }}>ai</span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginTop: '2px', letterSpacing: '0.02em' }}>
            by Utkarsh
          </div>
        </div>
      </Link>

      {/* Navigation links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link
          href="/"
          className="nav-link"
          style={{ color: pathname === '/' ? '#0f172a' : '#475569', fontWeight: 700 }}
        >
          About Us
        </Link>
        <Link
          href="/new"
          className="nav-link"
          style={{ color: pathname === '/new' ? '#0f172a' : '#475569', fontWeight: 700 }}
        >
          AI Evaluator
        </Link>
        <Link
          href="/dashboard"
          className="nav-link"
          style={{ color: pathname === '/dashboard' ? '#0f172a' : '#475569', fontWeight: 700 }}
        >
          Dashboard
        </Link>
        <Link
          href="/login"
          className="nav-link"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: pathname === '/login' ? '#0f172a' : '#475569', fontWeight: 700 }}
        >
          <LogIn size={16} /> Login
        </Link>
        <Link
          href="/register"
          className="nav-link"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: pathname === '/register' ? '#0f172a' : '#475569', fontWeight: 700 }}
        >
          <UserPlus size={16} /> Register
        </Link>

        {/* Action Button */}
        <Link href="/new" className="btn-primary" style={{ padding: '10px 22px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Start Interview
        </Link>
      </div>
    </nav>
  );
}
