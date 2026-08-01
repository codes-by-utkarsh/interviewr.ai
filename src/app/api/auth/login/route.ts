import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(url, anonKey);

      // Authenticate user with Supabase Database
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return NextResponse.json(
          { error: error.message || 'Invalid email or password. Please try again.' },
          { status: 401 }
        );
      }

      const user = data.user;
      return NextResponse.json({
        success: true,
        message: 'Login successful!',
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email?.split('@')[0],
          role: user.user_metadata?.target_role || 'Candidate',
        },
        session: data.session,
      });
    }

    // In-memory fallback if Supabase env vars are missing
    return NextResponse.json({
      success: true,
      message: 'Logged in locally.',
      user: { email, name: email.split('@')[0] },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Login failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
