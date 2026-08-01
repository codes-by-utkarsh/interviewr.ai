'use client';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Mail, Lock, User, Briefcase, ArrowRight, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Full Stack Software Engineer');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      window.location.href = '/new';
    }, 800);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#faf5ef' }}>
      <Navbar />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div
          style={{
            maxWidth: 500,
            width: '100%',
            background: '#ffffff',
            borderRadius: 24,
            padding: '40px 36px',
            boxShadow: '0 10px 40px rgba(15, 23, 42, 0.06)',
            border: '1px solid #e2d9cd',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#d1fae5', color: '#065f46', padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 14 }}>
              <ShieldCheck size={14} /> interviewr.ai Platform by Utkarsh
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 8 }}>
              Create your account
            </h1>
            <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.6 }}>
              Set up your profile to start AI-driven technical mock interviews and track hiring feedback.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  className="input-field"
                  style={{ paddingLeft: 42 }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <User size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                Work Email
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
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                Target Role / Domain
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Frontend Developer, DevOps"
                  className="input-field"
                  style={{ paddingLeft: 42 }}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
                <Briefcase size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  placeholder="At least 8 characters"
                  className="input-field"
                  style={{ paddingLeft: 42 }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, marginTop: 8 }}
            >
              {loading ? 'Creating Profile...' : 'Complete Registration'} <ArrowRight size={18} />
            </button>
          </form>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #e2d9cd', textAlign: 'center', fontSize: 14, color: '#475569' }}>
            Already registered?{' '}
            <Link href="/login" style={{ color: '#0f172a', fontWeight: 800, textDecoration: 'none' }}>
              Log in here
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
