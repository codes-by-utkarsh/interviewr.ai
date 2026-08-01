'use client';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Mail, Lock, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      window.location.href = '/dashboard';
    }, 800);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#faf5ef' }}>
      <Navbar />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div
          style={{
            maxWidth: 460,
            width: '100%',
            background: '#ffffff',
            borderRadius: 24,
            padding: '40px 36px',
            boxShadow: '0 10px 40px rgba(15, 23, 42, 0.06)',
            border: '1px solid #e2d9cd',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fef3c7', color: '#92400e', padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 14 }}>
              <ShieldCheck size={14} /> Enterprise Candidate Assessment
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 8 }}>
              Welcome back
            </h1>
            <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.6 }}>
              Sign in to access your HirePro interview assessments and performance analytics.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  placeholder="candidate@company.com"
                  className="input-field"
                  style={{ paddingLeft: 42 }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                  Password
                </label>
                <a href="#" style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700, textDecoration: 'none' }}>
                  Forgot password?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  className="input-field"
                  style={{ paddingLeft: 42 }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  style={{ accentColor: '#f59e0b', width: 16, height: 16 }}
                />
                Keep me signed in
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-navy"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 }}
            >
              {loading ? 'Authenticating...' : 'Sign In to HirePro'} <ArrowRight size={18} />
            </button>
          </form>

          <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid #e2d9cd', textAlign: 'center', fontSize: 14, color: '#475569' }}>
            Don't have an assessment account?{' '}
            <Link href="/register" style={{ color: '#f59e0b', fontWeight: 700, textDecoration: 'none' }}>
              Register candidate profile
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
