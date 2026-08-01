-- Run this in your Supabase SQL Editor to set up the schema

-- Sessions: one row per mock interview session
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,                             -- nullable for anonymous usage
  resume_text text,
  jd_text text,                             -- job description or topic/syllabus text
  role_title text,                          -- short label e.g. "Senior React Developer"
  status text default 'created',            -- created | in_progress | completed | analyzed
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz default now()
);

-- Turns: every conversational turn (both AI and candidate)
create table if not exists turns (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  role text not null,                        -- 'interviewer' | 'candidate'
  content text not null,
  audio_url text,                            -- optional, if you store recordings
  created_at timestamptz default now(),
  turn_index int not null
);

-- Reports: the final generated report for a session
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade unique,
  overall_score int,
  category_scores jsonb,                     -- {"communication": 78, "technical_depth": 65, ...}
  strengths jsonb,                           -- array of {quote, comment}
  improvements jsonb,                        -- array of {quote, comment, better_answer}
  summary text,
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_turns_session_id on turns(session_id);
create index if not exists idx_turns_session_turn on turns(session_id, turn_index);
create index if not exists idx_sessions_created on sessions(created_at desc);
