import { NextResponse } from 'next/server';
import { getActiveProvider, isAnyLLMConfigured } from '@/lib/llm';
import { isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  const llmProvider = getActiveProvider();
  const llmReady = isAnyLLMConfigured();
  const dbReady = isSupabaseConfigured();

  const providers = {
    anthropic: !!(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.length > 10 && !process.env.ANTHROPIC_API_KEY.startsWith('your_')),
    groq: !!(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.length > 10 && !process.env.GROQ_API_KEY.startsWith('your_')),
    google: !!(process.env.GOOGLE_GENERATIVE_AI_API_KEY && process.env.GOOGLE_GENERATIVE_AI_API_KEY.length > 10 && !process.env.GOOGLE_GENERATIVE_AI_API_KEY.startsWith('your_')),
    openai: !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 10 && !process.env.OPENAI_API_KEY.startsWith('your_')),
  };

  return NextResponse.json({
    status: llmReady ? 'ok' : 'degraded',
    llm: {
      ready: llmReady,
      active_provider: llmProvider,
      fallback_order: ['Anthropic (Claude)', 'Groq (Llama 3.3)', 'Google (Gemini)', 'OpenAI (GPT-4o-mini)'],
      providers,
    },
    database: {
      supabase: dbReady,
      fallback: 'in-memory (data lost on server restart)',
    },
    message: llmReady
      ? `Ready. Using ${llmProvider}. Storage: ${dbReady ? 'Supabase' : 'in-memory'}.`
      : 'Add at least one LLM API key to .env.local to use the app.',
  });
}
