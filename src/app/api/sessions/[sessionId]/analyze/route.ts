import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { callLLM } from '@/lib/llm';
import { ANALYZER_SYSTEM_PROMPT } from '@/lib/anthropic';
import {
  memGetSession,
  memUpdateSession,
  memGetTurns,
  memSaveReport,
} from '@/lib/memstore';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const db = supabaseAdmin();

    // ── Load session ─────────────────────────────────────────────────────────
    let session: Record<string, unknown> | null = null;
    let turns: { role: string; content: string; turn_index: number }[] = [];

    if (db) {
      const { data: s } = await db.from('sessions').select('*').eq('id', sessionId).single();
      session = s;
      if (session) {
        const { data: t } = await db
          .from('turns')
          .select('*')
          .eq('session_id', sessionId)
          .order('turn_index', { ascending: true });
        turns = t ?? [];
      }
    }

    if (!session) {
      session = memGetSession(sessionId) as Record<string, unknown> | null;
      if (session) turns = memGetTurns(sessionId);
    }

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // ── Mark session completed ────────────────────────────────────────────────
    const now = new Date().toISOString();
    if (db) {
      await db.from('sessions').update({ status: 'completed', ended_at: now }).eq('id', sessionId);
    }
    memUpdateSession(sessionId, { status: 'completed', ended_at: now });

    // ── Build transcript ──────────────────────────────────────────────────────
    const transcript = turns
      .map((t) => `${t.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${t.content}`)
      .join('\n\n');

    if (!transcript.trim()) {
      return NextResponse.json({ error: 'No conversation found to analyze.' }, { status: 400 });
    }

    // ── Call LLM for analysis (with fallback) ─────────────────────────────────
    const analyzerPrompt = ANALYZER_SYSTEM_PROMPT(
      (session.resume_text as string) || 'No resume provided.',
      (session.jd_text as string) || 'No job description provided.',
      transcript
    );

    const rawContent = await callLLM(analyzerPrompt, 'Please analyze this interview.', 2048);

    // ── Parse JSON ────────────────────────────────────────────────────────────
    let reportData;
    try {
      const cleaned = rawContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      reportData = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse LLM analysis JSON:', rawContent.slice(0, 500));
      return NextResponse.json(
        { error: 'Analysis returned invalid JSON. Try ending the interview with more exchanges.' },
        { status: 500 }
      );
    }

    // ── Save report: Supabase first, then in-memory ───────────────────────────
    let report;
    if (db) {
      const { data, error } = await db
        .from('reports')
        .insert({
          session_id: sessionId,
          overall_score: reportData.overall_score,
          category_scores: reportData.category_scores,
          strengths: reportData.strengths,
          improvements: reportData.improvements,
          summary: reportData.summary,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase report insert failed, saving to memory:', error.message);
        report = memSaveReport({ session_id: sessionId, ...reportData });
      } else {
        report = data;
        // Update session to analyzed
        await db.from('sessions').update({ status: 'analyzed' }).eq('id', sessionId);
      }
    } else {
      report = memSaveReport({ session_id: sessionId, ...reportData });
    }

    memUpdateSession(sessionId, { status: 'analyzed' });

    return NextResponse.json({ report });
  } catch (err) {
    console.error('Analyze API error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
