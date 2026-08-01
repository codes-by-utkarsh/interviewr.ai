'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { UploadCloud, CheckCircle2, AlertCircle, ArrowRight, Info, FileText, Sparkles, Video } from 'lucide-react';

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
    <div style={{ minHeight: '100vh', background: '#faf5ef' }}>
      <Navbar />

      <div
        style={{
          maxWidth: '760px',
          margin: '0 auto',
          padding: '48px 24px',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <div className="badge badge-yellow" style={{ marginBottom: '16px', display: 'inline-flex' }}>
            <Sparkles size={14} /> interviewr.ai Evaluator Setup
          </div>
          <h1
            style={{
              fontSize: '36px',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.03em',
              marginBottom: '12px',
            }}
          >
            Configure Your Mock Interview
          </h1>
          <p style={{ color: '#475569', fontSize: '16px', lineHeight: 1.7, maxWidth: 600, margin: '0 auto' }}>
            Upload candidate resume and job specs. The AI hiring partner will generate specialized domain questions for your video call.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '36px 32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Role title */}
            <div>
              <label
                htmlFor="role-title"
                style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}
              >
                Target Role Title / Topic Label <span style={{ color: '#64748b', fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                id="role-title"
                type="text"
                className="input-field"
                placeholder="e.g. Senior Full Stack Engineer, System Design, Cognizant DN 5.0"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
              />
              <p style={{ marginTop: '6px', fontSize: '12px', color: '#64748b' }}>
                Used as a reference tag in your evaluation report dashboard.
              </p>
            </div>

            {/* Resume upload */}
            <div>
              <label
                style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}
              >
                Candidate Resume <span style={{ color: '#64748b', fontWeight: 400 }}>(PDF, DOCX, or TXT)</span>
              </label>
              <label
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                htmlFor="resume-upload"
                style={{
                  border: `2px dashed ${dragOver ? '#f59e0b' : '#cbd5e1'}`,
                  borderRadius: '16px',
                  padding: '32px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: dragOver ? '#fef3c7' : '#fdfbf7',
                  display: 'block',
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
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <CheckCircle2 size={36} color="#059669" />
                    <div style={{ fontWeight: 700, fontSize: '16px', color: '#059669' }}>
                      {resumeFile.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {(resumeFile.size / 1024).toFixed(0)} KB · Click to change file
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <UploadCloud size={42} color="#f59e0b" />
                    <div style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a' }}>
                      Click to upload resume PDF
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      or drag and drop your file here
                    </div>
                  </div>
                )}
              </label>
            </div>

            {/* JD / Topic */}
            <div>
              <label
                htmlFor="jd-text"
                style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}
              >
                Job Description / Syllabus Content <span style={{ color: '#e11d48' }}>*</span>
              </label>
              <textarea
                id="jd-text"
                className="input-field"
                placeholder="Paste the job description or assessment syllabus here..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                style={{ minHeight: '180px' }}
                required
              />
            </div>

            {/* Info box */}
            <div
              style={{
                background: '#fef3c7',
                border: '1px solid #fde68a',
                borderRadius: '12px',
                padding: '16px 20px',
                fontSize: '13px',
                color: '#92400e',
                lineHeight: 1.6,
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
              }}
            >
              <Info size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ fontWeight: 700 }}>Assessment Process:</strong> Clicking below launches a live 1:1 video call with Alex (interviewr.ai Senior AI Recruiter). Once completed, you will receive your full competency evaluation.
              </div>
            </div>

            {error && (
              <div
                style={{
                  background: '#ffe4e6',
                  border: '1px solid #fecdd3',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  color: '#9f1239',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <AlertCircle size={18} /> {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-navy"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '16px', borderRadius: '999px' }}
              id="start-interview-btn"
            >
              {loading ? 'Initializing Video Call...' : (
                <>
                  <Video size={18} /> Start Video Call Assessment <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
