import { Link } from 'react-router-dom'
import { ArrowUpRight, Play } from 'lucide-react'
import type { Project } from '@/data/projects'
import { ProjectVisual } from '@/components/ui/ProjectVisual'
import { BrandMark } from '@/components/ui/BrandMark'
import { cn } from '@/lib/cn'

export function ProjectCard({
  project,
  className,
  /** Wide layout used for the first featured card. */
  featured = false,
}: {
  project: Project
  className?: string
  featured?: boolean
}) {
  return (
    <article
      className={cn(
        'group glass rounded-panel relative overflow-hidden transition-[transform,box-shadow,border-color] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1.5 hover:border-line-strong hover:shadow-[var(--shadow-lift)]',
        className
      )}
    >
      <Link
        to={`/work/${project.slug}`}
        className="block focus-visible:outline-none"
        aria-label={`${project.title} — case study for ${project.client}`}
      >
        <div className={cn('grid', featured && 'lg:grid-cols-[1.05fr_1fr]')}>
          {/* Visual */}
          <div className="relative overflow-hidden p-3 pb-0 lg:p-4 lg:pb-0">
            <div className="overflow-hidden rounded-lg transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.02]">
              <ProjectVisual
                slug={project.slug}
                category={project.category}
                src={project.screenshots[0]?.src}
                alt={project.screenshots[0]?.caption ?? project.title}
              />
            </div>
            {project.demoSlug && (
              <span className="glass border-line text-ink absolute top-6 right-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium lg:top-7 lg:right-7">
                <Play size={11} className="fill-current" />
                Live demo
              </span>
            )}
          </div>

          {/* Copy */}
          <div className={cn('flex flex-col p-5 lg:p-7', featured && 'lg:justify-center')}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <BrandMark name={project.client} slug={project.slug} size="sm" />
              <span className="text-subtle shrink-0 font-mono text-xs">{project.year}</span>
            </div>

            <h3
              className={cn(
                'text-ink leading-tight transition-colors',
                featured ? 'text-2xl lg:text-3xl' : 'text-xl'
              )}
            >
              {project.title}
            </h3>

            <p className="text-muted mt-3 text-sm leading-relaxed">{project.summary}</p>

            {/* Metrics */}
            <dl className="border-line mt-5 grid grid-cols-3 gap-3 border-t pt-5">
              {project.metrics.map((m) => (
                <div key={m.label}>
                  <dt className="text-subtle text-[0.6875rem] leading-tight">{m.label}</dt>
                  <dd className="font-display text-gradient mt-1 text-lg font-semibold">
                    {m.value}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Tech + affordance */}
            <div className="mt-5 flex items-end justify-between gap-4">
              <ul className="flex flex-wrap gap-1.5">
                {project.tech.slice(0, featured ? 6 : 4).map((t) => (
                  <li
                    key={t}
                    className="border-line bg-surface-2 text-subtle rounded-md border px-2 py-0.5 font-mono text-[0.6875rem]"
                  >
                    {t}
                  </li>
                ))}
                {project.tech.length > (featured ? 6 : 4) && (
                  <li className="text-subtle px-1 py-0.5 font-mono text-[0.6875rem]">
                    +{project.tech.length - (featured ? 6 : 4)}
                  </li>
                )}
              </ul>
              <span className="border-line text-muted group-hover:border-transparent group-hover:bg-[linear-gradient(120deg,var(--accent-cyan),var(--accent-violet))] grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-300 group-hover:text-white">
                <ArrowUpRight size={16} />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}
