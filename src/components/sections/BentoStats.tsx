import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { ArrowUpRight, GraduationCap, Globe, Plane, Terminal } from 'lucide-react'
import { SITE } from '@/data/site'
import { SKILL_GROUPS, TOTAL_SKILLS } from '@/data/skills'
import { PROJECTS } from '@/data/projects'
import { GlassCard, StatusDot } from '@/components/ui/Surfaces'
import { Reveal } from '@/components/ui/Reveal'
import { cn } from '@/lib/cn'

/** Counts up once the tile scrolls into view. */
function CountUp({ to, suffix = '', duration = 1400 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduced = useReducedMotion()
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (reduced) {
      setValue(to)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      // easeOutExpo — fast start, gentle settle
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
      setValue(Math.round(eased * to))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration, reduced])

  return (
    <span ref={ref} className="tabular-nums">
      {value}
      {suffix}
    </span>
  )
}

/** Fake terminal session — types itself once visible. */
function MiniTerminal() {
  const lines = [
    { prompt: true, text: 'whoami' },
    { prompt: false, text: 'shahbaz — full stack & AI engineer' },
    { prompt: true, text: 'cat stack.txt' },
    { prompt: false, text: 'react · node · python · postgres · aws' },
    { prompt: true, text: 'status --availability' },
    { prompt: false, text: '● open to work · relocating worldwide' },
  ]
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const reduced = useReducedMotion()
  const [shown, setShown] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (reduced) {
      setShown(lines.length)
      return
    }
    let i = 0
    const id = setInterval(() => {
      i++
      setShown(i)
      if (i >= lines.length) clearInterval(id)
    }, 420)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced])

  return (
    <div ref={ref} className="font-mono text-[0.6875rem] leading-relaxed sm:text-xs">
      {lines.slice(0, shown).map((l, i) => (
        <div key={i} className={cn('truncate', l.prompt ? 'text-subtle' : 'text-muted')}>
          {l.prompt && <span className="text-cyan mr-1.5">❯</span>}
          {l.text}
        </div>
      ))}
      {shown < lines.length && <span className="bg-cyan inline-block h-3 w-1.5 animate-pulse" />}
    </div>
  )
}

export function BentoStats() {
  const topTech = ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'PostgreSQL', 'Next.js', 'Docker']

  return (
    <section className="container-page section-y">
      <Reveal>
        <div className="mb-10 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="from-cyan h-px w-8 bg-gradient-to-r to-transparent" />
            <span className="font-mono text-xs tracking-[0.2em] text-subtle uppercase">
              At a glance
            </span>
          </div>
          <h2 className="max-w-3xl text-3xl leading-[1.1] sm:text-4xl lg:text-5xl">
            A decade of shipping, across the whole stack
          </h2>
        </div>
      </Reveal>

      <div className="grid auto-rows-[minmax(0,auto)] grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Years — hero tile */}
        <Reveal className="col-span-2 lg:row-span-2" delay={0.02}>
          <GlassCard interactive spotlight className="flex h-full flex-col justify-between p-7 lg:p-9">
            <div className="flex items-start justify-between">
              <span className="text-subtle font-mono text-xs tracking-widest uppercase">
                Experience
              </span>
              <span className="text-subtle font-mono text-xs">since {SITE.startedYear}</span>
            </div>
            <div className="my-8">
              <div className="font-display text-gradient text-[clamp(4rem,13vw,7rem)] leading-none font-bold">
                <CountUp to={SITE.yearsExperience} suffix="+" />
              </div>
              <p className="text-ink mt-2 text-xl font-medium">years building software</p>
              <p className="text-muted mt-3 max-w-md text-sm leading-relaxed">
                From WordPress sites for local businesses to AI systems and CRM platforms serving
                hundreds of users. The stack changed; the discipline didn't.
              </p>
            </div>
            <Link
              to="/about"
              className="text-muted hover:text-ink group inline-flex items-center gap-2 text-sm font-medium transition-colors"
            >
              Read the full story
              <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </GlassCard>
        </Reveal>

        {/* Projects */}
        <Reveal delay={0.06}>
          <GlassCard interactive className="flex h-full flex-col justify-between p-6">
            <span className="text-subtle font-mono text-xs tracking-widest uppercase">Projects</span>
            <div className="mt-6">
              <div className="font-display text-ink text-4xl font-bold lg:text-5xl">
                <CountUp to={SITE.projectsDelivered} suffix="+" />
              </div>
              <p className="text-muted mt-1 text-sm">delivered end to end</p>
            </div>
          </GlassCard>
        </Reveal>

        {/* Clients */}
        <Reveal delay={0.1}>
          <GlassCard interactive className="flex h-full flex-col justify-between p-6">
            <span className="text-subtle font-mono text-xs tracking-widest uppercase">Clients</span>
            <div className="mt-6">
              <div className="font-display text-ink text-4xl font-bold lg:text-5xl">
                <CountUp to={SITE.clientsServed} suffix="+" />
              </div>
              <p className="text-muted mt-1 text-sm">startups to enterprise</p>
            </div>
          </GlassCard>
        </Reveal>

        {/* Terminal */}
        <Reveal className="col-span-2" delay={0.14}>
          <GlassCard interactive className="h-full overflow-hidden">
            <div className="border-line flex items-center gap-1.5 border-b px-4 py-2.5">
              <span className="h-2 w-2 rounded-full bg-red-400/60" />
              <span className="h-2 w-2 rounded-full bg-amber-400/60" />
              <span className="h-2 w-2 rounded-full bg-emerald-400/60" />
              <span className="text-subtle ml-2 inline-flex items-center gap-1.5 font-mono text-[0.625rem]">
                <Terminal size={11} /> zsh
              </span>
            </div>
            <div className="p-4">
              <MiniTerminal />
            </div>
          </GlassCard>
        </Reveal>

        {/* Tech stack */}
        <Reveal className="col-span-2" delay={0.18}>
          <GlassCard interactive className="flex h-full flex-col p-6">
            <div className="flex items-baseline justify-between">
              <span className="text-subtle font-mono text-xs tracking-widest uppercase">
                Core stack
              </span>
              <Link to="/skills" className="text-subtle hover:text-ink text-xs transition-colors">
                {TOTAL_SKILLS} skills →
              </Link>
            </div>
            <ul className="mt-5 flex flex-wrap gap-2">
              {topTech.map((t, i) => (
                <motion.li
                  key={t}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.35 }}
                  className="border-line bg-surface-2 text-ink rounded-lg border px-2.5 py-1.5 font-mono text-xs"
                >
                  {t}
                </motion.li>
              ))}
            </ul>
            <p className="text-subtle mt-auto pt-5 text-xs">
              Across {SKILL_GROUPS.length} domains — AI, frontend, backend, data, cloud, mobile, games.
            </p>
          </GlassCard>
        </Reveal>

        {/* Education */}
        <Reveal delay={0.22}>
          <GlassCard interactive className="flex h-full flex-col justify-between p-6">
            <GraduationCap size={20} className="text-violet" />
            <div className="mt-6">
              <p className="text-ink font-display text-lg leading-tight font-semibold">MSc AI</p>
              <p className="text-muted mt-1 text-sm">Iqra University</p>
              <p className="text-subtle mt-3 text-xs">BSc Computer Science — DHA Suffa University</p>
            </div>
          </GlassCard>
        </Reveal>

        {/* Availability / relocation */}
        <Reveal delay={0.26}>
          <GlassCard interactive className="flex h-full flex-col justify-between p-6">
            <Plane size={20} className="text-cyan" />
            <div className="mt-6">
              <div className="text-ink mb-2 inline-flex items-center gap-2 text-sm font-medium">
                <StatusDot />
                Available
              </div>
              <p className="text-muted text-sm leading-relaxed">
                Open to relocating worldwide, and to fully remote roles.
              </p>
              <p className="text-subtle mt-3 inline-flex items-center gap-1.5 text-xs">
                <Globe size={12} /> {SITE.location} · {SITE.timezone}
              </p>
            </div>
          </GlassCard>
        </Reveal>

        {/* Case studies count */}
        <Reveal className="col-span-2" delay={0.3}>
          <GlassCard interactive spotlight className="flex h-full items-center justify-between gap-4 p-6">
            <div>
              <span className="text-subtle font-mono text-xs tracking-widest uppercase">
                Case studies
              </span>
              <p className="text-ink mt-3 text-lg leading-snug">
                <span className="font-display text-2xl font-bold">{PROJECTS.length}</span> detailed
                write-ups — the problem, the architecture, the numbers.
              </p>
            </div>
            <Link
              to="/work"
              aria-label="Browse all case studies"
              className="border-line text-muted hover:border-transparent hover:bg-[linear-gradient(120deg,var(--accent-cyan),var(--accent-violet))] grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-all duration-300 hover:text-white"
            >
              <ArrowUpRight size={18} />
            </Link>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  )
}
