# PrayNote AI — Deploy (Phase 4)

Payments (Lemon Squeezy) are **not** part of this deploy.

## Prerequisites

1. Supabase project with migrations run in order:
   - `001_profiles.sql`
   - `002_prayer_entries.sql`
   - `003_phase3_ai_requests.sql`
   - `004_reminders.sql`
   - `005_security_hardening.sql` (plan_tier lock, AI quotas, RLS fixes)
2. OpenRouter key + model env
3. Vercel account linked to this repo / folder

## Vercel project

```bash
cd praynote
npx vercel
# production:
npx vercel --prod
```

Or: Vercel Dashboard → Import `praynote` directory as root.

## Environment variables (Production)

| Variable | Required |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (cron + admin) |
| `OPENROUTER_API_KEY` | Yes (AI) |
| `OPENROUTER_MODEL` | Yes e.g. `deepseek/deepseek-v4-flash` |
| `OPENROUTER_SITE_URL` | Prod URL |
| `OPENROUTER_SITE_NAME` | `PrayNote AI` |
| `NEXT_PUBLIC_APP_URL` | Prod URL |
| `CRON_SECRET` | Yes (random string for `/api/cron/reminders`) |
| `RESEND_API_KEY` | Optional (email reminders) |
| `RESEND_FROM_EMAIL` | Optional |
| `NEXT_PUBLIC_POSTHOG_KEY` | Optional |
| `NEXT_PUBLIC_POSTHOG_HOST` | Optional |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional |
| `BIBLE_API_KEY` | Optional |

**Do not** set Lemon Squeezy vars until Phase PAY.

## Cron

`vercel.json` schedules:

```
GET /api/cron/reminders  daily at 12:00 UTC
```

> **Hobby plan:** Vercel only allows **once-per-day** crons. Upgrade to Pro for `*/5` (every 5 min) if you need tighter reminder delivery.

Vercel sends `Authorization: Bearer $CRON_SECRET` when `CRON_SECRET` is set.

Manual test:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://YOUR_DOMAIN/api/cron/reminders
```

## Supabase Auth URLs

In Supabase → Authentication → URL config:

- Site URL: `https://your-domain.vercel.app`
- Redirect URLs:
  - `https://your-domain.vercel.app/**`
  - `https://your-domain.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback` (local)

### Google sign-in (required for “Continue with Google”)

1. **Google Cloud Console** → APIs & Services → Credentials → Create OAuth 2.0 Client ID (Web)
2. Authorized JavaScript origins:
   - `https://your-domain.vercel.app`
   - `http://localhost:3000`
3. Authorized redirect URIs (important — Supabase URL, not your app):
   - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
4. **Supabase** → Authentication → Providers → **Google** → Enable  
   paste Client ID + Client Secret → Save
5. Run migration `006_google_oauth_profile.sql` (display name from Google)

App routes: login/signup show **Continue with Google** → `/auth/callback` exchanges the code.

## After deploy checklist

- [ ] `/` landing loads  
- [ ] Signup / login works  
- [ ] Journal save + AI  
- [ ] `/app/bible` passage  
- [ ] `/pricing` shows Coming soon on paid  
- [ ] Settings reminder save  
- [ ] Cron endpoint returns 401 without secret, 200 with secret  

## PWA

Production-ready Progressive Web App:

| Piece | Path |
|---|---|
| Manifest | `public/manifest.webmanifest` |
| Service worker | `public/sw.js` (register via `RegisterServiceWorker`) |
| Offline page | `/offline` |
| Icons | `public/icons/*` (regenerate: `npm run pwa:icons`) |
| Install UI | `InstallPrompt` + header/settings `InstallButton` |

**Caching:** static = cache-first; navigations = network-first → `/offline`; **never** caches `/api/*`, auth, or cross-origin (Supabase).

**Verify after deploy (HTTPS only):**
1. Chrome DevTools → Application → Manifest (icons, theme, start_url)
2. Application → Service Workers → activated
3. Lighthouse → Progressive Web App
4. Network offline → `/offline` message
5. Install banner / “Install PrayNote” on eligible Chrome
