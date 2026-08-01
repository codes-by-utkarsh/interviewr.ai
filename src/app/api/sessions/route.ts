import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const resumeFile = formData.get('resume') as File | null;
    const jdText = formData.get('jd_text') as string | null;
    const roleTitle = formData.get('role_title') as string | null;

    if (!jdText) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
    }

    let resumeText = '';

    if (resumeFile) {
      const fileBuffer = Buffer.from(await resumeFile.arrayBuffer());
      const fileName = resumeFile.name.toLowerCase();

      if (fileName.endsWith('.pdf')) {
        // Use require for CommonJS compatibility
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require('pdf-parse') as (buffer: Buffer) => Promise<{ text: string }>;
        const data = await pdfParse(fileBuffer);
        resumeText = data.text;
      } else if (fileName.endsWith('.docx')) {
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        resumeText = result.value;
      } else if (fileName.endsWith('.txt')) {
        resumeText = fileBuffer.toString('utf-8');
      } else {
        return NextResponse.json({ error: 'Unsupported file type. Use PDF, DOCX, or TXT.' }, { status: 400 });
      }
    }

    const db = supabaseAdmin();
    const { data: session, error } = await db
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
      console.error('DB error creating session:', error);
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    return NextResponse.json({ session });
  } catch (err) {
    console.error('Error creating session:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = supabaseAdmin();
    const { data: sessions, error } = await db
      .from('sessions')
      .select('id, role_title, status, created_at, started_at, ended_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }

    return NextResponse.json({ sessions });
  } catch (err) {
    console.error('Error fetching sessions:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
