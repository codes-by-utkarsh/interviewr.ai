/**
 * In-memory store — used as a fallback when Supabase is not configured.
 * Data lives only for the lifetime of the Next.js server process.
 * Use Supabase for production persistence.
 */

import { Session, Turn, Report } from './types';

interface InMemoryStore {
  sessions: Map<string, Session>;
  turns: Map<string, Turn[]>;       // keyed by sessionId
  reports: Map<string, Report>;     // keyed by sessionId
}

// Singleton (persists across API calls within one server process)
const store: InMemoryStore = {
  sessions: new Map(),
  turns: new Map(),
  reports: new Map(),
};

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ── Sessions ─────────────────────────────────────────────────────────────────
export function memCreateSession(data: {
  resume_text?: string | null;
  jd_text: string;
  role_title?: string | null;
}): Session {
  const id = generateId();
  const session: Session = {
    id,
    user_id: null,
    resume_text: data.resume_text ?? null,
    jd_text: data.jd_text,
    role_title: data.role_title ?? null,
    status: 'created',
    started_at: null,
    ended_at: null,
    created_at: new Date().toISOString(),
  };
  store.sessions.set(id, session);
  store.turns.set(id, []);
  return session;
}

export function memGetSession(id: string): Session | null {
  return store.sessions.get(id) ?? null;
}

export function memUpdateSession(
  id: string,
  patch: Partial<Session>
): Session | null {
  const s = store.sessions.get(id);
  if (!s) return null;
  const updated = { ...s, ...patch };
  store.sessions.set(id, updated);
  return updated;
}

export function memListSessions(): Session[] {
  return Array.from(store.sessions.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

// ── Turns ─────────────────────────────────────────────────────────────────────
export function memAddTurn(data: {
  session_id: string;
  role: 'interviewer' | 'candidate';
  content: string;
  turn_index: number;
}): Turn {
  const turn: Turn = {
    id: generateId(),
    session_id: data.session_id,
    role: data.role,
    content: data.content,
    created_at: new Date().toISOString(),
    turn_index: data.turn_index,
  };
  const list = store.turns.get(data.session_id) ?? [];
  list.push(turn);
  store.turns.set(data.session_id, list);
  return turn;
}

export function memGetTurns(session_id: string): Turn[] {
  return (store.turns.get(session_id) ?? []).sort(
    (a, b) => a.turn_index - b.turn_index
  );
}

// ── Reports ───────────────────────────────────────────────────────────────────
export function memSaveReport(data: Omit<Report, 'id' | 'created_at'>): Report {
  const report: Report = {
    ...data,
    id: generateId(),
    created_at: new Date().toISOString(),
  };
  store.reports.set(data.session_id, report);
  return report;
}

export function memGetReport(session_id: string): Report | null {
  return store.reports.get(session_id) ?? null;
}
