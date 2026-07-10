# PrayNote AI — Security Audit Report

**Product:** PrayNote AI (`praynote/`)  
**Stack:** Next.js 16 · Supabase · OpenRouter · Whisper  
**Initial audit:** 2026-07-10  
**Remediation pass:** 2026-07-10 (critical / high fixes applied in code)  
**Mode:** Static red-team review + remediation verification  

---

## Status at a glance

| Metric | Initial (pre-fix) | **Current (post-fix)** |
|--------|---------------------|---------------------------|
| **Overall Security Score** | 58 / 100 | **76 / 100** |
| **Launch Readiness Score** | 45 / 100 | **72 / 100** |
| **Open Critical findings** | 2+ | **0 in code** (SQL must be applied) |
| **Open High findings** | Many | **2–3 residual** (dashboard / infra) |

### Current verdict

| Launch mode | Ready? |
|-------------|--------|
| Internal / 5–10 trusted users | **Yes** (after running migration 005) |
| Eternal Faith soft post | **Yes**, if 005 is applied + email confirm ON |
| Viral ads / heavy traffic | **Not yet** — add Cloudflare, global rate limits (Redis/Upstash), spend caps |

**Must do before any public traffic:**

1. Run `supabase/migrations/005_security_hardening.sql` in Supabase SQL Editor  
2. Supabase Auth → **Confirm email** ON  
3. Set strong `CRON_SECRET` in production  
4. OpenRouter + OpenAI **billing spend caps**  

---

## Attack surface (unchanged)

| Surface | Paths |
|---------|--------|
| Server Actions | `app/auth`, `journal`, `ai`, `requests`, `reminders`, `insights`, `devotional` |
| HTTP APIs | `/api/bible/passage`, `/api/ai/transcribe`, `/api/cron/reminders` |
| Middleware | Gates `/app/*`; prod fails closed without Supabase |
| DB | profiles, prayer_*, verse_cache, reminders, devotionals, **ai_usage_daily** |
| Client storage | `localStorage` journal + offline drafts |
| Security helpers | `lib/security/*` (safe-next, rate-limit, limits, ai-quota) |

---

## Remediation summary (what we fixed)

| # | Finding | Severity | Status | Where |
|---|---------|----------|--------|--------|
| 1 | Unlimited AI / Whisper cost | Critical | **FIXED** | `lib/security/ai-quota.ts`, `app/ai/actions.ts`, insights, transcribe |
| 2 | `plan_tier` self-escalation | Critical | **FIXED** (SQL) | `005_security_hardening.sql` trigger |
| 3 | Open redirect after login | High | **FIXED** | `lib/security/safe-next.ts`, `app/auth/actions.ts`, login page |
| 4 | Auth brute force (app-level) | High | **PARTIAL** | In-memory rate limit on signIn/signUp; no CAPTCHA yet |
| 5 | Weak password (min 6) | Medium | **FIXED** | Min **10** chars (`LIMITS.passwordMinLength`) |
| 6 | Public Bible API abuse | High | **FIXED** | IP rate limit 60/min + ref length cap |
| 7 | Whisper cost / unauth | High | **FIXED** | Auth always required; daily quota; 5MB max; MIME allowlist |
| 8 | Missing security headers | High | **FIXED** | `next.config.ts` (CSP, HSTS, XFO, nosniff, Referrer-Policy) |
| 9 | `verse_cache` poison writes | Medium | **FIXED** (SQL) | Client writes dropped in 005 |
| 10 | Versions write without entry ownership | Medium | **FIXED** (SQL) | RLS policy in 005 |
| 11 | No body max length | Medium | **FIXED** | Prayer 10k; request title/desc caps |
| 12 | Prompt injection | Medium | **OPEN** (mitigated) | Bible API still resolves verses; no extra jailbreak filter |
| 13 | localStorage prayer data | Medium | **OPEN** | Still plain localStorage |
| 14 | Cron response leaks user ids | Low–Med | **FIXED** | Prod response omits detailed `results` |
| 15 | Middleware open without Supabase | Medium | **FIXED** | Production → **503** |
| 16 | Payment webhooks | N/A | **N/A** | Not shipped yet |
| 17 | Weak Whisper file checks | Medium | **FIXED** | Size + MIME |
| 18 | XSS | Low | **OK** | Export still escapes HTML |
| 19 | CSRF | Low | **OK** | Server Actions origin checks |
| 20 | Secrets in client | — | **OK** | Service role server-only |
| 21 | Logging prayer text | Low | **OPEN** | Avoid Sentry body capture manually |
| 22 | SW caches `/app` HTML | Low–Med | **OPEN** | `public/sw.js` still network-first caches navigate |
| 23 | npm audit (postcss) | Low | **OPEN** | 2 moderate via Next; wait for upstream |
| 24 | Main IDOR paths | — | **OK** | user_id + RLS pattern intact |
| 25 | Business free unlimited | High | **FIXED** (quotas) | Daily AI/Whisper caps |
| 26 | Email verification | Medium | **MANUAL** | Enable in Supabase dashboard |
| 27 | Multi-session / device list | Low | **OPEN** | Acceptable for MVP |

---

## Current limits (`lib/security/limits.ts`)

| Limit | Value |
|-------|--------|
| Prayer body max | 10,000 characters |
| Request title / description | 200 / 5,000 |
| AI calls per user per UTC day | **20** |
| Whisper per user per UTC day | **10** |
| Whisper max upload | **5 MB** |
| Bible API per IP per minute | **60** |
| Transcribe per IP per minute | **10** |
| Auth attempts per IP+email / 15 min | **30** |
| Password minimum | **10** characters |

Change quotas here: `lib/security/limits.ts`.

---

## Findings detail (with status)

### FINDING 1 — Unlimited AI cost / DoS → FIXED

**Original severity:** Critical  

**Fix applied:**
- `consumeAiQuota()` before AI in `runAiForEntry` and weekly insight LLM  
- Whisper uses separate daily counter  
- Table: `ai_usage_daily` (migration 005)  

**Files:**
- `lib/security/ai-quota.ts`
- `app/ai/actions.ts`
- `app/insights/actions.ts`
- `app/api/ai/transcribe/route.ts`
- `supabase/migrations/005_security_hardening.sql`

**Residual risk:** In-memory IP limits are per-serverless-instance (not global). For viral traffic, add Upstash/Redis. Soft-allows if table missing (migration not run) — **run 005**.

---

### FINDING 2 — `plan_tier` self-escalation → FIXED (SQL required)

**Original severity:** Critical  

**Fix applied:** Trigger `protect_profile_billing` blocks non–`service_role` changes to `plan_tier` and `lemonsqueezy_customer_id`.

**File:** `supabase/migrations/005_security_hardening.sql`

**Verify after migration:**
```sql
-- as authenticated user should fail:
update profiles set plan_tier = 'church_pro' where id = auth.uid();
```

---

### FINDING 3 — Open redirect → FIXED

**Original severity:** High  

**Fix:** `safeNextPath()` rejects `//host`, `\`, `://`, overlong paths.

**Files:**
- `lib/security/safe-next.ts`
- `app/auth/actions.ts`
- `app/(auth)/login/page.tsx`
- `lib/supabase/middleware.ts` (stores safe `next` on login redirect)

---

### FINDING 4 — Auth rate limiting → PARTIAL

**Original severity:** High  

**Fix:** App-level rate limit on signIn/signUp (30 / 15 min / IP+email).  

**Still open:**
- CAPTCHA (Turnstile / hCaptcha)  
- Supabase dashboard Auth rate limits  
- Global IP ban list  

---

### FINDING 5 — Weak password → FIXED

Min length **10** in server action + signup form `minLength={10}`.

---

### FINDING 6 — Bible proxy abuse → FIXED

- Rate limit 60/min/IP  
- Reference max length 120  
- Empty ref rejected  

**File:** `app/api/bible/passage/route.ts`

---

### FINDING 7 — Whisper abuse → FIXED

- Always requires login (no “open when Supabase off”)  
- Production without Supabase → 503  
- Daily whisper quota  
- 5MB max; MIME allowlist  

---

### FINDING 8 — Security headers → FIXED

**File:** `next.config.ts`

Headers set:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` (mic self only)
- `Strict-Transport-Security`
- `Content-Security-Policy` (baseline; may need tuning for analytics)

---

### FINDING 9 — verse_cache poisoning → FIXED (SQL)

Authenticated **write/update** policies removed. Users can still **read**. Client upsert fails softly.

---

### FINDING 10 — prayer_entry_versions ownership → FIXED (SQL)

RLS requires parent entry owned by `auth.uid()`.

---

### FINDING 11 — Body size → FIXED

Journal + prayer requests reject oversized text.

---

### FINDING 12 — Prompt injection → OPEN (mitigated)

Still possible to try jailbreaks in prayer text. Mitigations:
- JSON schema parse  
- Verse **text** from Bible APIs, not free-form LLM  
- Body truncated to 4k for model  

**Nice later:** classify abuse, strip HTML from `reason`.

---

### FINDING 13 — localStorage → OPEN

Prayers may sit in browser storage unencrypted.  

**Nice later:** clear on logout; encrypt; warn shared devices.

---

### FINDING 14 — Cron info leak → FIXED

Production response: `{ ok, processed }` only (no per-user `results`).

---

### FINDING 15 — Fail-closed middleware → FIXED

Production without Supabase env → **503** text response.

---

### FINDING 22 — Service worker cache → OPEN

`public/sw.js` may cache navigations to `/app`. Shared devices: minor privacy risk.

**Nice later:** network-only for `/app/*` authenticated routes.

---

## Score breakdown (post-fix)

| Area | Before | After | Notes |
|------|--------|-------|--------|
| Auth | 55 | **72** | safe redirect, password, soft rate limit |
| Authorization / IDOR | 72 | **85** | plan_tier + versions + cache locked |
| Database / RLS | 70 | **88** | if 005 applied |
| API | 50 | **78** | rate limits + auth on Whisper |
| AI abuse | 25 | **75** | daily quotas; not global bot farm proof |
| Upload | 60 | **80** | size/MIME/auth/quota |
| XSS | 75 | **75** | unchanged |
| Secrets | 80 | **82** | unchanged pattern |
| Headers / infra | 30 | **80** | next.config headers |
| Privacy | 65 | **68** | localStorage / SW still open |
| Dependencies | 70 | **70** | npm moderate open |

| Rollup | Score |
|--------|-------|
| **Overall Security** | **76 / 100** |
| **Launch Readiness** | **72 / 100** (with 005 applied + email confirm) |

---

## OWASP Top 10 (updated)

| OWASP | Status now |
|-------|------------|
| A01 Broken Access Control | Improved — billing fields protected (SQL) |
| A02 Cryptographic Failures | localStorage still plain |
| A03 Injection | Low SQL risk; prompt residual |
| A04 Insecure Design | Quotas added; global RL still weak |
| A05 Security Misconfiguration | Headers + fail-closed added |
| A06 Vulnerable Components | 2 moderate npm |
| A07 Auth Failures | Better; CAPTCHA optional still open |
| A08 Software/Data Integrity | verse_cache writes locked |
| A09 Logging/Monitoring | Still manual |
| A10 SSRF | Bible proxy rate-limited |

---

## Security checklist

### Code (done in repo)

- [x] AI daily quotas  
- [x] Whisper auth + quota + size/MIME  
- [x] Bible API IP rate limit  
- [x] Auth attempt rate limit (in-memory)  
- [x] `safeNextPath` on login redirect  
- [x] Security headers + CSP baseline  
- [x] Prod fail-closed without Supabase  
- [x] Body size limits  
- [x] Password min 10  
- [x] Cron response sanitized in prod  
- [x] Migration 005 written for plan_tier / versions / cache / ai_usage_daily  

### You must do (ops / dashboard)

- [ ] **Run** `005_security_hardening.sql` in Supabase  
- [ ] Supabase **email confirmation** ON  
- [ ] Strong random `CRON_SECRET` in Vercel  
- [ ] Confirm `SUPABASE_SERVICE_ROLE_KEY` never `NEXT_PUBLIC_`  
- [ ] OpenRouter spend cap  
- [ ] OpenAI spend cap  
- [ ] 2-user manual test: A cannot read B’s journal  
- [x] Privacy policy page live (`/privacy`, `/disclaimer`, `/terms`)  
- [ ] (Recommended) Cloudflare in front of Vercel  
- [ ] (Recommended) CAPTCHA on signup  

### Still open (nice-to-have)

- [ ] Clear localStorage on logout  
- [ ] SW: do not cache authenticated `/app` HTML  
- [ ] Global Redis/Upstash rate limits  
- [ ] Prompt-injection hardening tests  
- [ ] Session “sign out all devices”  
- [ ] npm postcss advisory when Next patches  

---

## Privacy checklist

- [x] No public prayer feed in product design  
- [x] Server actions scope by `user_id`  
- [x] RLS on core tables (verify after 005)  
- [ ] Manual 2-account isolation test  
- [ ] localStorage cleared on logout  
- [ ] Analytics: no prayer body to PostHog/Sentry  
- [ ] Privacy policy linked from site  

---

## Production hardening checklist

- [x] HSTS header in Next config  
- [x] X-Frame-Options DENY  
- [x] CSP baseline  
- [ ] HTTPS custom domain + Vercel SSL  
- [ ] Provider spend caps  
- [ ] Backup + restore still has RLS  
- [ ] Key rotation runbook  
- [ ] Monitor 401 / 429 / 5xx  

---

## How to apply DB security (required)

In **Supabase → SQL Editor**, run in order if not already:

1. `001_profiles.sql`  
2. `002_prayer_entries.sql`  
3. `003_phase3_ai_requests.sql`  
4. `004_reminders.sql`  
5. **`005_security_hardening.sql`** ← security pass  

Then smoke-test:

1. Sign up / log in with password ≥ 10 chars  
2. Write prayer → AI verses (counts as 1 AI use)  
3. After 20 AI calls same day → should block  
4. Try `?next=//evil.com` on login → should land on `/app` not evil  
5. As user, try update `plan_tier` via client → should error  

---

## New security modules (reference)

```
lib/security/
  safe-next.ts      # open-redirect protection
  rate-limit.ts     # in-memory sliding window
  limits.ts         # all numeric caps
  ai-quota.ts       # DB daily AI/Whisper counters
```

```
supabase/migrations/
  005_security_hardening.sql
```

---

## Launch recommendation (updated)

| Mode | Ready? | Condition |
|------|--------|-----------|
| **Internal beta** | Yes | Run 005 |
| **FB soft launch (Eternal Faith)** | Yes | 005 + email confirm + spend caps |
| **Paid ads / viral** | Not yet | Global rate limits + WAF + monitoring |

---

## Document control

| Field | Value |
|-------|--------|
| Product | PrayNote AI |
| Repo path | `praynote/` |
| Related | `DEPLOY.md`, `ARCHITECTURE.md`, `PHASE2_PRODUCT_PLAN.md` |
| Next action | Run 005 → manual isolation test → soft launch |
| Re-audit when | Lemon Squeezy payments, church multi-tenant, file storage |

---

*Initial audit score 58 → post-remediation ~76. Remaining risk is mostly ops (migration + dashboard) and scale (global rate limits).*
