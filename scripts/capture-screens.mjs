/**
 * Captures real screenshots of the running demo apps and writes them into
 * public/images/projects/<slug>/, where the case studies pick them up.
 *
 * This is why the demos were built first: the case-study "screenshots" are
 * captures of software that actually runs, not mockups.
 *
 *   node scripts/capture-screens.mjs [--base http://localhost:5173]
 */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const base = (process.argv.includes('--base')
  ? process.argv[process.argv.indexOf('--base') + 1]
  : 'http://localhost:5173'
).replace(/\/$/, '')

const OUT_ROOT = 'public/images/projects'
/** --only <project-slug> recaptures one case study and leaves the rest untouched. */
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null
/** The demo app window — crops out the surrounding page. */
const APP = '.rounded-2xl.border.shadow-\\[var\\(--shadow-lift\\)\\]'

/**
 * Each entry drives a demo into a specific state, then captures the app frame.
 * `project` is the case-study slug the shot belongs to; `index` matches the
 * position in that project's `screenshots` array.
 */
const SHOTS = [
  {
    project: 'helio-crm',
    route: '/demos/nexus-crm',
    files: [
      { name: '01-pipeline.png', setup: async () => {} },
      {
        name: '02-deal-detail.png',
        setup: async (page) => {
          await page.locator('[class*="cursor-grab"]').first().click()
          await page.waitForTimeout(500)
        },
      },
      {
        name: '03-forecast.png',
        setup: async (page) => {
          await page.getByRole('button', { name: /Forecast/i }).click()
          await page.waitForTimeout(1200)
        },
      },
    ],
  },
  {
    project: 'aria-support-agent',
    route: '/demos/aria-ai',
    files: [
      {
        name: '01-answer.png',
        setup: async (page) => {
          await page.getByRole('button', { name: /experience with AI and LLMs/i }).click()
          await page.waitForTimeout(700)
        },
      },
      {
        name: '02-pipeline.png',
        setup: async (page) => {
          await page.getByRole('button', { name: /Have you built CRM systems/i }).click()
          await page.waitForTimeout(700)
        },
      },
      {
        name: '03-corpus.png',
        setup: async (page) => {
          await page.getByRole('button', { name: /e-commerce platforms do you work with/i }).click()
          await page.waitForTimeout(500)
          await page.getByRole('button', { name: /Corpus/i }).click()
          await page.waitForTimeout(400)
        },
      },
    ],
  },
  {
    project: 'vantage-bi',
    route: '/demos/pulse-bi',
    files: [
      { name: '01-overview.png', setup: async (page) => page.waitForTimeout(1200) },
      {
        name: '02-filtered.png',
        setup: async (page) => {
          await page.waitForTimeout(1200)
          await page.locator('.recharts-bar-rectangle').first().click({ force: true })
          await page.waitForTimeout(900)
        },
      },
      {
        name: '03-heatmap.png',
        setup: async (page) => {
          await page.waitForTimeout(1200)
          await page.locator('table button').nth(7).click()
          await page.waitForTimeout(900)
        },
      },
    ],
  },
  {
    project: 'lumina-commerce',
    route: '/demos/lumina-commerce',
    files: [
      { name: '01-listing.png', setup: async () => {} },
      {
        name: '02-product.png',
        setup: async (page) => {
          await page.locator('button:has-text("Meridian Floor")').first().click()
          await page.waitForTimeout(500)
        },
      },
      {
        name: '03-cart.png',
        setup: async (page) => {
          await page.locator('button:has-text("Halo Pendant")').first().click()
          await page.waitForTimeout(400)
          await page.getByRole('button', { name: /Add to cart/i }).click()
          await page.waitForTimeout(700)
        },
      },
    ],
  },
  {
    project: 'quill-cms',
    route: '/demos/quill-cms',
    files: [
      { name: '01-editor.png', setup: async () => {} },
      {
        name: '02-preview.png',
        setup: async (page) => {
          await page.getByRole('button', { name: /^Preview$/i }).click()
          await page.waitForTimeout(500)
        },
      },
      {
        name: '03-blocks.png',
        setup: async (page) => {
          await page.getByRole('button', { name: /^Image$/i }).click()
          await page.waitForTimeout(400)
        },
      },
    ],
  },
]

// PW_CHANNEL=chrome (or msedge) uses an installed browser instead of Playwright's own build.
const STOCKROOM = {
  project: 'commerce-analytics-dbt',
  route: '/demos/stockroom',
  files: [
    { name: '01-overview.png', selector: '[data-shot="overview"]', setup: async (page) => page.waitForTimeout(1200) },
    { name: '02-segments.png', selector: '[data-shot="segments"]', setup: async (page) => page.waitForTimeout(800) },
    {
      name: '03-cohorts.png',
      selector: '[data-shot="cohorts"]',
      setup: async (page) => page.waitForTimeout(400),
    },
  ],
}
SHOTS.push(STOCKROOM)

const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {})
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 2,
  colorScheme: 'dark',
  reducedMotion: 'reduce',
})
await context.addInitScript(() => {
  try {
    localStorage.setItem('sw-theme', 'dark')
  } catch {}
})

/**
 * Playwright scrolls an element into view before capturing it, which slides the
 * position:fixed header and assistant dock over the top of the demo frame and
 * into the shot. Everything fixed is tagged data-no-print, so hiding that gives
 * a clean crop of just the app window.
 */
const HIDE_OVERLAYS = `[data-no-print] { display: none !important; }`

let captured = 0
let failed = 0

for (const group of SHOTS.filter((g) => !only || g.project === only)) {
  const dir = path.join(OUT_ROOT, group.project)
  await mkdir(dir, { recursive: true })

  for (const shot of group.files) {
    const page = await context.newPage()
    try {
      await page.goto(base + group.route, { waitUntil: 'networkidle', timeout: 45_000 })
      await page.addStyleTag({ content: HIDE_OVERLAYS })
      await page.waitForTimeout(900)
      await shot.setup(page)

      // A shot can crop to one panel instead of the whole app window.
      const frame = page.locator(shot.selector ?? APP).first()
      await frame.waitFor({ state: 'visible', timeout: 10_000 })
      await frame.screenshot({ path: path.join(dir, shot.name) })

      console.log(`✓ ${group.project}/${shot.name}`)
      captured++
    } catch (e) {
      console.log(`✗ ${group.project}/${shot.name} — ${String(e).split('\n')[0].slice(0, 120)}`)
      failed++
    } finally {
      await page.close()
    }
  }
}

await browser.close()
console.log(`\n${captured} captured, ${failed} failed`)
process.exit(failed > 0 ? 1 : 0)
