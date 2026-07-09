# PrayNote AI — Deploy (Phase 4)

Payments (Lemon Squeezy) are **not** part of this deploy.

## Prerequisites

1. Supabase project with migrations run in order:
   - `001_profiles.sql`
   - `002_prayer_entries.sql`
   - `003_phase3_ai_requests.sql`
   - `004_reminders.sql`
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
GET /api/cron/reminders  every 5 minutes
```

Vercel sends `Authorization: Bearer $CRON_SECRET` when `CRON_SECRET` is set.

Manual test:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://YOUR_DOMAIN/api/cron/reminders
```

## Supabase Auth URLs

In Supabase → Authentication → URL config:

- Site URL: `https://your-domain.vercel.app`
- Redirect URLs: `https://your-domain.vercel.app/**`

## After deploy checklist

- [ ] `/` landing loads  
- [ ] Signup / login works  
- [ ] Journal save + AI  
- [ ] `/app/bible` passage  
- [ ] `/pricing` shows Coming soon on paid  
- [ ] Settings reminder save  
- [ ] Cron endpoint returns 401 without secret, 200 with secret  

## PWA

Production only: service worker registers from `RegisterServiceWorker`.  
Installable via browser “Add to Home Screen” when HTTPS.
