import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { memCreateSession, memListSessions } from '@/lib/memstore';
import { isAnyLLMConfigured, getActiveProvider } from '@/lib/llm';

export async function POST(request: NextRequest) {
  try {
    // ── Guard: need at least one LLM ─────────────────────────────────────────
    if (!isAnyLLMConfigured()) {
      return NextResponse.json(
        {
          error:
            'No AI provider configured. Add at least one of: ANTHROPIC_API_KEY, GROQ_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY, or OPENAI_API_KEY to your .env.local file.',
        },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const resumeFile = formData.get('resume') as File | null;
    const jdText = formData.get('jd_text') as string | null;
    const roleTitle = formData.get('role_title') as string | null;

    if (!jdText?.trim()) {
      return NextResponse.json(
        { error: 'Job description is required.' },
        { status: 400 }
      );
    }

    // ── Extract resume text ──────────────────────────────────────────────────
    let resumeText = '';
    if (resumeFile && resumeFile.size > 0) {
      const fileBuffer = Buffer.from(await resumeFile.arrayBuffer());
      const fileName = resumeFile.name.toLowerCase();

      if (fileName.endsWith('.pdf')) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>;
        const data = await pdfParse(fileBuffer);
        resumeText = data.text;
      } else if (fileName.endsWith('.docx')) {
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        resumeText = result.value;
      } else if (fileName.endsWith('.txt')) {
        resumeText = fileBuffer.toString('utf-8');
      } else {
        return NextResponse.json(
          { error: 'Unsupported file type. Use PDF, DOCX, or TXT.' },
          { status: 400 }
        );
      }
    }

    // ── Persist session: Supabase first, then in-memory ──────────────────────
    const db = supabaseAdmin();
    let session;

    if (db) {
      const { data, error } = await db
        .from('sessions')
        .insert({
          resume_text: resumeText || null,
          jd_text: jdText,
          role_title: roleTitle || null,
          status: 'created',
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error, falling back to in-memory:', error.message);
        session = memCreateSession({ resume_text: resumeText, jd_text: jdText, role_title: roleTitle });
      } else {
        session = data;
      }
    } else {
      // No Supabase — use in-memory store
      session = memCreateSession({ resume_text: resumeText, jd_text: jdText, role_title: roleTitle });
    }

    return NextResponse.json({
      session,
      _provider: getActiveProvider(),
      _storage: db ? 'supabase' : 'memory',
    });
  } catch (err) {
    console.error('POST /api/sessions error:', err);
    return NextResponse.json(
      { error: `Server error: ${(err as Error).message}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = supabaseAdmin();

    if (db) {
      const { data: sessions, error } = await db
        .from('sessions')
        .select('id, role_title, status, created_at, started_at, ended_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        // Fall through to memory
        console.warn('Supabase list failed, using memory:', error.message);
        return NextResponse.json({ sessions: memListSessions(), _storage: 'memory' });
      }

      return NextResponse.json({ sessions, _storage: 'supabase' });
    }

    return NextResponse.json({ sessions: memListSessions(), _storage: 'memory' });
  } catch (err) {
    console.error('GET /api/sessions error:', err);
    return NextResponse.json({ sessions: [], error: (err as Error).message });
  }
}
