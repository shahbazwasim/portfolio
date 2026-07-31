/**
 * Converts the captured demo screenshots to WebP at a sensible display size.
 *
 * capture-screens.mjs writes 2x PNGs (2560px wide, ~300-450KB each). They are
 * never rendered wider than ~700 CSS px, so the extra pixels are pure download
 * cost — Lighthouse flagged ~1.3MB of it on the home page alone.
 *
 *   node scripts/optimize-images.mjs
 */
import sharp from 'sharp'
import { readdir, stat, unlink } from 'node:fs/promises'
import path from 'node:path'

const ROOT = 'public/images/projects'
/** 2x the widest rendered size (~700px in the case-study grid). */
const TARGET_WIDTH = 1400
const QUALITY = 78

async function walk(dir, acc = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) await walk(full, acc)
    else if (entry.name.endsWith('.png')) acc.push(full)
  }
  return acc
}

const files = await walk(ROOT)
let before = 0
let after = 0

for (const file of files) {
  const out = file.replace(/\.png$/, '.webp')
  const src = await stat(file)
  before += src.size

  await sharp(file)
    .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 6 })
    .toFile(out)

  const dst = await stat(out)
  after += dst.size
  await unlink(file)

  console.log(
    `✓ ${path.relative(ROOT, out).replace(/\\/g, '/')}  ` +
      `${(src.size / 1024).toFixed(0)}KB → ${(dst.size / 1024).toFixed(0)}KB ` +
      `(-${Math.round((1 - dst.size / src.size) * 100)}%)`
  )
}

console.log(
  `\n${files.length} images: ${(before / 1024 / 1024).toFixed(2)}MB → ${(after / 1024 / 1024).toFixed(2)}MB ` +
    `(-${Math.round((1 - after / before) * 100)}%)`
)
console.log('Remember: projects.ts references .webp paths.')
