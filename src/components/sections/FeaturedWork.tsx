import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { FEATURED_PROJECTS, PROJECTS } from '@/data/projects'
import { ProjectCard } from '@/components/ui/ProjectCard'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/Surfaces'

export function FeaturedWork() {
  const [lead, ...rest] = FEATURED_PROJECTS

  return (
    <section id="featured" className="container-page section-y scroll-mt-24">
      <Reveal>
        <div className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="Selected work"
            title={
              <>
                Problems worth <span className="text-gradient">solving properly</span>
              </>
            }
            description="Case studies with the architecture decisions and the numbers behind them — from AI systems to Fortnite islands. Several ship with a live demo you can click through."
          />
          <Link
            to="/work"
            className="text-muted hover:text-ink group inline-flex shrink-0 items-center gap-2 text-sm font-medium transition-colors"
          >
            All {PROJECTS.length} case studies
            <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </Reveal>

      <div className="flex flex-col gap-5">
        {lead && (
          <Reveal delay={0.04}>
            <ProjectCard project={lead} featured />
          </Reveal>
        )}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {rest.map((p, i) => (
            <Reveal key={p.slug} delay={0.06 + i * 0.05}>
              <ProjectCard project={p} className="h-full" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
