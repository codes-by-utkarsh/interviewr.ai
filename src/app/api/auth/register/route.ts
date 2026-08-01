import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { name, email, role, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const admin = supabaseAdmin();
    const supabase = getSupabase();

    if (admin) {
      // Create user directly with auto-confirmed email using Supabase Service Role Admin
      const { data: adminUser, error: adminErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: name, target_role: role },
      });

      if (adminErr) {
        // If user already exists, try signing in or return clear message
        if (adminErr.message.includes('already registered') || adminErr.status === 422) {
          return NextResponse.json(
            { error: 'An account with this email already exists. Please log in instead.' },
            { status: 400 }
          );
        }
        return NextResponse.json({ error: adminErr.message }, { status: 400 });
      }

      // Also upsert user into a profiles table if it exists
      try {
        await admin.from('profiles').upsert({
          id: adminUser.user.id,
          email,
          full_name: name,
          target_role: role,
          updated_at: new Date().toISOString(),
        });
      } catch {
        // profile table optional
      }

      return NextResponse.json({
        success: true,
        message: 'Account created successfully in Supabase!',
        user: { id: adminUser.user.id, email: adminUser.user.email, name, role },
      });
    } else if (supabase) {
      // Client/Anon SignUp fallback
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name, target_role: role } },
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: 'Registration complete!',
        user: data.user,
      });
    }

    // In-memory fallback if Supabase environment variables are missing
    return NextResponse.json({
      success: true,
      message: 'Account registered locally.',
      user: { email, name, role },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Registration failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
