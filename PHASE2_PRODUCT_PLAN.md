# PrayNote AI — Phase 2 Product Plan (Post-MVP)

**Version:** 1.0  
**Date:** July 2026  
**Status:** Active  
**App path:** `praynote/`  
**Repo:** https://github.com/geekyprem1/jesusprayai  
**Depends on:** MVP Phases 0–4 complete (auth, journal, AI verses, requests, Bible, landing, mobile)

---

## Goal

After MVP, grow **retention → revenue → church scale** — not random features.

**North stars (6 months, from PRD):**
- Sticky daily/weekly use  
- Free → paid conversion  
- Path to church B2B  

---

## Rules

1. **Todos + this plan** — har slice pehle plan, phir code.  
2. **Payment (Lemon Squeezy)** sirf Phase 2-B me — jab beta feedback aa chuka ho.  
3. **AI model** hamesha env se (`OPENROUTER_MODEL`) — hard-code nahi.  
4. **Privacy first** — prayer text treat as sacred; no public social feed.  
5. **Ship vertical slices** — har item user-visible + testable.

---

## Phase 2 roadmap (ordered)

### Phase 2-A — Live + sticky (NOW)

| ID | Item | Outcome | Est. |
|---|---|---|---|
| **P2A-0** | Production deploy (Vercel + env + Supabase URLs) | Live URL | Ops |
| **P2A-1** | **Saved verses collection** | All bookmarked verses in one place | S |
| **P2A-2** | **Weekly AI insights** (Home card) | Category/answered patterns last 7 days | M |
| **P2A-3** | Full **voice prayer** (Whisper / STT) | Mic → transcript → journal | M |
| **P2A-4** | Beta feedback loop (form + 10–50 users) | Prioritized bug/feature list | Ops |

**Gate → 2-B:** Live app stable; users return; insights + saved verses used.

---

### Phase 2-B — Monetize when it hurts to stay free

| ID | Item | Outcome | Est. |
|---|---|---|---|
| **P2B-1** | **Lemon Squeezy** checkout + webhooks | Monthly / Annual + trial | M |
| **P2B-2** | Entitlements: free 3 entries/week; AI verses paid | Soft paywall | S |
| **P2B-3** | Shareable **verse cards** (image) | WhatsApp / social growth | M |
| **P2B-4** | One simple **Bible reading plan** | Daily open reason | M |

**Gate → 2-C:** Paying path works in test/live; conversion measurable.

---

### Phase 2-C — Family → church

| ID | Item | Outcome | Est. |
|---|---|---|---|
| **P2C-1** | Private **prayer groups** | Shared request list | L |
| **P2C-2** | **Family plan** (LS multi-seat) | Higher ARPU | M |
| **P2C-3** | **Church basic dashboard** | Invite code + congregational requests | L |
| **P2C-4** | **Answered prayer timeline** (visual year) | Emotional retention | M |

**Gate → 2-D:** At least one group/church pilot path.

---

### Phase 2-D — Moat (later)

| ID | Item |
|---|---|
| **P2D-1** | Sermon notes + auto passage link |
| **P2D-2** | Regional languages (Hindi first) |
| **P2D-3** | Offline full Bible (one translation) |
| **P2D-4** | Church software integrations |
| **P2D-5** | Referral program |

---

## Explicit order (do not reshuffle without reason)

```
P2A-0 Deploy
  → P2A-1 Saved verses
  → P2A-2 Weekly insights
  → P2A-3 Voice STT
  → P2A-4 Beta feedback
  → P2B-1 Lemon Squeezy
  → P2B-2 Free limits
  → P2B-3 Verse share cards
  → P2B-4 Reading plan
  → P2C-1 Groups
  → P2C-2 Family plan
  → P2C-3 Church dashboard
  → P2C-4 Answered timeline
  → P2D-* moat
```

---

## P2A-1 — Saved verses (spec)

**User story:** As a believer, I want all verses I bookmarked from prayers in one list so I can revisit God’s Word later.

**Data:** Reuse `prayer_entry_verses` where `saved = true` (already exists).

**UI:**
- Nav: **Verses** (or under Journal) → `/app/verses`
- List: reference, translation, text, linked prayer date (optional), unsave
- Empty state: “Bookmark a verse from a journal entry”

**Out of scope for P2A-1:** Share cards, memory mode, offline full Bible.

---

## P2A-2 — Weekly AI insights (spec)

**User story:** On Home, see a short weekly reflection of my prayer patterns.

**Logic:**
- Last 7 days: count by `prayer_entries.category`, count answered requests
- Optional: one short OpenRouter sentence (env model) — graceful fail if AI down
- Show even without AI: pure stats card

**UI:** Home card “This week with the Lord”

**Privacy:** Prefer aggregates; if sending to LLM, only category counts + optional anonymized labels — not full prayer bodies in v1 if possible. (v1 may use counts only for deterministic card; AI one-liner optional.)

---

## P2A-3 — Voice (spec)

- Browser MediaRecorder → server STT (`STT_PROVIDER` / Whisper)  
- Insert transcript into journal editor  
- Fail → type manually  

---

## Phase 2-B payment (reminder)

- Provider: **Lemon Squeezy only** (not Stripe)  
- Only when user says ready to test pay  
- Env: `LEMONSQUEEZY_*`  

---

## Current focus

| Field | Value |
|---|---|
| **Active** | Phase 2-A |
| **Done** | P2A-1 Saved verses · P2A-2 Weekly insights · P2A-3 Voice |
| **Next** | P2A-0 Deploy · beta · then P2B payment |
| **Deploy** | P2A-0 — user/Vercel (see `praynote/DEPLOY.md`) |
| **Do not start yet** | P2B payment, P2C church |

---

## Definition of done (each item)

- [ ] Works logged-in on mobile + desktop  
- [ ] Empty / error states  
- [ ] No secrets committed  
- [ ] README or this plan updated if nav changes  

---

*End of Phase 2 Product Plan*
