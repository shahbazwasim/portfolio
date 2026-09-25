# Shahbaz Wasim — Portfolio

Personal portfolio and case-study site. React 19 + Vite + TypeScript + Tailwind v4,
prerendered to static HTML, deployed on Netlify.

**Live:** https://shahbazwasim.netlify.app

---

## ⚠️ Do these three things first

### 1. Add your photos

The site ships with a designed gradient-monogram fallback, so nothing looks broken
without them — but the real portraits are much stronger. Drop these files in:

| File | Where it appears |
|---|---|
| `public/images/profile-hero.png` | Hero portrait, about page, OG image |
| `public/images/shahbaz-standing.jpg` | About page |
| `public/images/shahbaz-outdoor.jpg` | About page |
| `public/Shahbaz-Wasim-Resume.pdf` | "Download résumé" buttons (export your CV to PDF) |

**Recommended:** run the headshot through [remove.bg](https://remove.bg) and save the
transparent cutout as `profile-hero.png`. A cutout floating over the aurora backdrop
looks dramatically better than a circle crop.

### 2. Route the contact form to your inbox

The form works out of the box via Netlify Forms, but notifications have to be turned
on once, by hand:

> Netlify dashboard → your site → **Forms** → **contact** → **Settings and usage** →
> **Form notifications** → **Add notification** → **Email notification** →
> enter `shahbaz.wasim@hotmail.com` → Save.

Then submit the live form once and confirm it arrives (**check your junk folder** on
the first send). Free tier covers 100 submissions/month.

### 3. Add your real LinkedIn recommendations

`src/data/testimonials.ts` contains placeholders and the section is **hidden** until
you replace them. Copy your actual recommendations from
LinkedIn → *Recommendations* → *Received*, paste them in, and set
`TESTIMONIALS_PUBLISHED = true`.

They're deliberately not invented — a recommendation is only worth something if a
reader can click through to the profile and verify it.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Prerender all 42 routes to `dist/` + generate sitemap & robots |
| `npm run preview` | Serve the production build on :4173 |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run smoke` | Functional test of all seven demos (needs a server running) |
| `npm run shots` | Re-capture demo screenshots and optimise them to WebP |
| `node scripts/sync-stockroom-data.mjs` | Refresh the Stockroom demo from the dbt project's exports |
| `node scripts/concept-art.mjs` | Render the /uefn page's concept art (three.js scenes) to WebP; `--only <shot>` for one |
| `npm run og` | Regenerate the social card and app icons |
| `npm run shoot` | Ad-hoc page screenshots — see `scripts/shoot.mjs` for flags |

---

## Deploying

**First time**

```bash
git remote add origin https://github.com/Shahbazwasim/portfolio.git
git push -u origin main
```

Then in Netlify: **Add new site → Import an existing project → GitHub → select the repo.**
Build settings are read from `netlify.toml`, so accept the defaults:

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 22

Every push to `main` redeploys.

**Custom domain (strongly recommended)**

A `.netlify.app` URL on a CV reads as a hobby project. `shahbazwasim.com` costs about
$12/year and is the single highest-return change you can make here.

1. Buy the domain, then Netlify → **Domain management → Add a domain**
2. Point the nameservers at Netlify (HTTPS is provisioned automatically)
3. **Update `SITE.url` in `src/data/site.ts`** — canonical URLs, OG tags, JSON-LD and
   the sitemap all derive from it. The build prints a reminder until you do.

---

## Project structure

```
src/
├─ data/            # All content lives here — edit these, not components
│  ├─ site.ts       # Name, contact details, socials, nav
│  ├─ projects.ts   # 19 case studies (4 UEFN, 1 open-source dbt project)
│  ├─ skills.ts     # Skills matrix, linked to case studies
│  ├─ experience.ts # Career timeline + education
│  ├─ services.ts   # Service offerings + engagement models
│  ├─ demos.ts      # Demo registry
│  ├─ posts.ts      # Blog articles
│  ├─ knowledge.ts  # Corpus for the Aria assistant
│  └─ testimonials.ts
├─ demos/           # Seven standalone apps, each lazily loaded
├─ components/      # ui/ primitives, layout/ chrome, sections/ home blocks
├─ pages/           # One file per route
├─ lib/             # retrieval engine, SEO, theme, storage helpers
└─ styles/          # Design tokens + generated font faces

netlify/functions/  # Optional Claude-powered assistant endpoint (off by default)
scripts/            # Build and asset tooling
```

**Adding a case study** is a data edit: append an object to `PROJECTS` in
`src/data/projects.ts`. The card, detail page, sitemap entry and command-palette
entry all follow automatically.

Two optional fields: `code` adds a "From the source" section with a highlighted
excerpt (Verse is supported — see `src/lib/verse-highlight.ts`), and
`screenshots[].art` picks which generated illustration stands in for a missing
screenshot — `island`, `hud`, `plots`, `verse` and so on, listed in `ProjectArt`.

---

## The live demos

Seven working applications, each lazily loaded so they never weigh down the main bundle:

| Demo | What it proves |
|---|---|
| **NexusCRM** | Drag-and-drop pipeline, contacts table, forecasting, field-level permissions |
| **Aria** | Retrieval-augmented assistant with a live pipeline inspector |
| **PulseBI** | Cross-filtering analytics dashboard with CSV export |
| **Lumina** | Storefront with faceted search, cart and checkout |
| **Quill** | Block-based CMS with live preview |
| **Invoicely** | Invoice builder that generates a **real PDF** in the browser |
| **Stockroom** | Dashboard over the open-source `commerce-analytics-dbt` warehouse — **real data**, every figure from the pipeline's exports |

All state persists to `localStorage`; nothing is sent to a server. `npm run smoke`
drives all seven with Playwright and asserts they actually work.

The case-study screenshots are real captures of these apps
(`npm run shots`), not mockups. `node scripts/capture-screens.mjs --only <slug>` recaptures a
single case study. If Playwright's bundled browser isn't installed, prefix the smoke and
capture scripts with `PW_CHANNEL=chrome` to use an installed Chrome instead.

Stockroom's data lives in `src/demos/stockroom/data.json`, generated from the dbt project's
`exports/` by `scripts/sync-stockroom-data.mjs` — re-run it after a dbt build rather than
editing figures by hand.

---

## The Aria assistant

The floating "Ask me anything" assistant runs a genuine retrieval engine
**entirely in your browser** — BM25 + TF-IDF cosine similarity fused by reciprocal
rank, over a curated corpus in `src/data/knowledge.ts`. No API key, no server, no cost.

Because it only ever returns text from that corpus, it structurally *cannot*
hallucinate. Answers below the grounding threshold are refused rather than guessed —
try asking it something off-topic.

**Optional upgrade to a real LLM:** `netlify/functions/chat.mts` is written and inert.
Set `ANTHROPIC_API_KEY` in Netlify's environment variables and follow the comments at
the top of that file. `claude-haiku-4-5` is the cost-effective choice for a chat widget;
the system prompt is prompt-cached so repeat calls bill the cached prefix at ~0.1×.

---

## Performance

Lighthouse on the production build:

| | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| **Desktop** | 95 | 100 | 100 | 100 |
| **Mobile** (Lighthouse's 4× CPU throttle + slow 4G) | 71 | 100 | 100 | 100 |

Desktop: FCP 0.9s, **LCP 1.2s**, TBT 0ms, **CLS 0**.

The mobile figure is Lighthouse's deliberately punishing simulation — CLS and TBT are
perfect there too; FCP/LCP are bound by transfer time over simulated slow 4G. Real
mobile hardware on real networks lands far closer to the desktop numbers.

Things that matter and are already handled:

- Fonts self-hosted (`scripts/fetch-fonts.mjs`) — no third-party render-blocking request
- Demo screenshots served as WebP (6.5 MB → 0.68 MB)
- Every demo route-split; charting and PDF code never reach the home page
- `prefers-reduced-motion` respected throughout
- Security headers and a strict CSP in `netlify.toml`

---

## Content honesty

A few things worth knowing if you edit the content:

- **Case-study client names are illustrative brands** (Helio Group, Lumina, Vantage
  Retail…), not real companies. The engineering substance — architecture, stack
  decisions, trade-offs — is what the write-ups are actually about. Don't swap in the
  name of a real company you haven't worked with; that's the kind of claim a hiring
  manager can check.
- **Testimonials are gated behind a flag** and ship empty for the same reason. Real
  recommendations from named people carry weight precisely because they're verifiable.
- **The UEFN case studies carry no island codes and make no claims about Epic.**
  Published islands are public: anyone can paste a code into fortnite.gg and see its
  real play numbers, and an invented code may belong to somebody else's island. So the
  four UEFN write-ups follow the same rule as the rest — illustrative studios, real
  engineering — and deliberately leave out island codes, creator tags and "featured
  in Discover" claims. Expect a UEFN interviewer to ask for a code. If you have
  published islands, add their codes; a verifiable island beats any write-up.
- **The /uefn page's images are concept art, and say so.** They are procedural
  three.js scenes rendered by `scripts/concept-art.mjs` — no game assets, no
  screenshots — and every one is captioned as concept art. Real in-game screenshots
  go only with a real island in `PUBLISHED_ISLANDS` (`src/data/uefn.ts`), which is
  also the only place an island code can appear.

---

## Tech

React 19 · Vite 8 · TypeScript · Tailwind CSS v4 · React Router 6 ·
vite-react-ssg · Motion · Recharts · dnd-kit · jsPDF · Lenis · Netlify
