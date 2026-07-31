/**
 * Renders the social-share card to public/og/default.png (1200x630) and the
 * PWA icons, by screenshotting a purpose-built page in Chromium.
 *
 *   node scripts/og.mjs
 *
 * Re-run after changing the tagline in src/data/site.ts.
 */
import { chromium } from 'playwright'
import { readFile, mkdir } from 'node:fs/promises'

const site = await readFile('src/data/site.ts', 'utf8')
const pick = (key) => site.match(new RegExp(`${key}:\\s*'([^']+)'`))?.[1] ?? ''

const NAME = pick('name') || 'Shahbaz Wasim'
const ROLE = pick('role') || 'Full Stack & AI Engineer'
const YEARS = site.match(/yearsExperience:\s*(\d+)/)?.[1] ?? '10'

const CARD = `<!doctype html>
<html><head><meta charset="utf-8" />
<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f%5B%5D=clash-display@600,700&f%5B%5D=satoshi@400,500,700&display=swap" />
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1200px;height:630px;background:#07080C;color:#F5F7FA;
       font-family:'Satoshi',system-ui,sans-serif;overflow:hidden;position:relative}
  .bloom{position:absolute;border-radius:9999px;filter:blur(90px)}
  .b1{width:620px;height:620px;top:-190px;left:-140px;
      background:radial-gradient(circle,rgba(34,211,238,.55),transparent 68%)}
  .b2{width:680px;height:680px;top:-60px;right:-200px;
      background:radial-gradient(circle,rgba(139,92,246,.6),transparent 68%)}
  .b3{width:520px;height:520px;bottom:-260px;left:320px;
      background:radial-gradient(circle,rgba(244,114,182,.45),transparent 68%)}
  .grid{position:absolute;inset:0;opacity:.07;
        background-image:linear-gradient(to right,#F5F7FA 1px,transparent 1px),
                         linear-gradient(to bottom,#F5F7FA 1px,transparent 1px);
        background-size:64px 64px;
        -webkit-mask-image:radial-gradient(ellipse 75% 65% at 45% 40%,#000 30%,transparent 78%)}
  .wrap{position:relative;height:100%;padding:66px 72px;display:flex;flex-direction:column;justify-content:space-between}
  .top{display:flex;align-items:center;gap:16px}
  .logo{width:56px;height:56px;border-radius:16px;display:grid;place-items:center;
        background:linear-gradient(135deg,#22d3ee,#8b5cf6);font-weight:700;font-size:19px;color:#fff}
  .who{font-size:21px;font-weight:600;letter-spacing:-.01em}
  .role{font-size:14px;color:#78808f;font-family:ui-monospace,monospace;
        letter-spacing:.16em;text-transform:uppercase;margin-top:3px}
  h1{font-family:'Clash Display','Satoshi',sans-serif;font-size:82px;line-height:.98;
     font-weight:600;letter-spacing:-.03em;max-width:1000px}
  .grad{background:linear-gradient(100deg,#22d3ee,#8b5cf6 45%,#f472b6);
        -webkit-background-clip:text;background-clip:text;color:transparent}
  .bottom{display:flex;align-items:flex-end;justify-content:space-between;gap:40px}
  .tags{display:flex;gap:10px;flex-wrap:wrap;max-width:820px}
  .tag{border:1px solid rgba(255,255,255,.11);background:rgba(20,22,31,.6);
       border-radius:9999px;padding:8px 17px;font-size:16px;color:#a2aab9}
  .stat{text-align:right;white-space:nowrap}
  .stat b{font-family:'Clash Display',sans-serif;font-size:46px;font-weight:700;display:block;line-height:1;
          background:linear-gradient(100deg,#22d3ee,#8b5cf6);-webkit-background-clip:text;
          background-clip:text;color:transparent}
  .stat span{font-size:15px;color:#78808f}
</style></head>
<body>
  <div class="bloom b1"></div><div class="bloom b2"></div><div class="bloom b3"></div>
  <div class="grid"></div>
  <div class="wrap">
    <div class="top">
      <div class="logo">SW</div>
      <div><div class="who">${NAME}</div><div class="role">${ROLE}</div></div>
    </div>
    <h1>I build software that <span class="grad">ships</span> and keeps working.</h1>
    <div class="bottom">
      <div class="tags">
        <div class="tag">AI &amp; LLM Engineering</div>
        <div class="tag">Custom CRM</div>
        <div class="tag">React &amp; Node</div>
        <div class="tag">Shopify &amp; Magento</div>
        <div class="tag">Power BI</div>
      </div>
      <div class="stat"><b>${YEARS}+</b><span>years shipping</span></div>
    </div>
  </div>
</body></html>`

const ICON = `<!doctype html><html><head><meta charset="utf-8" /><style>
  *{margin:0;padding:0}
  body{width:512px;height:512px;display:grid;place-items:center;
       background:linear-gradient(135deg,#22d3ee,#8b5cf6 55%,#f472b6);
       font-family:ui-sans-serif,system-ui,sans-serif}
  span{font-size:215px;font-weight:700;color:#fff;letter-spacing:-8px}
</style></head><body><span>SW</span></body></html>`

await mkdir('public/og', { recursive: true })
await mkdir('public/images', { recursive: true })

const browser = await chromium.launch()

// Social card
const cardPage = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await cardPage.setContent(CARD, { waitUntil: 'networkidle' })
await cardPage.waitForTimeout(1200) // let the webfont land
await cardPage.screenshot({ path: 'public/og/default.png' })
console.log('✓ public/og/default.png (1200x630)')

// PWA / apple-touch icons
for (const size of [512, 192, 180]) {
  const p = await browser.newPage({ viewport: { width: 512, height: 512 } })
  await p.setContent(ICON)
  await p.waitForTimeout(150)
  const file = size === 180 ? 'public/images/apple-touch-icon.png' : `public/images/icon-${size}.png`
  await p.screenshot({ path: file, scale: 'css', clip: { x: 0, y: 0, width: 512, height: 512 } })
  console.log(`✓ ${file}`)
  await p.close()
}

await browser.close()
