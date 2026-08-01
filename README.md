# interviewr.ai

> AI-powered mock interview platform — upload your resume, practice with an adaptive AI interviewer, get a scored feedback report.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router) + Vanilla CSS |
| AI (Interviewer + Analyzer) | Anthropic Claude API (claude-sonnet-4-5) |
| Database | Supabase (Postgres) |
| File Parsing | `pdf-parse` (PDF), `mammoth` (DOCX) |
| STT (Phase 1) | Browser Web Speech API (free, Chrome) |
| TTS (Phase 1) | Browser `speechSynthesis` (free) |

---

## Getting Started

### 1. Environment Variables

Copy `.env.local` and fill in your keys:

```bash
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 2. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → run the schema from `supabase/schema.sql`
3. Copy your **Project URL** and **anon/service role keys** from Settings → API

### 3. Anthropic API Key

Get one at [console.anthropic.com](https://console.anthropic.com) → API Keys.

### 4. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── sessions/
│   │       ├── route.ts                  # POST (create session), GET (list)
│   │       └── [sessionId]/
│   │           ├── turn/route.ts         # POST — streaming AI turn
│   │           ├── analyze/route.ts      # POST — generate report
│   │           └── report/route.ts       # GET — fetch report
│   ├── page.tsx                          # Landing page
│   ├── new/page.tsx                      # Interview setup
│   ├── interview/[sessionId]/page.tsx    # Live session
│   ├── report/[sessionId]/page.tsx       # Post-interview report
│   ├── dashboard/page.tsx                # Session history
│   └── globals.css                       # Design system
├── components/
│   └── Navbar.tsx
└── lib/
    ├── anthropic.ts      # Claude client + all prompts
    ├── supabase.ts       # Supabase client (anon + admin)
    └── types.ts          # TypeScript interfaces
```

---

## User Flow

1. **`/`** — Landing page → click **Start Interview**
2. **`/new`** — Upload resume (PDF/DOCX/TXT) + paste JD → click **Start**
3. **`/interview/[id]`** — Live chat with AI interviewer (streaming). Use text or enable **Voice Mode** (Chrome only). Click **End Interview** when done.
4. **`/report/[id]`** — Score, category breakdown, strengths, improvement areas, full transcript.
5. **`/dashboard`** — History of all past sessions.

---

## Phase Roadmap

| Phase | Status | Description |
|---|---|---|
| Phase 1 | ✅ Done | Text-based interview + full report |
| Phase 2 | 🔜 Next | Voice via Deepgram STT + ElevenLabs TTS |
| Phase 3 | 🔜 | Live captions, session timer auto-wrap, progress tracking |
| Phase 4 | 🔜 | Avatar animation, session recording playback |

### Upgrading to Deepgram + ElevenLabs (Phase 2)

Add to `.env.local`:
```
DEEPGRAM_API_KEY=...
ELEVENLABS_API_KEY=...
```

Then swap the browser `Web Speech API` / `speechSynthesis` calls in `interview/[sessionId]/page.tsx` with Deepgram streaming and ElevenLabs TTS — the backend API routes don't change at all.

---

## Deployment (Vercel + Supabase)

1. Push to GitHub
2. Create a Vercel project → import repo
3. Add environment variables in Vercel dashboard
4. Deploy — your app is live

---

## Cost Awareness

- **Claude API**: ~21 calls per session (1 per turn + 1 for analysis) — very cheap
- **Browser STT/TTS**: Free (Web Speech API / speechSynthesis)
- **Supabase**: Free tier supports thousands of sessions
- **Vercel**: Free tier is sufficient for most usage
