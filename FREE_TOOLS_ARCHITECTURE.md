# PrayNote Free Tools Architecture

## Goal
Build free Christian tools that acquire visitors through search and social sharing, then offer a respectful path into PrayNote's private journal. Initial tools must work without signup, a paid API, or a new database.

## Product sequence
1. Bible Character Quiz — social acquisition.
2. Bible Verse Wallpaper Maker — share and download loop.
3. Daily Bible Trivia — repeat visits and challenges.
4. Christian Baby Name Generator — long-term SEO.

## System design
```text
Search / social visitor
        -> server-rendered public tool page
        -> client-side interactive tool
        -> local curated content
        -> localStorage when persistence is useful
        -> Canvas / Web Share for result distribution
        -> soft PrayNote signup CTA
```

## Initial infrastructure
| Need | Phase 0 choice |
|---|---|
| Tool catalog | `lib/content/tools.ts` |
| Questions, names and verses | Local typed TypeScript data |
| Interactive state | Client Components |
| Streaks and preferences | `localStorage` |
| Share images | Existing browser Canvas helpers |
| SEO | Server-rendered App Router pages |
| Database | Not required initially |
| Paid API | Not required initially |

## Boundaries
- Route pages own metadata, JSON-LD, explanatory copy, FAQ and canonical URLs.
- Interactive entry points alone use `"use client"`.
- Props crossing the server/client boundary remain serializable.
- `lib/content` owns reviewed, publishable catalogs.
- `lib/tools` will own deterministic scoring and selection logic.
- `lib/share` owns image rendering and platform share URL helpers.
- The central `TOOLS` registry owns hub/home labels and top-level sitemap settings.
- Topic pages remain owned by `VERSE_TOPICS`; they are not top-level tools.

## Planned routes
```text
/tools/bible-character-quiz
/tools/bible-character-quiz/result/[character]
/tools/bible-verse-wallpaper
/tools/bible-trivia
/tools/bible-trivia/[category]
/tools/christian-baby-name-generator
/biblical-names/[slug]
```

Generated filter/query URLs are not indexable. A category or name page enters the sitemap only when it contains reviewed, unique content.

## Tool-specific design
### Bible Character Quiz
Ten questions produce weighted traits, then a deterministic closest-character result. Result pages explain strengths, a growth area and a relevant verse. The framing is a reflection tool, not prophecy, spiritual diagnosis or divine guidance.

### Bible Verse Wallpaper Maker
Curated KJV text and original procedural backgrounds feed the Canvas renderer. Initial outputs are square, Story/Status, Pinterest and phone-wallpaper formats. Drawing assets locally avoids image licensing, remote-image CORS, and recurring API cost.

### Daily Bible Trivia
A UTC date seed selects the same five reviewed questions for every visitor. Score, last-played date and streak stay in local storage. A global leaderboard is deferred because it requires identity, storage and abuse controls.

### Christian Baby Names
Every record distinguishes `biblical`, `biblical-origin` and `christian-use`. Meanings, origins and references require editorial review. The first release uses 50 substantial name pages rather than bulk-generated thin pages.

## SEO rules
- Static tool routes export `metadata` from Server Components.
- Dynamic routes await `params`, validate the slug and call `notFound()` when absent.
- Use `generateStaticParams` for reviewed finite catalogs.
- Keep one canonical URL for each page; do not index generated filter states.
- Add unique introductions, useful output, context, FAQs and related links.
- Add routes to `app/sitemap.ts` only when they are ready to ship.
- Do not publish hundreds of near-duplicate pages.

## Social and conversion rules
- A useful result appears before any signup request.
- Sharing and downloads remain free.
- Cards carry subtle PrayNote branding and a public URL.
- Shared URLs open useful public content, not an authentication wall.
- Calls to action are contextual: save a verse, reflect privately, or continue learning.

## Analytics contract
Reuse `lib/analytics.ts`. Interactive tools will emit snake-case events such as `tool_start`, `tool_complete`, `result_download`, `result_share`, `challenge_click` and `signup_cta_click`, always including a stable tool ID. No personal prayer text, quiz answer text or baby-name shortlist is sent as analytics data.

## Delivery order
Phase 0 centralizes existing tools and shared navigation. Phase 1 ships the Bible Character Quiz. Phase 2 extends existing share-card code into the Wallpaper Maker. Phase 3 adds Daily Trivia and retention. Phase 4 adds editorially reviewed Biblical names. Phase 5 expands only from measured search and sharing demand.

## Validation
Each phase must pass ESLint, TypeScript `--noEmit`, and a production Next.js build. Smoke checks cover the home page, tools hub, affected tool routes, canonical metadata, related links and `/sitemap.xml`.