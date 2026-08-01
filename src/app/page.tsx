'use client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
  Sparkles,
  Bot,
  Mic,
  Award,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  FileCheck2
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf5ef]">
      <Navbar />

      {/* Hero Section matching clean corporate layout */}
      <section className="px-4 py-12 md:px-8 md:py-20 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column */}
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 bg-white border border-[#e2d9cd] px-4 py-2 rounded-full text-xs md:text-sm font-bold text-[#0f172a] mb-7 shadow-sm">
              <Sparkles size={16} color="#f59e0b" /> interviewr.ai by Utkarsh
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-[60px] font-extrabold text-[#0f172a] leading-tight tracking-tight mb-6 font-['Plus_Jakarta_Sans',sans-serif]">
              FEARLESS <br />
              <span className="inline-block bg-[#1e1b4b] text-white px-5 py-2 rounded-xl text-3xl md:text-[44px] mt-2 -rotate-1">
                in cracking interviews
              </span>
            </h1>

            <p className="text-base md:text-lg leading-relaxed text-[#475569] mb-9 max-w-xl font-medium">
              Simulate high-stakes technical & behavioral video calls with our adaptive AI Interviewer. Get instant real-time evaluation, domain scoring, and competency reports.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Link
                href="/new"
                className="btn-primary w-full sm:w-auto justify-center py-4 px-9 text-base rounded-full"
              >
                Get interviewr.ai <ArrowRight size={18} />
              </Link>
              <Link
                href="/register"
                className="btn-ghost w-full sm:w-auto justify-center py-3.5 px-8 text-[15px] rounded-full bg-white"
              >
                Candidate Sign Up
              </Link>
            </div>

            {/* Quick stats badges */}
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 mt-11 pt-7 border-t border-[#e2d9cd]">
              <div>
                <div className="text-2xl font-extrabold text-[#0f172a]">100,000+</div>
                <div className="text-xs text-[#64748b] font-semibold mt-1">Assessments Completed</div>
              </div>
              <div className="hidden sm:block w-[1px] bg-[#e2d9cd]"></div>
              <div>
                <div className="text-2xl font-extrabold text-[#0f172a]">98.4%</div>
                <div className="text-xs text-[#64748b] font-semibold mt-1">Evaluation Accuracy</div>
              </div>
              <div className="hidden sm:block w-[1px] bg-[#e2d9cd]"></div>
              <div>
                <div className="text-2xl font-extrabold text-[#0f172a]">Zero</div>
                <div className="text-xs text-[#64748b] font-semibold mt-1">LLM Provider Latency</div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="relative order-1 lg:order-2">
            <div className="bg-white rounded-3xl p-5 md:p-8 border border-[#e2d9cd] shadow-[0_20px_50px_rgba(15,23,42,0.08)] relative">
              {/* Card Title */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                </div>
                <span className="text-xs font-bold text-[#64748b]">interviewr.ai Live Call Room</span>
              </div>

              {/* Mock Screen Content */}
              <div className="h-64 md:h-72 bg-[#1e1b4b] rounded-2xl flex flex-col items-center justify-center text-white text-center p-6 relative overflow-hidden">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-amber-500 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(245,158,11,0.5)]">
                  <Bot size={32} className="w-8 h-8 md:w-10 md:h-10 text-[#0f172a]" />
                </div>
                <h3 className="text-base md:text-lg font-bold">Alex — Senior AI Hiring Partner</h3>
                <p className="text-xs md:text-[13px] text-slate-300 mt-1 px-4">"Tell me about a complex technical architecture you led recently."</p>

                {/* Subtitle bar */}
                <div className="absolute bottom-3 left-3 right-3 bg-black/60 px-3 py-2 rounded-lg text-[10px] md:text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5 truncate mr-2">
                    <Mic size={12} className="text-emerald-500 shrink-0" /> Candidate Microphone Active
                  </span>
                  <span className="bg-red-500 px-2 py-0.5 rounded text-[9px] md:text-[10px] font-extrabold shrink-0">LIVE</span>
                </div>
              </div>

              {/* Floating Feature Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <div className="bg-[#fdfbf7] p-3 rounded-xl border border-[#e2d9cd] flex items-center gap-2.5">
                  <ShieldCheck size={20} className="text-amber-500 shrink-0" />
                  <div>
                    <div className="text-[13px] font-bold text-[#0f172a] leading-tight">Multi-LLM Chain</div>
                    <div className="text-[11px] text-[#64748b]">Anthropic, Groq, Gemini</div>
                  </div>
                </div>
                <div className="bg-[#fdfbf7] p-3 rounded-xl border border-[#e2d9cd] flex items-center gap-2.5">
                  <BarChart3 size={20} className="text-blue-600 shrink-0" />
                  <div>
                    <div className="text-[13px] font-bold text-[#0f172a] leading-tight">Instant Scoring</div>
                    <div className="text-[11px] text-[#64748b]">Detailed PDF Reports</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Banner */}
      <section className="bg-white px-4 py-16 md:px-8 md:py-20 border-y border-[#e2d9cd]">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f172a] mb-3">
            Unleashing Fearless Hiring & Interviewing
          </h2>
          <p className="text-[#64748b] text-base md:text-lg max-w-2xl mx-auto mb-12">
            Built for enterprise candidates and hiring teams to deliver structured, bias-free, high-fidelity technical assessments.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            <div className="bg-[#faf5ef] p-6 md:p-8 rounded-2xl border border-[#e2d9cd] text-left">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-5">
                <Mic size={24} className="text-amber-500" />
              </div>
              <h3 className="text-lg font-extrabold text-[#0f172a] mb-2.5">
                Real-Time Voice Call
              </h3>
              <p className="text-[#475569] text-sm leading-relaxed">
                Full duplex audio interaction with adaptive Speech-to-Text and low-latency response models.
              </p>
            </div>

            <div className="bg-[#faf5ef] p-6 md:p-8 rounded-2xl border border-[#e2d9cd] text-left">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-5">
                <FileCheck2 size={24} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-extrabold text-[#0f172a] mb-2.5">
                Resume & Syllabus Context
              </h3>
              <p className="text-[#475569] text-sm leading-relaxed">
                Upload your PDF resume or job description to generate tailored questions matching exact domain requirements.
              </p>
            </div>

            <div className="bg-[#faf5ef] p-6 md:p-8 rounded-2xl border border-[#e2d9cd] text-left">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-5">
                <Award size={24} className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-extrabold text-[#0f172a] mb-2.5">
                Competency Reports
              </h3>
              <p className="text-[#475569] text-sm leading-relaxed">
                Receive immediate overall scores, category radar breakdowns, strengths, and actionable feedback post-call.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
