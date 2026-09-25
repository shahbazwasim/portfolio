/**
 * Renders the concept art on the UEFN page (/uefn) to
 * public/images/uefn/concept-art/, by drawing the procedural three.js scenes
 * in scripts/concept-art/scenes.js in headless Chromium.
 *
 * Every image is built from primitives in code — no game assets and no
 * screenshots — which is why the page captions them as concept art.
 *
 *   node scripts/concept-art.mjs              # every shot
 *   node scripts/concept-art.mjs --only hero  # one shot
 */
import { chromium } from 'playwright'
import sharp from 'sharp'
import { mkdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const ORIGIN = 'http://concept-art.local'
const OUT = 'public/images/uefn/concept-art'
/** Rendered at 2x and downscaled, which doubles as antialiasing. */
const RENDER = { width: 1600, height: 900, scale: 2 }
/** Published widths: 1600 for the lightbox and 2x cards, 800 for small cards. */
const WIDTHS = [1600, 800]
const QUALITY = 80

const PAGES = {
  '/index.html': 'scripts/concept-art/index.html',
  '/scenes.js': 'scripts/concept-art/scenes.js',
}
const TYPES = { '.html': 'text/html', '.js': 'text/javascript' }

const onlyIndex = process.argv.indexOf('--only')
const only = onlyIndex > -1 ? process.argv[onlyIndex + 1] : null

// PW_CHANNEL=chrome (or msedge) uses an installed browser instead of Playwright's own build.
const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {})
const page = await browser.newPage()
page.on('console', (msg) => console.log(`  [page] ${msg.text()}`))
page.on('pageerror', (err) => {
  console.error(err)
  process.exitCode = 1
})

// Serve the scene page and three.js from disk under a fake origin: ES modules
// won't load from file:// URLs.
await page.route(`${ORIGIN}/**`, async (route) => {
  const { pathname } = new URL(route.request().url())
  const file = pathname.startsWith('/three/')
    ? path.join('node_modules/three', pathname.slice('/three/'.length))
    : PAGES[pathname]
  if (!file) return route.fulfill({ status: 404 })
  await route.fulfill({ body: await readFile(file), contentType: TYPES[path.extname(file)] })
})

await page.goto(`${ORIGIN}/index.html`)
await page.waitForFunction(() => window.conceptArt, null, { timeout: 30_000 })

const shots = await page.evaluate(() => window.conceptArt.shots)
const selected = only ? shots.filter((s) => s === only) : shots
if (only && !selected.length) {
  console.error(`Unknown shot "${only}". Shots: ${shots.join(', ')}`)
  process.exit(1)
}

await mkdir(OUT, { recursive: true })

for (const name of selected) {
  const started = Date.now()
  const dataUrl = await page.evaluate(
    ({ name, width, height, scale }) => window.conceptArt.render(name, width, height, scale),
    { name, ...RENDER }
  )
  const png = Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64')

  const sizes = []
  for (const width of WIDTHS) {
    const file = path.join(OUT, `${name}-${width}.webp`)
    await sharp(png)
      .resize({ width, kernel: 'lanczos3' })
      .webp({ quality: QUALITY, effort: 6 })
      .toFile(file)
    sizes.push(`${width}w ${((await stat(file)).size / 1024).toFixed(0)}KB`)
  }
  if (name === 'hero') {
    // Link previews (og:image) want 1200x630, and JPEG is the safe format there.
    const file = path.join(OUT, 'hero-og.jpg')
    await sharp(png).resize({ width: 1200, height: 630, fit: 'cover' }).jpeg({ quality: 84, mozjpeg: true }).toFile(file)
    sizes.push(`og ${((await stat(file)).size / 1024).toFixed(0)}KB`)
  }
  console.log(`✓ ${name.padEnd(18)} ${sizes.join('  ')}  (${((Date.now() - started) / 1000).toFixed(1)}s)`)
}

await browser.close()
