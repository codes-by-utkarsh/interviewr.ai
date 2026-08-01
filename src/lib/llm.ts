/**
 * Multi-provider LLM fallback engine
 *
 * Priority order (first key found in env wins):
 *   1. Anthropic  (claude-sonnet-4-5)
 *   2. Groq       (llama-3.3-70b-versatile  — fastest, free tier)
 *   3. Google     (gemini-1.5-flash)
 *   4. OpenAI     (gpt-4o-mini)
 *
 * Each provider is tried in order; if it throws (rate limit, missing key, etc.)
 * we move on to the next one automatically.
 *
 * Exports two functions:
 *   streamLLM(system, messages)   → AsyncGenerator<string>   (for streaming turns)
 *   callLLM(system, userMessage)  → string                   (for one-shot analysis)
 */

import Anthropic from '@anthropic-ai/sdk';
import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

// ── Type helpers ──────────────────────────────────────────────────────────────
export interface LLMMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ── Provider availability checks ─────────────────────────────────────────────
const hasKey = (key: string | undefined) =>
  !!(key && key.length > 10 && !key.startsWith('your_'));

const providers = () => ({
  anthropic: hasKey(process.env.ANTHROPIC_API_KEY),
  groq: hasKey(process.env.GROQ_API_KEY),
  google: hasKey(process.env.GOOGLE_GENERATIVE_AI_API_KEY),
  openai: hasKey(process.env.OPENAI_API_KEY),
});

export const getActiveProvider = (): string => {
  const p = providers();
  if (p.anthropic) return 'Anthropic (Claude)';
  if (p.groq) return 'Groq (Llama 3.3)';
  if (p.google) return 'Google (Gemini)';
  if (p.openai) return 'OpenAI (GPT-4o-mini)';
  return 'none';
};

export const isAnyLLMConfigured = (): boolean => {
  const p = providers();
  return p.anthropic || p.groq || p.google || p.openai;
};

// ── STREAMING: used during live interview turns ───────────────────────────────
/**
 * Streams the LLM response token by token.
 * Falls through providers until one succeeds.
 * Throws only if ALL providers fail.
 */
export async function* streamLLM(
  systemPrompt: string,
  messages: LLMMessage[]
): AsyncGenerator<string> {
  const p = providers();
  const errors: string[] = [];

  // ── 1. Anthropic ────────────────────────────────────────────────────────────
  if (p.anthropic) {
    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const stream = client.messages.stream({
        model: 'claude-sonnet-4-5',
        max_tokens: 512,
        system: systemPrompt,
        messages: messages.length === 0
          ? [{ role: 'user', content: 'Please begin the interview.' }]
          : messages,
      });
      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          yield chunk.delta.text;
        }
      }
      return; // success — stop here
    } catch (err) {
      errors.push(`Anthropic: ${(err as Error).message}`);
      console.warn('[LLM Fallback] Anthropic failed, trying Groq…', err);
    }
  }

  // ── 2. Groq (streaming) ─────────────────────────────────────────────────────
  if (p.groq) {
    try {
      const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const stream = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 512,
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          ...(messages.length === 0
            ? [{ role: 'user' as const, content: 'Please begin the interview.' }]
            : messages),
        ],
      });
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? '';
        if (text) yield text;
      }
      return;
    } catch (err) {
      errors.push(`Groq: ${(err as Error).message}`);
      console.warn('[LLM Fallback] Groq failed, trying Gemini…', err);
    }
  }

  // ── 3. Google Gemini (streaming) ────────────────────────────────────────────
  if (p.google) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: systemPrompt,
      });

      const history = messages.slice(0, -1).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));
      const lastMessage =
        messages.length > 0
          ? messages[messages.length - 1].content
          : 'Please begin the interview.';

      const chat = model.startChat({ history });
      const result = await chat.sendMessageStream(lastMessage);
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) yield text;
      }
      return;
    } catch (err) {
      errors.push(`Google Gemini: ${(err as Error).message}`);
      console.warn('[LLM Fallback] Gemini failed, trying OpenAI…', err);
    }
  }

  // ── 4. OpenAI (streaming) ───────────────────────────────────────────────────
  if (p.openai) {
    try {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const stream = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 512,
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          ...(messages.length === 0
            ? [{ role: 'user' as const, content: 'Please begin the interview.' }]
            : messages),
        ],
      });
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? '';
        if (text) yield text;
      }
      return;
    } catch (err) {
      errors.push(`OpenAI: ${(err as Error).message}`);
      console.warn('[LLM Fallback] OpenAI failed.', err);
    }
  }

  // All providers failed
  throw new Error(
    `All LLM providers failed. Errors:\n${errors.join('\n')}\n\nPlease add at least one API key to .env.local`
  );
}

// ── ONE-SHOT CALL: used for analysis (non-streaming) ─────────────────────────
/**
 * Single blocking call — returns the full response text.
 * Falls through providers until one succeeds.
 */
export async function callLLM(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 2048
): Promise<string> {
  const p = providers();
  const errors: string[] = [];

  // ── 1. Anthropic ────────────────────────────────────────────────────────────
  if (p.anthropic) {
    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const res = await client.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      });
      return res.content[0].type === 'text' ? res.content[0].text : '';
    } catch (err) {
      errors.push(`Anthropic: ${(err as Error).message}`);
      console.warn('[LLM Fallback] Anthropic failed, trying Groq…', err);
    }
  }

  // ── 2. Groq ─────────────────────────────────────────────────────────────────
  if (p.groq) {
    try {
      const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const res = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      });
      return res.choices[0]?.message?.content ?? '';
    } catch (err) {
      errors.push(`Groq: ${(err as Error).message}`);
      console.warn('[LLM Fallback] Groq failed, trying Gemini…', err);
    }
  }

  // ── 3. Google Gemini ────────────────────────────────────────────────────────
  if (p.google) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: systemPrompt,
      });
      const result = await model.generateContent(userMessage);
      return result.response.text();
    } catch (err) {
      errors.push(`Google Gemini: ${(err as Error).message}`);
      console.warn('[LLM Fallback] Gemini failed, trying OpenAI…', err);
    }
  }

  // ── 4. OpenAI ───────────────────────────────────────────────────────────────
  if (p.openai) {
    try {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const res = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      });
      return res.choices[0]?.message?.content ?? '';
    } catch (err) {
      errors.push(`OpenAI: ${(err as Error).message}`);
    }
  }

  throw new Error(
    `All LLM providers failed.\n${errors.join('\n')}\n\nAdd at least one API key to .env.local`
  );
}
