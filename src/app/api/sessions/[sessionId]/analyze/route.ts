import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { anthropic, ANALYZER_SYSTEM_PROMPT } from '@/lib/anthropic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
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

    // Mark as completed
    await db
      .from('sessions')
      .update({ status: 'completed', ended_at: new Date().toISOString() })
      .eq('id', sessionId);

    // Load full transcript
    const { data: turns } = await db
      .from('turns')
      .select('*')
      .eq('session_id', sessionId)
      .order('turn_index', { ascending: true });

    const transcript = (turns || [])
      .map((t) => `${t.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${t.content}`)
      .join('\n\n');

    // Call Claude for analysis
    const analyzerPrompt = ANALYZER_SYSTEM_PROMPT(
      session.resume_text || 'No resume provided.',
      session.jd_text || 'No job description provided.',
      transcript
    );

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      messages: [{ role: 'user', content: 'Please analyze this interview.' }],
      system: analyzerPrompt,
    });

    const rawContent = response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse JSON — Claude should return pure JSON per prompt instructions
    let reportData;
    try {
      // Strip any accidental markdown fences
      const cleaned = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      reportData = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse Claude JSON report:', rawContent);
      return NextResponse.json({ error: 'Failed to parse analysis result' }, { status: 500 });
    }

    // Save report
    const { data: report, error: reportError } = await db
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

    if (reportError) {
      console.error('DB error saving report:', reportError);
      return NextResponse.json({ error: 'Failed to save report' }, { status: 500 });
    }

    // Update session status
    await db
      .from('sessions')
      .update({ status: 'analyzed' })
      .eq('id', sessionId);

    return NextResponse.json({ report });
  } catch (err) {
    console.error('Analyze API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
