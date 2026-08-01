import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const hasKey = (k?: string) => !!(k && k.length > 10 && !k.startsWith('your_'));

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    const mimeType = (formData.get('mimeType') as string) || 'audio/webm';

    if (!audioFile || audioFile.size < 100) {
      return NextResponse.json({ error: 'No audio received' }, { status: 400 });
    }

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const errors: string[] = [];

    // ── 1. Deepgram (fastest, streaming-grade accuracy) ───────────────────────
    if (hasKey(process.env.DEEPGRAM_API_KEY)) {
      try {
        const res = await fetch(
          'https://api.deepgram.com/v1/listen?model=nova-2&language=en&smart_format=true&punctuate=true',
          {
            method: 'POST',
            headers: {
              Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
              'Content-Type': mimeType,
            },
            body: audioBuffer,
          }
        );
        if (!res.ok) throw new Error(`Deepgram ${res.status}: ${await res.text()}`);
        const data = await res.json();
        const transcript =
          data?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? '';
        if (transcript.trim()) {
          return NextResponse.json({ transcript, provider: 'deepgram' });
        }
        throw new Error('Deepgram returned empty transcript');
      } catch (err) {
        errors.push(`Deepgram: ${(err as Error).message}`);
        console.warn('[STT] Deepgram failed, trying Whisper…');
      }
    }

    // ── 2. Groq Whisper (free & ultra-fast) ──────────────────────────────────
    if (hasKey(process.env.GROQ_API_KEY)) {
      try {
        const { Groq } = await import('groq-sdk');
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm';
        const file = new File([audioBuffer], `recording.${ext}`, { type: mimeType });
        const result = await groq.audio.transcriptions.create({
          file,
          model: 'whisper-large-v3-turbo',
          language: 'en',
        });
        if (result.text?.trim()) {
          return NextResponse.json({ transcript: result.text, provider: 'groq-whisper' });
        }
        throw new Error('Groq Whisper returned empty transcript');
      } catch (err) {
        errors.push(`Groq Whisper: ${(err as Error).message}`);
        console.warn('[STT] Groq Whisper failed, trying OpenAI Whisper…');
      }
    }

    // ── 3. OpenAI Whisper ─────────────────────────────────────────────────────
    if (hasKey(process.env.OPENAI_API_KEY)) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm';
        const file = new File([audioBuffer], `recording.${ext}`, { type: mimeType });
        const result = await openai.audio.transcriptions.create({
          file,
          model: 'whisper-1',
          language: 'en',
        });
        if (result.text?.trim()) {
          return NextResponse.json({ transcript: result.text, provider: 'whisper' });
        }
        throw new Error('Whisper returned empty transcript');
      } catch (err) {
        errors.push(`Whisper: ${(err as Error).message}`);
        console.warn('[STT] Whisper failed.');
      }
    }

    // ── No server-side STT available → tell client to use Web Speech API ─────
    return NextResponse.json(
      { error: 'no_server_stt', fallback: 'web_speech', errors },
      { status: 503 }
    );
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
