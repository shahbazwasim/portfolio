/**
 * Screenshot harness.
 *
 * Used during development to eyeball pages, and later to capture the real demo
 * screenshots that the case studies reference.
 *
 *   node scripts/shoot.mjs --base http://localhost:5173 --out .shots \
 *     --routes / /about /contact --theme dark --width 1440 --height 1200
 *
 * Flags:
 *   --base     origin to hit (default http://localhost:5173)
 *   --out      output directory (default .shots)
 *   --routes   space-separated route list
 *   --theme    dark | light | both      (default dark)
 *   --width    viewport width           (default 1440)
 *   --height   viewport height          (default 1000)
 *   --full     capture the full scrollable page
 *   --clip     CSS selector to crop to instead of the viewport
 *   --wait     extra settle time in ms   (default 900)
 */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

function parseArgs(argv) {
  const args = { routes: [] }
  let key = null
  for (const token of argv.slice(2)) {
    if (token.startsWith('--')) {
      key = token.slice(2)
      // `routes` is variadic and pre-seeded; every other flag defaults to a
      // boolean until a value token replaces it.
      if (key !== 'routes') args[key] = true
    } else if (key === 'routes') {
      args.routes.push(token)
    } else if (key) {
      args[key] = token
      key = null
    }
  }
  return args
}

const args = parseArgs(process.argv)
const base = args.base ?? 'http://localhost:5173'
const outDir = args.out ?? '.shots'
const width = Number(args.width ?? 1440)
const height = Number(args.height ?? 1000)
const settle = Number(args.wait ?? 900)
const themes = args.theme === 'both' ? ['dark', 'light'] : [args.theme ?? 'dark']
const routes = args.routes.length ? args.routes : ['/']

const slug = (route) => (route === '/' ? 'home' : route.replace(/^\//, '').replace(/\//g, '-'))

await mkdir(outDir, { recursive: true })

const browser = await chromium.launch()
const results = []

for (const theme of themes) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    colorScheme: theme,
    // Freeze decorative motion so captures are deterministic between runs.
    reducedMotion: 'reduce',
  })

  // Seed the theme before any app code runs, so there is no flash or mismatch.
  await context.addInitScript((t) => {
    try {
      localStorage.setItem('sw-theme', t)
    } catch {}
  }, theme)

  const page = await context.newPage()
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(String(e)))

  for (const route of routes) {
    const url = base.replace(/\/$/, '') + route
    try {
      const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 45_000 })

      // Nudge the page so scroll-triggered reveals fire, then return to the top.
      if (args.full) {
        await page.evaluate(async () => {
          const step = window.innerHeight * 0.8
          for (let y = 0; y < document.body.scrollHeight; y += step) {
            window.scrollTo(0, y)
            await new Promise((r) => setTimeout(r, 90))
          }
          window.scrollTo(0, 0)
        })
      }
      await page.waitForTimeout(settle)

      const file = path.join(outDir, `${slug(route)}-${theme}.png`)
      const target = args.clip ? page.locator(args.clip).first() : page
      await target.screenshot({ path: file, fullPage: args.full ? true : undefined })

      results.push({ route, theme, status: res?.status() ?? 0, file, errors: [...errors] })
      errors.length = 0
    } catch (err) {
      results.push({ route, theme, status: 'FAILED', file: '-', errors: [String(err)] })
    }
  }

  await context.close()
}

await browser.close()

let failures = 0
for (const r of results) {
  const bad = r.status !== 200 || r.errors.length > 0
  if (bad) failures++
  console.log(
    `${bad ? '✗' : '✓'} ${String(r.status).padEnd(6)} ${r.theme.padEnd(5)} ${r.route.padEnd(28)} ${r.file}`
  )
  for (const e of r.errors.slice(0, 4)) console.log(`      ! ${e.slice(0, 220)}`)
}
console.log(`\n${results.length - failures}/${results.length} clean`)
