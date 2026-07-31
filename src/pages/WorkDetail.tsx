import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, CircleCheck, Play } from 'lucide-react'
import { Seo, breadcrumbJsonLd } from '@/lib/seo'
import { PROJECTS, getProject } from '@/data/projects'
import { getDemo } from '@/data/demos'
import { ProjectVisual } from '@/components/ui/ProjectVisual'
import { BrandMark } from '@/components/ui/BrandMark'
import { GlassCard } from '@/components/ui/Surfaces'
import { Reveal } from '@/components/ui/Reveal'
import { LinkButton } from '@/components/ui/Button'
import { ProjectCard } from '@/components/ui/ProjectCard'

export default function WorkDetail() {
  const { slug } = useParams<{ slug: string }>()
  const project = slug ? getProject(slug) : undefined

  if (!project) return <Navigate to="/404" replace />

  const demo = project.demoSlug ? getDemo(project.demoSlug) : undefined
  const related = PROJECTS.filter(
    (p) => p.slug !== project.slug && p.category === project.category
  ).slice(0, 3)
  const fallbackRelated = PROJECTS.filter((p) => p.slug !== project.slug && p.featured).slice(0, 3)
  const suggestions = related.length >= 2 ? related : fallbackRelated

  return (
    <>
      <Seo
        title={project.title}
        description={`${project.summary} — ${project.client}, ${project.year}. ${project.metrics.map((m) => `${m.value} ${m.label.toLowerCase()}`).join(', ')}.`}
        path={`/work/${project.slug}`}
        type="article"
        keywords={[...project.tech, project.category, 'case study']}
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Work', path: '/work' },
          { name: project.title, path: `/work/${project.slug}` },
        ])}
      />

      {/* ------------------------------------------------------------ hero */}
      <section className="container-page pt-32 pb-14 lg:pt-40">
        <Reveal>
          <Link
            to="/work"
            className="text-subtle hover:text-ink group mb-9 inline-flex items-center gap-2 text-sm transition-colors"
          >
            <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
            All case studies
          </Link>
        </Reveal>

        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-14">
          <div>
            <Reveal>
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <BrandMark name={project.client} slug={project.slug} size="md" />
                <span className="bg-line h-4 w-px" />
                <span className="text-subtle text-sm">{project.clientDescriptor}</span>
              </div>

              <h1 className="text-[clamp(2rem,5vw,3.75rem)] leading-[1.05]">{project.title}</h1>

              <p className="text-muted mt-6 max-w-2xl text-lg leading-relaxed">{project.summary}</p>
            </Reveal>

            <Reveal delay={0.08}>
              <dl className="border-line mt-9 grid grid-cols-2 gap-6 border-t pt-7 sm:grid-cols-4">
                {[
                  { k: 'Role', v: project.role },
                  { k: 'Timeline', v: project.duration },
                  { k: 'Year', v: String(project.year) },
                  { k: 'Domain', v: project.category },
                ].map((row) => (
                  <div key={row.k}>
                    <dt className="text-subtle font-mono text-[0.625rem] tracking-[0.16em] uppercase">
                      {row.k}
                    </dt>
                    <dd className="text-ink mt-1.5 text-sm leading-snug font-medium">{row.v}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            {demo && (
              <Reveal delay={0.12}>
                <div className="mt-9">
                  <LinkButton
                    to={`/demos/${demo.slug}`}
                    icon={<Play size={15} className="fill-current" />}
                  >
                    Try the {demo.name} demo
                  </LinkButton>
                </div>
              </Reveal>
            )}
          </div>

          <Reveal delay={0.06} direction="right">
            <div className="lg:sticky lg:top-28">
              <ProjectVisual
                slug={project.slug}
                category={project.category}
                src={project.screenshots[0]?.src}
                alt={project.screenshots[0]?.caption ?? project.title}
                className="rounded-panel shadow-[var(--shadow-lift)]"
              />
              <p className="text-subtle mt-3 text-center text-xs">
                {project.screenshots[0]?.caption}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* --------------------------------------------------------- metrics */}
      <section className="container-page py-8">
        <Reveal>
          <div className="grid gap-4 sm:grid-cols-3">
            {project.metrics.map((m, i) => (
              <GlassCard key={m.label} interactive spotlight className="p-6 lg:p-8" ring={i === 0}>
                <p className="font-display text-gradient text-4xl leading-none font-bold lg:text-5xl">
                  {m.value}
                </p>
                <p className="text-muted mt-3 text-sm">{m.label}</p>
              </GlassCard>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ------------------------------------------------------- challenge */}
      <section className="container-page section-y">
        <div className="grid gap-10 lg:grid-cols-[auto_1fr] lg:gap-16">
          <Reveal>
            <h2 className="text-subtle font-mono text-xs tracking-[0.2em] uppercase lg:w-40">
              The challenge
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="max-w-3xl text-xl leading-relaxed sm:text-2xl">{project.challenge}</p>
          </Reveal>
        </div>
      </section>

      {/* -------------------------------------------------------- approach */}
      <section className="container-page section-y border-line border-t">
        <div className="grid gap-10 lg:grid-cols-[auto_1fr] lg:gap-16">
          <Reveal>
            <h2 className="text-subtle font-mono text-xs tracking-[0.2em] uppercase lg:w-40">
              The approach
            </h2>
          </Reveal>
          <div className="flex max-w-3xl flex-col gap-9">
            {project.approach.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.05}>
                <div className="flex gap-5">
                  <span className="border-line bg-surface-2 text-subtle grid h-9 w-9 shrink-0 place-items-center rounded-full border font-mono text-xs">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-ink text-lg leading-snug sm:text-xl">{step.title}</h3>
                    <p className="text-muted mt-2.5 leading-relaxed">{step.detail}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- architecture */}
      <section className="container-page section-y border-line border-t">
        <div className="grid gap-10 lg:grid-cols-[auto_1fr] lg:gap-16">
          <Reveal>
            <h2 className="text-subtle font-mono text-xs tracking-[0.2em] uppercase lg:w-40">
              Architecture
            </h2>
          </Reveal>
          <div className="max-w-3xl">
            <Reveal>
              <ul className="flex flex-col gap-px overflow-hidden rounded-xl">
                {project.architecture.map((row) => (
                  <li
                    key={row.layer}
                    className="bg-surface-2/60 border-line grid gap-2 border px-5 py-4 sm:grid-cols-[8rem_1fr] sm:gap-5"
                  >
                    <span className="text-ink font-mono text-sm font-medium">{row.layer}</span>
                    <span className="text-muted text-sm leading-relaxed">{row.detail}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.06}>
              <div className="mt-8">
                <p className="text-subtle mb-3 font-mono text-[0.625rem] tracking-[0.16em] uppercase">
                  Stack
                </p>
                <ul className="flex flex-wrap gap-2">
                  {project.tech.map((t) => (
                    <li
                      key={t}
                      className="border-line bg-surface-2 text-muted rounded-lg border px-3 py-1.5 font-mono text-xs"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ highlights */}
      <section className="container-page section-y border-line border-t">
        <div className="grid gap-10 lg:grid-cols-[auto_1fr] lg:gap-16">
          <Reveal>
            <h2 className="text-subtle font-mono text-xs tracking-[0.2em] uppercase lg:w-40">
              Highlights
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <ul className="grid max-w-3xl gap-4 sm:grid-cols-2">
              {project.highlights.map((h) => (
                <li key={h} className="text-muted flex gap-3 text-sm leading-relaxed">
                  <CircleCheck size={16} className="text-cyan mt-0.5 shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------------------------------- screenshots */}
      {project.screenshots.length > 1 && (
        <section className="container-page section-y border-line border-t">
          <Reveal>
            <h2 className="text-subtle mb-8 font-mono text-xs tracking-[0.2em] uppercase">
              Interface
            </h2>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {project.screenshots.map((shot, i) => (
              <Reveal key={shot.caption} delay={i * 0.05}>
                <figure>
                  <ProjectVisual
                    slug={`${project.slug}-${i}`}
                    category={project.category}
                    src={shot.src}
                    alt={shot.caption}
                    variant={i === 2 ? 'editor' : 'default'}
                    className="rounded-card"
                  />
                  <figcaption className="text-subtle mt-3 text-xs">{shot.caption}</figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* --------------------------------------------------------- outcome */}
      <section className="container-page section-y border-line border-t">
        <div className="grid gap-10 lg:grid-cols-[auto_1fr] lg:gap-16">
          <Reveal>
            <h2 className="text-subtle font-mono text-xs tracking-[0.2em] uppercase lg:w-40">
              The outcome
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="max-w-3xl">
              <p className="text-xl leading-relaxed sm:text-2xl">{project.outcome}</p>

              <div className="mt-10 flex flex-wrap gap-3">
                {demo && (
                  <LinkButton
                    to={`/demos/${demo.slug}`}
                    icon={<Play size={15} className="fill-current" />}
                  >
                    Try the {demo.name} demo
                  </LinkButton>
                )}
                <LinkButton
                  to="/contact"
                  variant={demo ? 'secondary' : 'primary'}
                  icon={<ArrowUpRight size={17} />}
                >
                  Discuss a similar project
                </LinkButton>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* --------------------------------------------------------- related */}
      <section className="container-page section-y border-line border-t">
        <Reveal>
          <div className="mb-10 flex items-end justify-between gap-6">
            <h2 className="text-2xl sm:text-3xl">More work</h2>
            <Link
              to="/work"
              className="text-muted hover:text-ink group inline-flex shrink-0 items-center gap-2 text-sm transition-colors"
            >
              All case studies
              <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {suggestions.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.05}>
              <ProjectCard project={p} className="h-full" />
            </Reveal>
          ))}
        </div>
      </section>
    </>
  )
}
