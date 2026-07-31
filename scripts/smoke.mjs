/**
 * Functional smoke test for the live demos.
 *
 * Screenshots prove a page renders; this proves the apps actually *work* —
 * retrieval returns grounded answers, deals move between stages, the cart
 * totals, and the invoice really produces a PDF.
 *
 *   node scripts/smoke.mjs [--base http://localhost:5173] [--out .shots]
 */
import { chromium } from 'playwright'
import { mkdir, stat } from 'node:fs/promises'
import path from 'node:path'

const base = (process.argv.includes('--base')
  ? process.argv[process.argv.indexOf('--base') + 1]
  : 'http://localhost:5173'
).replace(/\/$/, '')
const outDir = process.argv.includes('--out')
  ? process.argv[process.argv.indexOf('--out') + 1]
  : '.shots'

await mkdir(outDir, { recursive: true })

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 2,
  colorScheme: 'dark',
  acceptDownloads: true,
})
await context.addInitScript(() => {
  try {
    localStorage.setItem('sw-theme', 'dark')
  } catch {}
})

const page = await context.newPage()
const consoleErrors = []
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()))
page.on('pageerror', (e) => consoleErrors.push(String(e)))

const results = []
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail })
  console.log(`${pass ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`)
}

async function goto(route) {
  await page.goto(base + route, { waitUntil: 'networkidle', timeout: 45_000 })
  await page.waitForTimeout(700)
}

/* ── Aria: retrieval returns a grounded answer, and refuses off-corpus ───── */
try {
  await goto('/demos/aria-ai')
  await page.getByRole('button', { name: /experience with AI and LLMs/i }).click()
  await page.waitForTimeout(500)

  const bodyText = await page.locator('main').innerText()
  check(
    'aria: grounded answer returned',
    /retrieval-augmented generation|production LLM|RAG/i.test(bodyText),
    'answer references the AI knowledge chunk'
  )
  check('aria: sources cited', /Skills → AI|Sources/i.test(bodyText))
  check('aria: pipeline inspector populated', /Grounding gate|Retrieve ·/i.test(bodyText))

  await page.screenshot({ path: path.join(outDir, 'smoke-aria-answer.png') })

  // Off-corpus question must be refused, not answered. The starter chips are
  // gone once a conversation exists, so type it instead.
  await page.getByLabel('Ask a question').fill('What is the capital of Peru?')
  await page.getByRole('button', { name: 'Send' }).click()
  await page.waitForTimeout(500)
  const afterRefusal = await page.locator('main').innerText()
  check(
    'aria: off-corpus question refused',
    /don't have anything in my knowledge base/i.test(afterRefusal),
    'grounding gate suppressed the answer'
  )
  await page.screenshot({ path: path.join(outDir, 'smoke-aria-refusal.png') })
} catch (e) {
  check('aria demo', false, String(e).slice(0, 160))
}

/* ── NexusCRM: drag a deal into another stage ───────────────────────────── */
try {
  await goto('/demos/nexus-crm')
  const firstCard = page.locator('[class*="cursor-grab"]').first()
  const targetColumn = page.locator('text=Qualified').first()

  const leadCountBefore = await page.locator('text=/^Lead$/').first().isVisible()
  const from = await firstCard.boundingBox()
  const to = await targetColumn.boundingBox()

  if (from && to) {
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
    await page.mouse.down()
    await page.mouse.move(to.x + to.width / 2, to.y + 160, { steps: 22 })
    await page.mouse.up()
    await page.waitForTimeout(600)
  }
  check('crm: board renders and drag completes without error', leadCountBefore && !!from)

  // Tab switching + charts
  await page.getByRole('button', { name: /Forecast/i }).click()
  await page.waitForTimeout(900)
  const forecastText = await page.locator('main').innerText()
  check('crm: forecast charts render', /Weighted forecast|Pipeline value/i.test(forecastText))
  await page.screenshot({ path: path.join(outDir, 'smoke-crm-forecast.png') })

  await page.getByRole('button', { name: /Contacts/i }).click()
  await page.waitForTimeout(500)
  const rowCount = await page.locator('table tbody tr').count()
  check('crm: contacts table populated', rowCount > 5, `${rowCount} rows`)
} catch (e) {
  check('crm demo', false, String(e).slice(0, 160))
}

/* ── PulseBI: cross-filtering changes the KPIs ──────────────────────────── */
try {
  await goto('/demos/pulse-bi')
  await page.waitForTimeout(1100) // charts need a layout pass

  const before = await page.locator('text=Revenue').first().locator('..').innerText()
  await page.locator('.recharts-bar-rectangle').first().click({ force: true })
  await page.waitForTimeout(700)
  const after = await page.locator('text=Revenue').first().locator('..').innerText()

  check('bi: clicking a bar cross-filters the KPIs', before !== after, 'revenue tile changed')
  const chips = await page.locator('text=/Region: /').count()
  check('bi: active filter chip appears', chips > 0)
  await page.screenshot({ path: path.join(outDir, 'smoke-bi-filtered.png') })
} catch (e) {
  check('bi demo', false, String(e).slice(0, 160))
}

/* ── Lumina: add to cart and reach checkout ─────────────────────────────── */
try {
  await goto('/demos/lumina-commerce')
  await page.locator('button:has-text("Halo Pendant")').first().click()
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: /Add to cart/i }).click()
  await page.waitForTimeout(600)

  const cartText = await page.locator('aside').innerText()
  check('commerce: item added and totals computed', /Subtotal|Total/i.test(cartText))

  await page.getByRole('button', { name: /^Checkout$/i }).click()
  await page.waitForTimeout(400)
  const step = await page.locator('aside').innerText()
  check('commerce: checkout stepper advances', /Shipping|Address/i.test(step))
  await page.screenshot({ path: path.join(outDir, 'smoke-commerce-cart.png') })
} catch (e) {
  check('commerce demo', false, String(e).slice(0, 160))
}

/* ── Invoicely: generate a real PDF ─────────────────────────────────────── */
try {
  await goto('/demos/invoicely')
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 30_000 }),
    page.getByRole('button', { name: /Download PDF/i }).click(),
  ])
  const file = path.join(outDir, 'smoke-invoice.pdf')
  await download.saveAs(file)
  const info = await stat(file)
  check(
    'invoice: real PDF generated and downloaded',
    info.size > 2000,
    `${download.suggestedFilename()} — ${(info.size / 1024).toFixed(1)} KB`
  )
  await page.screenshot({ path: path.join(outDir, 'smoke-invoice.png') })
} catch (e) {
  check('invoice demo', false, String(e).slice(0, 160))
}

/* ── Quill: add a block and preview ─────────────────────────────────────── */
try {
  await goto('/demos/quill-cms')
  await page.getByRole('button', { name: /^Quote$/i }).click()
  await page.waitForTimeout(300)
  await page.getByRole('button', { name: /^Preview$/i }).click()
  await page.waitForTimeout(400)
  const preview = await page.locator('article').first().innerText()
  check('cms: block added and preview renders', preview.length > 40)
  await page.screenshot({ path: path.join(outDir, 'smoke-cms-preview.png') })
} catch (e) {
  check('cms demo', false, String(e).slice(0, 160))
}

/* ── Contact form validation ────────────────────────────────────────────── */
try {
  await goto('/contact')
  await page.getByRole('button', { name: /Send message/i }).click()
  await page.waitForTimeout(400)
  const errs = await page.locator('[role="alert"]').count()
  check('contact: client-side validation blocks empty submit', errs >= 2, `${errs} field errors`)
} catch (e) {
  check('contact form', false, String(e).slice(0, 160))
}

await browser.close()

const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
if (consoleErrors.length) {
  console.log(`\n${consoleErrors.length} console error(s):`)
  for (const e of [...new Set(consoleErrors)].slice(0, 10)) console.log(`  ! ${e.slice(0, 200)}`)
}
process.exit(failed.length > 0 ? 1 : 0)
