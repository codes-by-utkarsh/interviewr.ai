# 🚀 Deployment Guide for interviewr.ai

`interviewr.ai by Utkarsh` is built on Next.js 15+ (App Router) and is optimized for zero-config deployment on **Vercel**, **Netlify**, or **Render**.

---

## ⚡ Option 1: Deploy on Vercel (Recommended — 1-Click Free Tier)

Vercel is created by the makers of Next.js and provides instant deployment with automatic SSL, global CDN, and edge serverless API routes.

### Step 1: Push Code to GitHub / GitLab
1. Initialize Git and commit your repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for interviewr.ai"
   ```
2. Push to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/interviewr.ai.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Import into Vercel
1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **"Add New..." → "Project"**.
3. Select your `interviewr.ai` GitHub repository.

### Step 3: Add Environment Variables in Vercel Dashboard
Under **Environment Variables**, paste the following keys from your `.env.local`:

| Variable Key | Description |
|---|---|
| `GROQ_API_KEY` | Groq Llama 3.3 / Whisper STT Key |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini 1.5 Flash Key |
| `OPENAI_API_KEY` | OpenAI GPT-4o-mini & Whisper Key |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL (`https://...supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Public Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Admin Service Role Key |
| `ELEVENLABS_API_KEY` | ElevenLabs TTS Key |

### Step 4: Click Deploy!
Click **Deploy**. Your app will build in ~40 seconds and give you a live production URL (e.g., `https://interviewr-ai.vercel.app`).

---

## 🛠️ Option 2: Deploy using Vercel CLI (Direct from Command Line)

If you have Node.js installed, you can deploy in 30 seconds directly from your terminal:

```bash
# 1. Install Vercel CLI globally
npm i -g vercel

# 2. Deploy to production
vercel --prod
```

Vercel will prompt you to log in, link your project, and upload the build automatically.

---

## 🐳 Option 3: Deploy via Docker / Render / VPS

If deploying to Docker or Render:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]
```

---

## ✅ Post-Deployment Verification Checklist
1. Visit your live production URL.
2. Go to `/register` and test creating a candidate account in Supabase.
3. Go to `/new` and launch a mock video call room to verify speech synthesis & LLM evaluation!
