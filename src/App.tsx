import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ThemeProvider } from '@/lib/theme'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { Aurora, Grain } from '@/components/ui/Aurora'
import { CommandPalette } from '@/components/layout/CommandPalette'
import { ScrollProgress } from '@/components/layout/ScrollProgress'
import { AriaDock } from '@/components/assistant/AriaDock'

/** Resets scroll on navigation — the router keeps position by default. */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

/**
 * Lenis smooth scroll, loaded lazily on the client only.
 * Skipped entirely under reduced-motion and on coarse pointers, where the
 * native momentum scrolling is better than anything JS can fake.
 */
function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarse = window.matchMedia('(pointer: coarse)').matches
    if (reduced || coarse) return

    let lenis: { raf: (t: number) => void; destroy: () => void } | undefined
    let frame = 0
    let cancelled = false

    import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return
      lenis = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 0.9 })
      const raf = (time: number) => {
        lenis?.raf(time)
        frame = requestAnimationFrame(raf)
      }
      frame = requestAnimationFrame(raf)
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      lenis?.destroy()
    }
  }, [])
  return null
}

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false)

  return (
    <ThemeProvider>
      <ScrollToTop />
      <SmoothScroll />

      <Aurora position="fixed" intensity="normal" />
      <Grain />
      <ScrollProgress />

      <Nav onOpenPalette={() => setPaletteOpen(true)} />

      <main id="main" className="relative">
        <Outlet />
      </main>

      <Footer />

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <AriaDock />
    </ThemeProvider>
  )
}
