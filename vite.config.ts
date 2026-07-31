import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // Demos are heavy and route-split; raise the warning bar so the build log stays useful.
    chunkSizeWarningLimit: 900,
    // No manualChunks here on purpose. Grouping recharts/jspdf into named vendor
    // chunks made Rollup treat them as shared, so the home page modulepreloaded
    // ~250KB of charting and PDF code it never runs. Rollup's default splitting
    // keeps them inside the lazily-imported demo chunks that actually use them.
  },
  ssr: {
    // These reach for `window`/`document` at import time — keep them out of the SSG bundle.
    noExternal: ['recharts', 'lucide-react'],
  },
  ssgOptions: {
    // Critical-CSS inlining measured *worse* here: it inlines ~45KB into every
    // one of the 35 prerendered pages while still loading the full sheet, which
    // cost more in HTML transfer than it saved in round trips (desktop LCP
    // 1.3s -> 1.5s, Lighthouse 95 -> 88). One cacheable stylesheet wins.
    beastiesOptions: false,
    onPageRendered: (_route, html) => {
      // 1. react-helmet-async injects <title>/<meta> at the very start of <head>,
      //    pushing the charset declaration past the 1024-byte window that
      //    browsers (and Lighthouse) require it to sit in. Hoist it back.
      let out = html
        .replace(/<meta charset="utf-8">/i, '')
        .replace('<head>', '<head><meta charset="UTF-8">')

      // 2. Every JetBrains Mono unicode subset gets an automatic font preload —
      //    ~100KB of cyrillic/greek/vietnamese/latin-ext this site never
      //    renders. Dropping the preload doesn't remove the @font-face rules,
      //    so any page that did need them would still fetch on demand.
      out = out.replace(
        /<link rel="preload" as="font"[^>]*jetbrains-mono-(?:cyrillic|greek|vietnamese|latin-ext)[^>]*>/g,
        ''
      )

      return out
    },
  },
})
