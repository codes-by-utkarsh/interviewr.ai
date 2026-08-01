'use client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
  Sparkles,
  Bot,
  Mic,
  Award,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Target,
  FileCheck2
} from 'lucide-react';

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#faf5ef' }}>
      <Navbar />

      {/* Hero Section matching HirePro screenshot */}
      <section style={{ padding: '60px 32px 80px', maxWidth: 1280, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 48, alignItems: 'center' }}>
          
          {/* Left Column: Typography matching screenshot */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#ffffff',
                border: '1px solid #e2d9cd',
                padding: '8px 18px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 700,
                color: '#0f172a',
                marginBottom: 28,
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              <Sparkles size={16} color="#f59e0b" /> Powered by Enterprise AI Assessment Engine
            </div>

            <h1
              style={{
                fontSize: '60px',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                marginBottom: 24,
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
            >
              FEARLESS <br />
              <span
                style={{
                  display: 'inline-block',
                  background: '#1e1b4b',
                  color: '#ffffff',
                  padding: '6px 20px',
                  borderRadius: '12px',
                  fontSize: '44px',
                  marginTop: '8px',
                  transform: 'rotate(-1deg)',
                }}
              >
                in cracking interviews
              </span>
            </h1>

            <p
              style={{
                fontSize: '18px',
                lineHeight: 1.7,
                color: '#475569',
                marginBottom: 36,
                maxWidth: 540,
                fontWeight: 500,
              }}
            >
              Simulate high-stakes technical & behavioral video calls with our adaptive AI Interviewer. Get instant real-time evaluation, domain scoring, and competency reports.
            </p>

            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/new"
                className="btn-primary"
                style={{ padding: '16px 36px', fontSize: '16px', borderRadius: '999px' }}
              >
                Get HirePro AI <ArrowRight size={18} />
              </Link>
              <Link
                href="/register"
                className="btn-ghost"
                style={{ padding: '15px 30px', fontSize: '15px', borderRadius: '999px', background: '#ffffff' }}
              >
                Candidate Sign Up
              </Link>
            </div>

            {/* Quick stats badges */}
            <div style={{ display: 'flex', gap: 24, marginTop: 44, paddingTop: 28, borderTop: '1px solid #e2d9cd' }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>100,000+</div>
                <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Assessments Completed</div>
              </div>
              <div style={{ width: 1, background: '#e2d9cd' }} />
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>98.4%</div>
                <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Evaluation Accuracy</div>
              </div>
              <div style={{ width: 1, background: '#e2d9cd' }} />
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>Zero</div>
                <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>LLM Provider Latency</div>
              </div>
            </div>
          </div>

          {/* Right Column: High Quality Graphic / Candidate Illustration */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                background: '#ffffff',
                borderRadius: 28,
                padding: 32,
                border: '1px solid #e2d9cd',
                boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)',
                position: 'relative',
              }}
            >
              {/* Card Title */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>HirePro Live Call Room</span>
              </div>

              {/* Mock Screen Content */}
              <div
                style={{
                  height: 280,
                  background: '#1e1b4b',
                  borderRadius: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  textAlign: 'center',
                  padding: 24,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    boxShadow: '0 0 30px rgba(245, 158, 11, 0.5)',
                  }}
                >
                  <Bot size={40} color="#0f172a" />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Alex — Senior AI Hiring Partner</h3>
                <p style={{ fontSize: 13, color: '#cbd5e1', marginTop: 4 }}>"Tell me about a complex technical architecture you led recently."</p>

                {/* Subtitle bar */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 12,
                    left: 16,
                    right: 16,
                    background: 'rgba(0,0,0,0.6)',
                    padding: '8px 14px',
                    borderRadius: 8,
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Mic size={14} color="#10b981" /> Candidate Microphone Active
                  </span>
                  <span style={{ background: '#ef4444', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 800 }}>LIVE</span>
                </div>
              </div>

              {/* Floating Feature Tags */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                <div style={{ background: '#fdfbf7', padding: '12px 16px', borderRadius: 12, border: '1px solid #e2d9cd', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ShieldCheck size={20} color="#f59e0b" />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Multi-LLM Chain</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Anthropic, Groq, Gemini</div>
                  </div>
                </div>
                <div style={{ background: '#fdfbf7', padding: '12px 16px', borderRadius: 12, border: '1px solid #e2d9cd', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <BarChart3 size={20} color="#2563eb" />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Instant Scoring</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Detailed PDF Reports</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Banner */}
      <section style={{ background: '#ffffff', padding: '60px 32px', borderTop: '1px solid #e2d9cd', borderBottom: '1px solid #e2d9cd' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
            Unleashing Fearless Hiring & Interviewing
          </h2>
          <p style={{ color: '#64748b', fontSize: 16, maxWidth: 640, margin: '0 auto 48px' }}>
            Built for enterprise candidates and hiring teams to deliver structured, bias-free, high-fidelity technical assessments.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28 }}>
            
            <div style={{ background: '#faf5ef', padding: 32, borderRadius: 20, border: '1px solid #e2d9cd', textAlign: 'left' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <Mic size={24} color="#f59e0b" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>
                Real-Time Voice Call
              </h3>
              <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.6 }}>
                Full duplex audio interaction with adaptive Speech-to-Text and low-latency response models.
              </p>
            </div>

            <div style={{ background: '#faf5ef', padding: 32, borderRadius: 20, border: '1px solid #e2d9cd', textAlign: 'left' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <FileCheck2 size={24} color="#2563eb" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>
                Resume & Syllabus Context
              </h3>
              <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.6 }}>
                Upload your PDF resume or job description to generate tailored questions matching exact domain requirements.
              </p>
            </div>

            <div style={{ background: '#faf5ef', padding: 32, borderRadius: 20, border: '1px solid #e2d9cd', textAlign: 'left' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <Award size={24} color="#059669" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>
                Competency Reports
              </h3>
              <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.6 }}>
                Receive immediate overall scores, category radar breakdowns, strengths, and actionable feedback post-call.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
