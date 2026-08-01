import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const hasKey = (k?: string) => !!(k && k.length > 10 && !k.startsWith('your_'));

// ElevenLabs voice ID — "Adam" (professional male, clear)
const ELEVEN_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    if (!text?.trim()) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const errors: string[] = [];

    // ── 1. ElevenLabs (most natural voice) ───────────────────────────────────
    if (hasKey(process.env.ELEVENLABS_API_KEY)) {
      try {
        const res = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE_ID}/stream`,
          {
            method: 'POST',
            headers: {
              'xi-api-key': process.env.ELEVENLABS_API_KEY!,
              'Content-Type': 'application/json',
              Accept: 'audio/mpeg',
            },
            body: JSON.stringify({
              text,
              model_id: 'eleven_turbo_v2_5',
              voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.2 },
            }),
          }
        );
        if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
        const audioBuffer = await res.arrayBuffer();
        return new NextResponse(audioBuffer, {
          headers: { 'Content-Type': 'audio/mpeg', 'X-TTS-Provider': 'elevenlabs' },
        });
      } catch (err) {
        errors.push(`ElevenLabs: ${(err as Error).message}`);
        console.warn('[TTS] ElevenLabs failed, trying OpenAI…');
      }
    }

    // ── 2. OpenAI TTS (very natural, reliable) ────────────────────────────────
    if (hasKey(process.env.OPENAI_API_KEY)) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const response = await openai.audio.speech.create({
          model: 'tts-1',
          voice: 'onyx',       // deep, professional
          input: text,
          speed: 0.95,
        });
        const buffer = Buffer.from(await response.arrayBuffer());
        return new NextResponse(buffer, {
          headers: { 'Content-Type': 'audio/mpeg', 'X-TTS-Provider': 'openai' },
        });
      } catch (err) {
        errors.push(`OpenAI TTS: ${(err as Error).message}`);
        console.warn('[TTS] OpenAI TTS failed.');
      }
    }

    // ── No server TTS → tell client to use browser speechSynthesis ───────────
    return NextResponse.json(
      { error: 'no_server_tts', fallback: 'speech_synthesis', errors },
      { status: 503 }
    );
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
