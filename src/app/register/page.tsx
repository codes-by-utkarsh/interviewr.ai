'use client';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Mail, Lock, User, Briefcase, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Full Stack Software Engineer');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Store authenticated user in localStorage
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      setSuccessMsg('Account registered successfully in Supabase! Redirecting to setup...');
      setTimeout(() => {
        window.location.href = '/new';
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf5ef]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 md:p-10">
        <div className="w-full max-w-[500px] bg-white rounded-3xl p-6 md:p-9 shadow-[0_10px_40px_rgba(15,23,42,0.06)] border border-[#e2d9cd]">
          {/* Header */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center gap-1.5 bg-[#d1fae5] text-[#065f46] px-3.5 py-1.5 rounded-full text-xs font-bold mb-3.5">
              <ShieldCheck size={14} /> interviewr.ai Platform by Utkarsh
            </div>
            <h1 className="text-2xl md:text-[28px] font-extrabold text-[#0f172a] tracking-tight mb-2">
              Create your account
            </h1>
            <p className="text-[#475569] text-sm leading-relaxed">
              Set up your profile to start AI-driven technical mock interviews and track hiring feedback in Supabase.
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
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[13px] font-bold text-[#0f172a] mb-2">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  className="input-field pl-11"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b]" />
              </div>
            </div>

            <div className="mt-2">
              <label className="block text-[13px] font-bold text-[#0f172a] mb-2">
                Work Email
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

            <div className="mt-2">
              <label className="block text-[13px] font-bold text-[#0f172a] mb-2">
                Target Role / Domain
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Frontend Developer, DevOps"
                  className="input-field pl-11"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
                <Briefcase size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b]" />
              </div>
            </div>

            <div className="mt-2">
              <label className="block text-[13px] font-bold text-[#0f172a] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  className="input-field pl-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b]" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center p-3.5 text-[15px] mt-2"
            >
              {loading ? 'Creating Profile in Supabase...' : 'Complete Registration'} <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#e2d9cd] text-center text-sm text-[#475569]">
            Already registered?{' '}
            <Link href="/login" className="text-[#0f172a] font-extrabold no-underline hover:underline">
              Log in here
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
