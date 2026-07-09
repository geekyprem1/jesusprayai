# PrayNote AI

AI prayer journal & Bible note-taker (Next.js 16 + React 19).

Docs (parent folder): `../PrayNote_AI_PRD_NextJS_React.md`, `../ARCHITECTURE.md`, `../PHASE_PLAN.md`.

## Status

| Item | Status |
|---|---|
| Phase 0 scaffold + OpenRouter stub | Done |
| Phase 1 auth + app shell | Done |
| Phase 2 journal cloud + offline + Bible | Done |
| Phase 3 AI + requests + devotionals | Done |
| Phase 4 reminders, PWA, pricing UI, deploy docs | Done |
| SQL migrations | `001`–`004` — run all in Supabase |
| Deploy | See `DEPLOY.md` (no Lemon Squeezy yet) |
| Supabase / OpenRouter keys | **You** fill `.env.local` |
| Lemon Squeezy | Later (Phase PAY) |

### Routes

| Path | Purpose |
|---|---|
| `/` | Marketing landing |
| `/login` · `/signup` | Auth |
| `/app` | App home |
| `/app/journal` | Journal (Supabase when logged in; offline drafts) |
| `/app/bible` | Passage lookup (bible-api.com) |
| `/app/requests` | Placeholder (Phase 3) |
| `/app/settings` | Account / logout |
| `/api/bible/passage` | Bible proxy API |

## Setup

```bash
cd praynote
npm install
cp .env.example .env.local   # if needed
# Fill NEXT_PUBLIC_SUPABASE_* and OPENROUTER_* in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Env (AI)

```bash
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=deepseek/deepseek-v4-flash
# Change model anytime via env only — no code change
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
