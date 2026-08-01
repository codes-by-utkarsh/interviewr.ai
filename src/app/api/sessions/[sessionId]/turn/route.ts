import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { anthropic, INTERVIEWER_SYSTEM_PROMPT } from '@/lib/anthropic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const { candidateMessage } = await request.json();

    const db = supabaseAdmin();

    // Load session
    const { data: session, error: sessionError } = await db
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Load existing turns
    const { data: turns } = await db
      .from('turns')
      .select('*')
      .eq('session_id', sessionId)
      .order('turn_index', { ascending: true });

    const existingTurns = turns || [];
    const nextTurnIndex = existingTurns.length;

    // Build conversation history for Claude
    const messages: { role: 'user' | 'assistant'; content: string }[] = existingTurns.map((t) => ({
      role: t.role === 'interviewer' ? 'assistant' : 'user',
      content: t.content,
    }));

    // If candidate sent a message, add it
    if (candidateMessage) {
      messages.push({ role: 'user', content: candidateMessage });

      // Save candidate's turn first
      await db.from('turns').insert({
        session_id: sessionId,
        role: 'candidate',
        content: candidateMessage,
        turn_index: nextTurnIndex,
      });
    }

    // Update session status to in_progress if needed
    if (session.status === 'created') {
      await db
        .from('sessions')
        .update({ status: 'in_progress', started_at: new Date().toISOString() })
        .eq('id', sessionId);
    }

    // Call Claude (streaming)
    const systemPrompt = INTERVIEWER_SYSTEM_PROMPT(
      session.resume_text || 'No resume provided.',
      session.jd_text || 'No job description provided.'
    );

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = '';

        try {
          const claudeStream = anthropic.messages.stream({
            model: 'claude-sonnet-4-5',
            max_tokens: 512,
            system: systemPrompt,
            messages: messages.length === 0
              ? [{ role: 'user', content: 'Please begin the interview.' }]
              : messages,
          });

          for await (const chunk of claudeStream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              fullResponse += chunk.delta.text;
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }

          // Save interviewer's response to DB
          const interviewerTurnIndex = candidateMessage ? nextTurnIndex + 1 : nextTurnIndex;
          await db.from('turns').insert({
            session_id: sessionId,
            role: 'interviewer',
            content: fullResponse,
            turn_index: interviewerTurnIndex,
          });

          controller.close();
        } catch (err) {
          console.error('Claude streaming error:', err);
          controller.error(err);
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
