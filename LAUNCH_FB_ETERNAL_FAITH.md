# Launch Plan — PrayNote × Eternal Faith (Facebook)

**Version:** 1.0  
**Date:** July 2026  
**FB page:** Eternal Faith (~53k followers)  
**Product:** PrayNote (AI prayer journal + Scripture linking)  
**Repo / app:** `praynote/` · https://github.com/geekyprem1/jesusprayai  

---

## Brand rule (don’t mix)

| Layer | Name | Role |
|---|---|---|
| Facebook page | **Eternal Faith** | Content, trust, traffic |
| Product | **PrayNote** | The app / web tool |
| Credit line | “From the Eternal Faith team” / “A project by Eternal Faith” | Credibility |

**Do not** rename the page to the app or the app only to “Eternal Faith” without a clear product name.  
**Tagline for posts:** *Prayer that points to Scripture.*

---

## Pre-launch checklist (before any big FB post)

### Product
- [ ] App live on **Vercel** (HTTPS URL)
- [ ] Signup / login works on phone
- [ ] Journal → save → AI category + verses works
- [ ] Saved verses + weekly insight ok
- [ ] Privacy: no public feed of users’ prayers
- [ ] Landing clearly Christian + “From Eternal Faith” (optional badge)

### Accounts / legal soft
- [ ] Supabase Auth redirect URLs include production domain
- [ ] Simple Privacy / Terms linked (even short pages)
- [ ] Support contact (page DM or email)

### Assets
- [ ] 1 logo / app icon for posts
- [ ] 3–5 screenshots (journal, verses, home insight)
- [ ] 1 short screen-recording (15–30s reel)
- [ ] Link ready: production URL (bit.ly optional)

### Env (production)
- [ ] Supabase keys  
- [ ] OpenRouter key + model  
- [ ] `CRON_SECRET`  
- [ ] OpenAI key if Whisper voice needed at launch  

See: `praynote/DEPLOY.md`

---

## Launch phases

### Phase 0 — Internal (Day −7 to −3)

| Step | Action |
|---|---|
| 1 | Deploy production |
| 2 | Test full flow yourself on mobile data |
| 3 | Invite **5–10 trusted** people (friends / small group) |
| 4 | Collect bugs (WhatsApp list) |
| 5 | Fix critical only — don’t block forever |

**Success:** No broken signup; AI works for most prayers.

---

### Phase 1 — Soft warm-up on Eternal Faith (Day −2 to −1)

**Goal:** Interest, not hard sell. No “buy” language.

| Day | Post type | Idea |
|---|---|---|
| −2 | Question | “Do you write prayers and later forget what God answered?” |
| −2 | Reel (optional) | Quiet desk / Bible / journal aesthetic + soft text |
| −1 | Story / behind build | “We’ve been building a prayer journal that links your prayers to Scripture…” |
| −1 | Poll | “Would you use an app that suggests Bible verses from your prayer? Yes / Maybe / Already journal offline” |

**Rules:**
- No link spam yet (or link only in first comment / bio if live)
- Reply to every serious comment
- Stay pastoral, not “startup hype”

---

### Phase 2 — Launch day (Day 0)

**Morning (best engagement window for your audience — test 8–10 AM or evening 7–9 PM local):**

1. **Main feed post** (see copy below)  
2. **Reel** — 20s demo: type/speak prayer → category → verses  
3. **Pin the post** for 3–7 days  
4. **Story:** “Link in bio / comments — free to start”  
5. **Bio:** Add production URL  

**Same day:**
- Monitor comments every 1–2 hours  
- DM people who ask for link (if you used “comment PRAY”)  
- Note errors users report  

**Do not:** Boost ads on day 1 until flow is stable.

---

### Phase 3 — First week after launch (Day 1–7)

| Day | Content |
|---|---|
| +1 | Testimony format: “Someone prayed about anxiety → verses like Phil 4…” (generic, not private user data) |
| +2 | How-to carousel: 1 Write · 2 Save · 3 See verses · 4 Mark answered |
| +3 | Answer FAQ: “Is my prayer private?” Yes. |
| +4 | Feature: Saved verses / weekly insight |
| +5 | Soft ask: “Reply with one word you’re praying about this week” (community, not app spam) |
| +6 | Reminder post + link |
| +7 | Wins + thanks + “what should we build next?” |

**Metrics to watch (simple):**
- Link clicks (if FB insights / bitly)  
- New signups (Supabase)  
- Day-1 journal entries  
- DMs / complaints  

---

### Phase 4 — First month (ongoing)

- 2–3 Eternal Faith posts/week that are **faith content first**, product second  
- 1 demo/feature post per week  
- Collect 10 written testimonials (permission)  
- Fix top 3 bugs from feedback  
- Then consider: Lemon Squeezy paid tier (see `PHASE2_PRODUCT_PLAN.md`)  

---

## Post copy templates (English — adapt Hinglish if audience prefers)

### A) Warm-up question
> Do you ever write a prayer… and weeks later forget what you asked God for?  
>  
> Or worse — forget to thank Him when He answered?  
>  
> Drop a 🙏 if that’s been you.

### B) Launch post
> **From Eternal Faith — something we’ve been building quietly.**  
>  
> **PrayNote** is a private prayer journal that helps you:  
> • Write (or speak) your prayers  
> • See Scripture that meets what you prayed  
> • Track what’s still on your heart — and what’s been answered  
>  
> Not a social feed. Not noise. Just you, the Word, and a place to remember His faithfulness.  
>  
> Free to start → [YOUR_LIVE_URL]  
>  
> Made with care for the body of Christ.  
> Tag someone who journals their prayers.

### C) Reel script (on-screen text)
> 1. “Write your prayer…”  
> 2. “AI helps categorize (you stay in control)”  
> 3. “Scripture suggestions appear”  
> 4. “Save verses. Mark answered.”  
> 5. “PrayNote — from Eternal Faith” + URL  

Voiceover optional: calm, short, no shouting.

### D) Privacy comment (pin under launch post)
> Your prayers are private. We built this as a journal, not a public wall.  
> Questions? Message the page.

### E) Engagement CTA (optional)
> Comment **PRAY** and we’ll send you the free link.  
> (Only use if you’re ready to reply/DM at scale.)

---

## What NOT to do

| Avoid | Why |
|---|---|
| Post users’ real prayer text | Breaks trust |
| “AI will replace the Holy Spirit” tone | Theology + backlash |
| Daily hard-sell links | Audience fatigue |
| Fake scarcity (“only 50 spots”) | Damages Christian brand |
| Promise healing/medical outcomes | Risk + wrong framing |
| Launch without live URL | Dead interest |

---

## Roles (solo founder)

| Task | Who |
|---|---|
| Deploy / bugs | You (dev) |
| FB posts / Reels | You (page) |
| Reply comments / DMs | You or 1 helper |
| Beta testers | 5–10 trusted |

If helper: give them only FAQ + link, not admin of product secrets.

---

## Success criteria

### Soft launch success
- [ ] 50+ signups in first week (adjust to your engagement) **or** strong saves/shares  
- [ ] ≥30% of signups write at least 1 prayer  
- [ ] No P0 outage  

### Ready for paid (later)
- [ ] People ask for unlimited / more AI  
- [ ] Weekly active users returning  
- [ ] Then: Lemon Squeezy (Phase 2-B in `PHASE2_PRODUCT_PLAN.md`)

---

## One-page timeline

```
Day −7 … Deploy + self-test
Day −3 … 5–10 beta users
Day −2 … Warm-up post (question)
Day −1 … Behind-the-scenes + poll
Day  0 … Launch post + Reel + pin + bio link
Day 1–7 … How-to, privacy, features, thanks
Month 1 … Content + fix + testimonials
Later   … Payments when demand is real
```

---

## Quick links (fill in)

| Item | Value |
|---|---|
| Production URL | `________________________` |
| Support email / page DM | `________________________` |
| Short link (optional) | `________________________` |
| Launch date | `________________________` |

---

## Related docs

- `praynote/DEPLOY.md` — go live  
- `PHASE2_PRODUCT_PLAN.md` — product order after MVP  
- `PHASE_PLAN.md` — original MVP phases  

---

*Eternal Faith builds the audience. PrayNote serves their prayer life. Keep both clear.*
