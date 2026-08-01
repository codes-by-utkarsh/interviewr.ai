import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const db = supabaseAdmin();

    const { data: report, error } = await db
      .from('reports')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Also get session info
    const { data: session } = await db
      .from('sessions')
      .select('role_title, started_at, ended_at, resume_text, jd_text')
      .eq('id', sessionId)
      .single();

    // Get transcript
    const { data: turns } = await db
      .from('turns')
      .select('*')
      .eq('session_id', sessionId)
      .order('turn_index', { ascending: true });

    return NextResponse.json({ report, session, turns: turns || [] });
  } catch (err) {
    console.error('Report fetch error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
