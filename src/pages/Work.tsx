import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ListFilter, X } from 'lucide-react'
import { Seo, breadcrumbJsonLd } from '@/lib/seo'
import { PROJECTS, PROJECT_CATEGORIES, allProjectTech, type ProjectCategory } from '@/data/projects'
import { ProjectCard } from '@/components/ui/ProjectCard'
import { Reveal } from '@/components/ui/Reveal'
import { cn } from '@/lib/cn'

type Filter = (typeof PROJECT_CATEGORIES)[number]

export default function Work() {
  const [category, setCategory] = useState<Filter>('All')
  const [tech, setTech] = useState<string | null>(null)

  const techOptions = useMemo(() => allProjectTech().slice(0, 18), [])

  const filtered = useMemo(
    () =>
      PROJECTS.filter((p) => {
        if (category !== 'All' && p.category !== (category as ProjectCategory)) return false
        if (tech && !p.tech.includes(tech)) return false
        return true
      }),
    [category, tech]
  )

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of PROJECTS) map.set(p.category, (map.get(p.category) ?? 0) + 1)
    return map
  }, [])

  const hasFilters = category !== 'All' || tech !== null

  return (
    <>
      <Seo
        title="Work"
        description={`${PROJECTS.length} detailed case studies across AI, CRM platforms, e-commerce, data engineering, cloud infrastructure and UEFN game development — with the architecture decisions and measured outcomes behind each one.`}
        path="/work"
        keywords={['case studies', 'portfolio', 'AI projects', 'CRM development', 'Shopify', 'Magento', 'UEFN', 'Verse', 'Fortnite Creative']}
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Work', path: '/work' },
        ])}
      />

      <section className="container-page pt-32 pb-12 lg:pt-40">
        <Reveal>
          <span className="text-subtle font-mono text-xs tracking-[0.2em] uppercase">
            Case studies
          </span>
          <h1 className="mt-5 max-w-4xl text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.02]">
            The problem, the architecture,
            <br />
            <span className="text-gradient">the numbers.</span>
          </h1>
          <p className="text-muted mt-7 max-w-2xl text-lg leading-relaxed">
            {PROJECTS.length} projects written up properly — what was broken, how it was approached,
            what the decisions cost and what changed as a result. Several have a live demo attached.
          </p>
        </Reveal>
      </section>

      {/* Filters */}
      <section className="container-page">
        <Reveal delay={0.05}>
          <div className="border-line flex flex-col gap-4 border-y py-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-subtle mr-1 inline-flex items-center gap-1.5 font-mono text-xs tracking-widest uppercase">
                <ListFilter size={13} />
                Domain
              </span>
              {PROJECT_CATEGORIES.map((c) => {
                const active = c === category
                const n = c === 'All' ? PROJECTS.length : (counts.get(c) ?? 0)
                if (n === 0) return null
                return (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    aria-pressed={active}
                    className={cn(
                      'rounded-full border px-3.5 py-1.5 text-sm transition-all duration-200',
                      active
                        ? 'border-transparent bg-[linear-gradient(120deg,var(--accent-cyan),var(--accent-violet))] font-medium text-white'
                        : 'border-line text-muted hover:text-ink hover:border-line-strong'
                    )}
                  >
                    {c}
                    <span className={cn('ml-1.5 text-xs', active ? 'text-white/70' : 'text-subtle')}>
                      {n}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-subtle mr-1 font-mono text-xs tracking-widest uppercase">
                Tech
              </span>
              {techOptions.map((t) => {
                const active = t === tech
                return (
                  <button
                    key={t}
                    onClick={() => setTech(active ? null : t)}
                    aria-pressed={active}
                    className={cn(
                      'rounded-md border px-2 py-1 font-mono text-[0.6875rem] transition-colors',
                      active
                        ? 'border-cyan/50 bg-cyan/15 text-cyan'
                        : 'border-line bg-surface-2 text-subtle hover:text-ink'
                    )}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
          </div>
        </Reveal>

        <div className="text-subtle flex items-center justify-between gap-4 py-5 text-sm">
          <p aria-live="polite">
            Showing <span className="text-ink font-medium">{filtered.length}</span> of{' '}
            {PROJECTS.length}
          </p>
          {hasFilters && (
            <button
              onClick={() => {
                setCategory('All')
                setTech(null)
              }}
              className="hover:text-ink inline-flex items-center gap-1.5 transition-colors"
            >
              <X size={13} />
              Clear filters
            </button>
          )}
        </div>
      </section>

      {/* Grid */}
      <section className="container-page pb-24">
        {filtered.length === 0 ? (
          <div className="border-line rounded-panel border border-dashed px-6 py-20 text-center">
            <p className="text-muted">No case studies match that combination.</p>
            <button
              onClick={() => {
                setCategory('All')
                setTech(null)
              }}
              className="text-cyan mt-3 text-sm underline underline-offset-4"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <motion.div layout className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((p) => (
                <motion.div
                  key={p.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ProjectCard project={p} className="h-full" />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </>
  )
}
