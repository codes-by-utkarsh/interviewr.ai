import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { memGetReport, memGetTurns, memGetSession } from '@/lib/memstore';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const db = supabaseAdmin();

    let report = null;
    let session = null;
    let turns: unknown[] = [];

    // ── Try Supabase first ────────────────────────────────────────────────────
    if (db) {
      const { data: r } = await db
        .from('reports')
        .select('*')
        .eq('session_id', sessionId)
        .single();
      report = r;

      if (report) {
        const { data: s } = await db
          .from('sessions')
          .select('role_title, started_at, ended_at')
          .eq('id', sessionId)
          .single();
        session = s;

        const { data: t } = await db
          .from('turns')
          .select('*')
          .eq('session_id', sessionId)
          .order('turn_index', { ascending: true });
        turns = t ?? [];
      }
    }

    // ── Fall back to in-memory ────────────────────────────────────────────────
    if (!report) {
      report = memGetReport(sessionId);
      if (report) {
        const s = memGetSession(sessionId);
        session = s ? { role_title: s.role_title, started_at: s.started_at, ended_at: s.ended_at } : null;
        turns = memGetTurns(sessionId);
      }
    }

    if (!report) {
      return NextResponse.json({ error: 'Report not found. The interview may still be processing.' }, { status: 404 });
    }

    return NextResponse.json({ report, session, turns });
  } catch (err) {
    console.error('Report fetch error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
