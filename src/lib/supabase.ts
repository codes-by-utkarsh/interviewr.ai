import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ── Env-var guard ────────────────────────────────────────────────────────────
export const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(
    url && url !== 'your_supabase_project_url_here' &&
    anon && anon !== 'your_supabase_anon_key_here'
  );
};

// ── Lazy browser client ───────────────────────────────────────────────────────
let _supabase: SupabaseClient | null = null;
export const getSupabase = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) return null;
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _supabase;
};

// ── Lazy server-side admin client (service role) ──────────────────────────────
// Returns null when not configured so API routes can fall back to in-memory mode
export const supabaseAdmin = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) return null;
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!svcKey || svcKey === 'your_supabase_service_role_key_here') return null;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    svcKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
};
