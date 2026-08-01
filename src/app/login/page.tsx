'use client';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      // Store authenticated user in localStorage
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      if (data.session) {
        localStorage.setItem('supabase_session', JSON.stringify(data.session));
      }

      setSuccessMsg('Authenticated with Supabase! Redirecting to dashboard...');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf5ef]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 md:p-10">
        <div className="w-full max-w-[460px] bg-white rounded-3xl p-6 md:p-9 shadow-[0_10px_40px_rgba(15,23,42,0.06)] border border-[#e2d9cd]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 bg-[#fef3c7] text-[#92400e] px-3.5 py-1.5 rounded-full text-xs font-bold mb-3.5">
              <ShieldCheck size={14} /> interviewr.ai Platform by Utkarsh
            </div>
            <h1 className="text-2xl md:text-[28px] font-extrabold text-[#0f172a] tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-[#475569] text-sm leading-relaxed">
              Sign in to access your interviewr.ai assessments and performance analytics.
            </p>
          </div>

          {/* Error / Success Notifications */}
          {error && (
            <div className="bg-[#ffe4e6] border border-[#fecdd3] rounded-xl px-4 py-3 text-[#9f1239] text-sm mb-5 flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0" /> {error}
            </div>
          )}

          {successMsg && (
            <div className="bg-[#d1fae5] border border-[#a7f3d0] rounded-xl px-4 py-3 text-[#065f46] text-sm mb-5 flex items-center gap-2">
              <CheckCircle2 size={18} className="shrink-0" /> {successMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-[13px] font-bold text-[#0f172a] mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="candidate@company.com"
                  className="input-field pl-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[13px] font-bold text-[#0f172a]">
                  Password
                </label>
                <a href="#" className="text-xs text-[#f59e0b] font-bold no-underline hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  className="input-field pl-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b]" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-[13px] text-[#475569] cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="accent-[#f59e0b] w-4 h-4"
                />
                Keep me signed in
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-navy w-full justify-center p-3.5 text-[15px]"
            >
              {loading ? 'Verifying with Supabase...' : 'Sign In with Supabase'} <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-7 pt-6 border-t border-[#e2d9cd] text-center text-sm text-[#475569]">
            Don't have an assessment account?{' '}
            <Link href="/register" className="text-[#f59e0b] font-bold no-underline hover:underline">
              Register candidate profile
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
