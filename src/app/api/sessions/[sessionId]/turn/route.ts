import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { streamLLM, LLMMessage } from '@/lib/llm';
import { INTERVIEWER_SYSTEM_PROMPT } from '@/lib/anthropic';
import {
  memGetSession,
  memUpdateSession,
  memGetTurns,
  memAddTurn,
} from '@/lib/memstore';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const { candidateMessage } = await request.json();

    const db = supabaseAdmin();

    // ── Load session ─────────────────────────────────────────────────────────
    let session: Record<string, unknown> | null = null;
    let existingTurns: { role: string; content: string; turn_index: number }[] = [];

    if (db) {
      const { data: s } = await db.from('sessions').select('*').eq('id', sessionId).single();
      session = s;
      if (session) {
        const { data: t } = await db
          .from('turns')
          .select('*')
          .eq('session_id', sessionId)
          .order('turn_index', { ascending: true });
        existingTurns = t ?? [];
      }
    }

    // Fall back to in-memory if DB returned nothing
    if (!session) {
      session = memGetSession(sessionId) as Record<string, unknown> | null;
      if (session) existingTurns = memGetTurns(sessionId);
    }

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // ── Save candidate turn ──────────────────────────────────────────────────
    const nextTurnIndex = existingTurns.length;

    if (candidateMessage) {
      if (db) {
        await db.from('turns').insert({
          session_id: sessionId,
          role: 'candidate',
          content: candidateMessage,
          turn_index: nextTurnIndex,
        });
      } else {
        memAddTurn({ session_id: sessionId, role: 'candidate', content: candidateMessage, turn_index: nextTurnIndex });
      }
    }

    // ── Update status to in_progress ─────────────────────────────────────────
    if (session.status === 'created') {
      const now = new Date().toISOString();
      if (db) {
        await db.from('sessions').update({ status: 'in_progress', started_at: now }).eq('id', sessionId);
      } else {
        memUpdateSession(sessionId, { status: 'in_progress', started_at: now });
      }
    }

    // ── Build messages array for LLM ─────────────────────────────────────────
    const messages: LLMMessage[] = existingTurns.map((t) => ({
      role: t.role === 'interviewer' ? 'assistant' : 'user',
      content: t.content,
    }));

    if (candidateMessage) {
      messages.push({ role: 'user', content: candidateMessage });
    }

    // ── Stream from LLM (with automatic fallback) ────────────────────────────
    const systemPrompt = INTERVIEWER_SYSTEM_PROMPT(
      (session.resume_text as string) || 'No resume provided.',
      (session.jd_text as string) || 'No job description provided.'
    );

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = '';
        try {
          for await (const token of streamLLM(systemPrompt, messages)) {
            fullResponse += token;
            controller.enqueue(encoder.encode(token));
          }

          // Save interviewer turn
          const interviewerIndex = nextTurnIndex + (candidateMessage ? 1 : 0);
          if (db) {
            await db.from('turns').insert({
              session_id: sessionId,
              role: 'interviewer',
              content: fullResponse,
              turn_index: interviewerIndex,
            });
          } else {
            memAddTurn({ session_id: sessionId, role: 'interviewer', content: fullResponse, turn_index: interviewerIndex });
          }

          controller.close();
        } catch (err) {
          const msg = `\n\n[Error: ${(err as Error).message}]`;
          controller.enqueue(encoder.encode(msg));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (err) {
    console.error('Turn API error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
