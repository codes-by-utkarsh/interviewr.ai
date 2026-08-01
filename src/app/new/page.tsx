'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function NewInterviewPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [roleTitle, setRoleTitle] = useState('');
  const [jdText, setJdText] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setResumeFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jdText.trim()) {
      setError('Please paste a job description or topic syllabus.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      if (resumeFile) formData.append('resume', resumeFile);
      formData.append('jd_text', jdText);
      formData.append('role_title', roleTitle);

      const res = await fetch('/api/sessions', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to create session');

      router.push(`/interview/${data.session.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      <div
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: '48px 24px',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <div className="badge badge-purple" style={{ marginBottom: '16px' }}>
            🎙️ New Interview Session
          </div>
          <h1
            style={{
              fontSize: '36px',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              marginBottom: '12px',
            }}
          >
            Set Up Your Interview
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7 }}>
            Upload your resume (optional but recommended) and paste the job description or topic syllabus. The AI will tailor every question to your profile.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Role title */}
          <div>
            <label
              htmlFor="role-title"
              style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}
            >
              Role / Topic Label <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
            </label>
            <input
              id="role-title"
              type="text"
              className="input-field"
              placeholder="e.g. Senior React Developer, Cognizant DN 5.0, Python Backend Intern"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
            />
            <p style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
              Used as a label in your dashboard history.
            </p>
          </div>

          {/* Resume upload */}
          <div>
            <label
              style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}
            >
              Resume <span style={{ color: 'var(--text-muted)' }}>(PDF, DOCX, or TXT)</span>
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? 'var(--accent-purple)' : 'var(--border)'}`,
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: dragOver ? 'rgba(139,92,246,0.05)' : 'var(--bg-secondary)',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                id="resume-upload"
                accept=".pdf,.docx,.txt"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setResumeFile(file);
                }}
              />
              {resumeFile ? (
                <div>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
                  <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--accent-green)' }}>
                    {resumeFile.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {(resumeFile.size / 1024).toFixed(0)} KB · Click to change
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>📎</div>
                  <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '6px' }}>
                    Drop your resume here
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    or click to browse · PDF, DOCX, TXT
                  </div>
                </div>
              )}
            </div>
            <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
              Without a resume, the AI will focus entirely on the job description / topic below.
            </p>
          </div>

          {/* JD / Topic */}
          <div>
            <label
              htmlFor="jd-text"
              style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}
            >
              Job Description / Topic Syllabus <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              id="jd-text"
              className="input-field"
              placeholder="Paste the job description, or a topic/syllabus (e.g. Cognizant DN 5.0 handbook, Data Structures & Algorithms topics, System Design concepts)..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              style={{ minHeight: '200px' }}
              required
            />
            <p style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
              Paste as much detail as you have — the more context, the better the questions.
            </p>
          </div>

          {/* Interview type info */}
          <div
            style={{
              background: 'rgba(139,92,246,0.07)',
              border: '1px solid rgba(139,92,246,0.15)',
              borderRadius: '12px',
              padding: '16px 20px',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
            }}
          >
            <span style={{ color: '#a78bfa', fontWeight: 700 }}>ℹ️ What to expect: </span>
            The AI interviewer will greet you, ask for an introduction, probe your resume projects, ask 4–6 technical questions from the JD, do adaptive follow-ups, then close naturally. The session usually takes 10–20 minutes. When you're done, you'll get a full scored report.
          </div>

          {error && (
            <div
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '10px',
                padding: '12px 16px',
                color: '#f87171',
                fontSize: '14px',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '16px' }}
            id="start-interview-btn"
          >
            {loading ? (
              <>
                <span
                  style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.7s linear infinite',
                  }}
                />
                Setting up your interview...
              </>
            ) : (
              '🎙️ Start Interview'
            )}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
