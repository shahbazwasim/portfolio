import { Link } from 'react-router-dom'
import { MARQUEE_SKILLS, SKILL_GROUPS, TOTAL_SKILLS } from '@/data/skills'
import { Marquee } from '@/components/ui/Surfaces'
import { Reveal } from '@/components/ui/Reveal'

function Pill({ label }: { label: string }) {
  return (
    <span className="glass border-line text-muted rounded-full px-4 py-2 text-sm whitespace-nowrap">
      {label}
    </span>
  )
}

/** Two counter-scrolling bands of expert-level skills. */
export function SkillsMarquee() {
  const half = Math.ceil(MARQUEE_SKILLS.length / 2)
  const rowA = MARQUEE_SKILLS.slice(0, half)
  const rowB = MARQUEE_SKILLS.slice(half)

  return (
    <section className="section-y overflow-hidden">
      <Reveal className="container-page mb-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-3">
            <span className="from-cyan h-px w-8 bg-gradient-to-r to-transparent" />
            <span className="text-subtle font-mono text-xs tracking-[0.2em] uppercase">
              Capabilities
            </span>
            <span className="to-violet h-px w-8 bg-gradient-to-l from-transparent" />
          </div>
          <h2 className="max-w-3xl text-3xl leading-[1.1] sm:text-4xl">
            {TOTAL_SKILLS} skills across {SKILL_GROUPS.length} domains —
            <span className="text-gradient"> each one attached to real work</span>
          </h2>
          <Link
            to="/skills"
            className="text-muted hover:text-ink mt-1 text-sm underline underline-offset-4 transition-colors"
          >
            Browse the full skills matrix
          </Link>
        </div>
      </Reveal>

      <div className="flex flex-col gap-4">
        <Marquee speed={58}>
          {rowA.map((s) => (
            <Pill key={s} label={s} />
          ))}
        </Marquee>
        <Marquee speed={64} reverse>
          {rowB.map((s) => (
            <Pill key={s} label={s} />
          ))}
        </Marquee>
      </div>
    </section>
  )
}
