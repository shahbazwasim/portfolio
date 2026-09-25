import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Search, X } from 'lucide-react'
import { Seo, breadcrumbJsonLd } from '@/lib/seo'
import { LEVEL_META, SKILL_GROUPS, TOTAL_SKILLS, type Skill } from '@/data/skills'
import { getProject } from '@/data/projects'
import { GlassCard } from '@/components/ui/Surfaces'
import { Icon } from '@/components/ui/Icon'
import { Reveal } from '@/components/ui/Reveal'
import { cn } from '@/lib/cn'

function SkillRow({ skill }: { skill: Skill }) {
  const [open, setOpen] = useState(false)
  const linked = (skill.projects ?? []).map(getProject).filter(Boolean)
  const expandable = linked.length > 0 || !!skill.note

  return (
    <li className="border-line/70 border-b last:border-b-0">
      <button
        onClick={() => expandable && setOpen((v) => !v)}
        aria-expanded={expandable ? open : undefined}
        disabled={!expandable}
        className={cn(
          'flex w-full items-center justify-between gap-4 py-3 text-left transition-colors',
          expandable ? 'hover:text-ink cursor-pointer' : 'cursor-default'
        )}
      >
        <span className="text-muted flex min-w-0 items-center gap-3 text-sm">
          <span className="truncate">{skill.name}</span>
          {linked.length > 0 && (
            <span className="text-subtle shrink-0 font-mono text-[0.625rem]">
              {linked.length} {linked.length === 1 ? 'project' : 'projects'}
            </span>
          )}
        </span>
        <span
          className={cn(
            'shrink-0 rounded-full border px-2 py-0.5 font-mono text-[0.625rem] tracking-wide',
            LEVEL_META[skill.level].tone
          )}
        >
          {LEVEL_META[skill.level].label}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && expandable && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-4">
              {skill.note && (
                <p className="text-subtle mb-3 text-xs leading-relaxed">{skill.note}</p>
              )}
              {linked.length > 0 && (
                <ul className="flex flex-wrap gap-1.5">
                  {linked.map((p) => (
                    <li key={p!.slug}>
                      <Link
                        to={`/work/${p!.slug}`}
                        className="border-line bg-surface-2 text-muted hover:text-ink hover:border-line-strong inline-block rounded-md border px-2 py-1 text-[0.6875rem] transition-colors"
                      >
                        {p!.client}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

export default function Skills() {
  const [query, setQuery] = useState('')

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return SKILL_GROUPS
    return SKILL_GROUPS.map((g) => ({
      ...g,
      skills: g.skills.filter(
        (s) => s.name.toLowerCase().includes(q) || s.note?.toLowerCase().includes(q)
      ),
    })).filter((g) => g.skills.length > 0)
  }, [query])

  const matchCount = groups.reduce((n, g) => n + g.skills.length, 0)

  return (
    <>
      <Seo
        title="Skills"
        description={`${TOTAL_SKILLS} technical skills across ${SKILL_GROUPS.length} domains — AI and machine learning, frontend, backend, CRM, e-commerce, data engineering, cloud, mobile, game development and design. Each linked to the projects that used it.`}
        path="/skills"
        keywords={['skills', 'tech stack', 'React', 'Node.js', 'Python', 'AI', 'AWS', 'Power BI']}
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Skills', path: '/skills' },
        ])}
      />

      <section className="container-page pt-32 pb-12 lg:pt-40">
        <Reveal>
          <span className="text-subtle font-mono text-xs tracking-[0.2em] uppercase">
            Capabilities
          </span>
          <h1 className="mt-5 max-w-4xl text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.02]">
            {TOTAL_SKILLS} skills.
            <br />
            <span className="text-gradient">Each one attached to real work.</span>
          </h1>
          <p className="text-muted mt-7 max-w-2xl text-lg leading-relaxed">
            A skills list is easy to write and hard to trust. Every entry here that has been used on
            a project links straight to that case study — click one and check.
          </p>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="border-line bg-surface-2/60 mt-9 flex max-w-md items-center gap-3 rounded-xl border px-4">
            <Search size={16} className="text-subtle shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter skills — try “react”, “rag”, “aws”…"
              aria-label="Filter skills"
              className="text-ink placeholder:text-subtle h-12 flex-1 bg-transparent text-sm outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="Clear filter"
                className="text-subtle hover:text-ink shrink-0 transition-colors"
              >
                <X size={15} />
              </button>
            )}
          </div>
          {query && (
            <p className="text-subtle mt-3 text-sm" aria-live="polite">
              {matchCount} {matchCount === 1 ? 'match' : 'matches'}
            </p>
          )}
        </Reveal>

        {/* Legend */}
        <Reveal delay={0.1}>
          <ul className="mt-7 flex flex-wrap items-center gap-4">
            {(['expert', 'advanced', 'proficient'] as const).map((lvl) => (
              <li key={lvl} className="flex items-center gap-2">
                <span
                  className={cn(
                    'rounded-full border px-2 py-0.5 font-mono text-[0.625rem]',
                    LEVEL_META[lvl].tone
                  )}
                >
                  {LEVEL_META[lvl].label}
                </span>
              </li>
            ))}
            <li className="text-subtle text-xs">Click any skill with projects to see where.</li>
          </ul>
        </Reveal>
      </section>

      <section className="container-page pb-24">
        {groups.length === 0 ? (
          <div className="border-line rounded-panel border border-dashed px-6 py-20 text-center">
            <p className="text-muted">Nothing matches “{query}”.</p>
            <button
              onClick={() => setQuery('')}
              className="text-cyan mt-3 text-sm underline underline-offset-4"
            >
              Clear filter
            </button>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {groups.map((g, i) => (
              // min-w-0: grid items otherwise refuse to shrink below their longest
              // skill name, and the row's `truncate` never gets the chance to engage.
              <Reveal key={g.id} delay={Math.min(i * 0.04, 0.2)} className="min-w-0">
                <GlassCard className="flex h-full flex-col p-6 lg:p-7" ring={false}>
                  <div className="mb-1 flex items-start gap-3.5">
                    <span className="border-line bg-surface-2 text-accent grid h-10 w-10 shrink-0 place-items-center rounded-xl border">
                      <Icon name={g.icon} size={18} />
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-ink text-lg leading-snug">{g.title}</h2>
                      <p className="text-subtle mt-0.5 font-mono text-xs">
                        {g.skills.length} skills
                      </p>
                    </div>
                  </div>
                  <p className="text-muted mt-3 text-sm leading-relaxed">{g.blurb}</p>

                  <ul className="border-line mt-5 flex flex-col border-t">
                    {g.skills.map((s) => (
                      <SkillRow key={s.name} skill={s} />
                    ))}
                  </ul>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
