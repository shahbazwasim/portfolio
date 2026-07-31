import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowDown, ArrowUpRight, Download, MapPin } from 'lucide-react'
import { SITE } from '@/data/site'
import { LinkButton, MagneticButton } from '@/components/ui/Button'
import { StatusDot } from '@/components/ui/Surfaces'
import { HeroPortrait } from '@/components/ui/Avatar'

const GLYPHS = '!<>-_\\/[]{}—=+*^?#________'

/**
 * Cycles job titles with a character-scramble transition.
 * Starts on the first role so the server and client agree on initial markup,
 * and degrades to a plain swap when motion is reduced.
 */
function RoleRotator({ roles }: { roles: readonly string[] }) {
  const [display, setDisplay] = useState(roles[0])
  const indexRef = useRef(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (roles.length < 2) return

    let frame = 0
    let raf = 0
    let timeout: ReturnType<typeof setTimeout>

    const scrambleTo = (next: string) => {
      const from = display
      const length = Math.max(from.length, next.length)
      // Each character resolves at its own moment, so the word settles left-to-right.
      const schedule = Array.from({ length }, (_, i) => ({
        start: Math.floor(i * 1.6),
        end: Math.floor(i * 1.6) + 8 + Math.floor(Math.random() * 10),
      }))

      frame = 0
      const tick = () => {
        let output = ''
        let done = 0
        for (let i = 0; i < length; i++) {
          const { start, end } = schedule[i]
          if (frame >= end) {
            output += next[i] ?? ''
            done++
          } else if (frame >= start) {
            output += GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          } else {
            output += from[i] ?? ''
          }
        }
        setDisplay(output)
        if (done === length) {
          setDisplay(next)
          timeout = setTimeout(cycle, 2600)
          return
        }
        frame++
        raf = requestAnimationFrame(tick)
      }
      tick()
    }

    const cycle = () => {
      indexRef.current = (indexRef.current + 1) % roles.length
      const next = roles[indexRef.current]
      if (reduced) {
        setDisplay(next)
        timeout = setTimeout(cycle, 3200)
      } else {
        scrambleTo(next)
      }
    }

    timeout = setTimeout(cycle, 2600)
    return () => {
      clearTimeout(timeout)
      cancelAnimationFrame(raf)
    }
    // `display` is intentionally excluded — including it would restart the
    // scramble on every frame it sets.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roles, reduced])

  return (
    <span className="text-gradient font-mono tabular-nums" aria-live="polite">
      {display}
    </span>
  )
}

export function Hero() {
  const reduced = useReducedMotion()

  // `useReducedMotion` resolves to null during prerender and to a real boolean
  // on the client, so anything it *structurally* gates has to wait for mount —
  // otherwise visitors with reduced motion enabled hit a hydration mismatch.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-28 pb-20 lg:pt-32">
      <div className="container-page relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
          {/* ---------------------------------------------------- copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="glass border-line text-muted mb-7 inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-sm"
            >
              <StatusDot />
              {SITE.availability.label}
              <span className="text-subtle hidden items-center gap-1 sm:inline-flex">
                <span className="bg-line mx-1 h-3 w-px" />
                <MapPin size={12} />
                {SITE.location}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="text-[clamp(2.5rem,7.5vw,5.25rem)] leading-[0.98]"
            >
              I build software
              <br />
              that <span className="text-gradient">ships</span> and
              <br />
              keeps working.
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-lg sm:text-xl"
            >
              <span className="text-subtle font-mono text-sm">$</span>
              <span className="text-muted">Shahbaz Wasim —</span>
              <RoleRotator roles={SITE.roles} />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-muted mt-7 max-w-xl text-base leading-relaxed sm:text-lg"
            >
              {SITE.yearsExperience}+ years across AI systems, custom CRMs, commerce platforms and
              data pipelines. I take products from discovery to production — and hand them over
              documented, tested and maintainable.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <MagneticButton>
                <LinkButton to="/work" size="lg" icon={<ArrowUpRight size={18} />}>
                  View my work
                </LinkButton>
              </MagneticButton>
              <LinkButton to="/demos" variant="secondary" size="lg">
                Try the live demos
              </LinkButton>
              <LinkButton
                to={SITE.resumePath}
                variant="ghost"
                size="lg"
                external
                icon={<Download size={16} />}
              >
                Résumé
              </LinkButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.42 }}
              className="border-line mt-12 flex flex-wrap items-center gap-x-7 gap-y-3 border-t pt-7"
            >
              {[
                { k: `${SITE.yearsExperience}+`, v: 'years shipping' },
                { k: `${SITE.projectsDelivered}+`, v: 'projects delivered' },
                { k: `${SITE.clientsServed}+`, v: 'clients served' },
                { k: 'MSc', v: 'Artificial Intelligence' },
              ].map((s) => (
                <div key={s.v} className="flex items-baseline gap-2">
                  <span className="font-display text-ink text-xl font-semibold">{s.k}</span>
                  <span className="text-subtle text-sm">{s.v}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ------------------------------------------------- portrait */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto w-full max-w-sm lg:max-w-none"
          >
            <div className="relative aspect-square">
              {/* Glow behind the portrait */}
              <div
                aria-hidden="true"
                className="absolute inset-[8%] rounded-full blur-3xl"
                style={{
                  background:
                    'radial-gradient(circle, color-mix(in oklab, var(--accent-violet) 45%, transparent), transparent 68%)',
                }}
              />

              {/* Counter-rotating rings — client-only, see the note above */}
              {mounted && !reduced && (
                <>
                  <motion.div
                    aria-hidden="true"
                    className="border-cyan/20 absolute inset-0 rounded-full border border-dashed"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 42, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.div
                    aria-hidden="true"
                    className="border-violet/15 absolute inset-[6%] rounded-full border"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 56, repeat: Infinity, ease: 'linear' }}
                  />
                </>
              )}

              <HeroPortrait className="absolute inset-[10%] h-[80%] w-[80%] shadow-[0_24px_80px_-24px_var(--glow)]" />

              {/* Floating capability chips */}
              {[
                { label: 'AI / LLM', className: 'top-[6%] right-[2%]', delay: 0.6 },
                { label: 'Full Stack', className: 'bottom-[16%] left-[-2%]', delay: 0.75 },
                { label: 'CRM', className: 'bottom-[2%] right-[12%]', delay: 0.9 },
              ].map((chip) => (
                <motion.span
                  key={chip.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: chip.delay, ease: [0.34, 1.56, 0.64, 1] }}
                  className={`glass border-line text-ink absolute rounded-full px-3.5 py-1.5 font-mono text-xs shadow-[var(--shadow-card)] ${chip.className}`}
                >
                  {chip.label}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.a
        href="#featured"
        aria-label="Scroll to featured work"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="text-subtle hover:text-ink absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 transition-colors lg:flex"
      >
        <span className="font-mono text-[0.625rem] tracking-[0.2em] uppercase">Scroll</span>
        <motion.span
          animate={reduced ? {} : { y: [0, 5, 0] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowDown size={15} />
        </motion.span>
      </motion.a>
    </section>
  )
}
