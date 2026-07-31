import { Suspense, lazy, useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ClientOnly } from 'vite-react-ssg'
import { ArrowLeft, ArrowUpRight, LoaderCircle, ShieldCheck } from 'lucide-react'
import { Seo, breadcrumbJsonLd } from '@/lib/seo'
import { ACCENT_CLASS, DEMOS, getDemo } from '@/data/demos'
import { getProject } from '@/data/projects'
import { Icon } from '@/components/ui/Icon'
import { Reveal } from '@/components/ui/Reveal'
import { GlassCard } from '@/components/ui/Surfaces'

/**
 * Each demo is its own lazy chunk, so visiting /demos/invoicely never downloads
 * the CRM's drag-and-drop code or the dashboard's charting library.
 *
 * They also render inside <ClientOnly> — these apps read localStorage and size
 * charts against the viewport, neither of which exists during prerendering. The
 * page shell around them is still fully static for SEO.
 */
const DEMO_COMPONENTS: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'nexus-crm': lazy(() => import('@/demos/nexus-crm')),
  'aria-ai': lazy(() => import('@/demos/aria-ai')),
  'pulse-bi': lazy(() => import('@/demos/pulse-bi')),
  'lumina-commerce': lazy(() => import('@/demos/lumina-commerce')),
  'quill-cms': lazy(() => import('@/demos/quill-cms')),
  invoicely: lazy(() => import('@/demos/invoicely')),
}

function Loading({ name }: { name: string }) {
  return (
    <div className="border-line bg-surface-2/30 grid min-h-[460px] place-items-center rounded-2xl border">
      <div className="flex flex-col items-center gap-3">
        <LoaderCircle size={22} className="text-cyan animate-spin" />
        <p className="text-subtle text-sm">Loading {name}…</p>
      </div>
    </div>
  )
}

export default function DemoDetail() {
  const { slug } = useParams<{ slug: string }>()
  const demo = slug ? getDemo(slug) : undefined

  const Component = useMemo(() => (slug ? DEMO_COMPONENTS[slug] : undefined), [slug])

  if (!demo || !Component) return <Navigate to="/404" replace />

  const accent = ACCENT_CLASS[demo.accent]
  const project = demo.projectSlug ? getProject(demo.projectSlug) : undefined
  const others = DEMOS.filter((d) => d.slug !== demo.slug)

  return (
    <>
      <Seo
        title={`${demo.name} — Live Demo`}
        description={`${demo.tagline}. ${demo.description}`}
        path={`/demos/${demo.slug}`}
        keywords={[...demo.tech, ...demo.proves, 'live demo']}
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Demos', path: '/demos' },
          { name: demo.name, path: `/demos/${demo.slug}` },
        ])}
      />

      <section className="container-page pt-32 pb-8 lg:pt-40">
        <Reveal>
          <Link
            to="/demos"
            className="text-subtle hover:text-ink group mb-8 inline-flex items-center gap-2 text-sm transition-colors"
          >
            <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
            All demos
          </Link>
        </Reveal>

        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <Reveal>
            <div className="flex items-start gap-4">
              <span
                className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl border ${accent.bg} ${accent.border} ${accent.text}`}
              >
                <Icon name={demo.icon} size={26} />
              </span>
              <div>
                <h1 className="text-[clamp(1.75rem,4vw,3rem)] leading-tight">{demo.name}</h1>
                <p className={`mt-1 text-base font-medium ${accent.text}`}>{demo.tagline}</p>
              </div>
            </div>
            <p className="text-muted mt-6 max-w-2xl leading-relaxed">{demo.description}</p>
          </Reveal>

          {project && (
            <Reveal delay={0.06}>
              <Link
                to={`/work/${project.slug}`}
                className="border-line text-muted hover:text-ink hover:border-line-strong group inline-flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-sm transition-colors"
              >
                Read the {project.client} case study
                <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Reveal>
          )}
        </div>
      </section>

      {/* The app itself */}
      <section className="container-page pb-10">
        <Reveal delay={0.04}>
          <ClientOnly fallback={<Loading name={demo.name} />}>
            {() => (
              <Suspense fallback={<Loading name={demo.name} />}>
                <Component />
              </Suspense>
            )}
          </ClientOnly>
        </Reveal>

        <Reveal delay={0.06}>
          <p className="text-subtle mt-4 inline-flex items-center gap-2 text-xs">
            <ShieldCheck size={13} />
            Runs entirely in your browser. Data persists to local storage and never leaves your
            device — hit Reset in the title bar to restore the seed data.
          </p>
        </Reveal>
      </section>

      {/* Context */}
      <section className="container-page section-y border-line border-t">
        <div className="grid gap-8 lg:grid-cols-3">
          <Reveal>
            <GlassCard className="h-full p-6">
              <h2 className="text-subtle mb-4 font-mono text-xs tracking-[0.18em] uppercase">
                Things to try
              </h2>
              <ul className="flex flex-col gap-2.5">
                {demo.tryThis.map((t) => (
                  <li key={t} className="text-muted flex gap-2.5 text-sm leading-relaxed">
                    <span className="from-cyan to-violet mt-[0.55em] h-px w-2.5 shrink-0 bg-gradient-to-r" />
                    {t}
                  </li>
                ))}
              </ul>
            </GlassCard>
          </Reveal>

          <Reveal delay={0.05}>
            <GlassCard className="h-full p-6">
              <h2 className="text-subtle mb-4 font-mono text-xs tracking-[0.18em] uppercase">
                Built with
              </h2>
              <ul className="flex flex-wrap gap-2">
                {demo.tech.map((t) => (
                  <li
                    key={t}
                    className="border-line bg-surface-2 text-muted rounded-lg border px-2.5 py-1.5 font-mono text-xs"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </GlassCard>
          </Reveal>

          <Reveal delay={0.1}>
            <GlassCard className="h-full p-6">
              <h2 className="text-subtle mb-4 font-mono text-xs tracking-[0.18em] uppercase">
                What it demonstrates
              </h2>
              <ul className="flex flex-col gap-2.5">
                {demo.proves.map((p) => (
                  <li key={p} className="text-muted text-sm">
                    {p}
                  </li>
                ))}
              </ul>
            </GlassCard>
          </Reveal>
        </div>
      </section>

      {/* Other demos */}
      <section className="container-page section-y border-line border-t">
        <Reveal>
          <h2 className="mb-8 text-2xl sm:text-3xl">Other demos</h2>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {others.map((d, i) => {
            const a = ACCENT_CLASS[d.accent]
            return (
              <Reveal key={d.slug} delay={i * 0.04}>
                <Link to={`/demos/${d.slug}`} className="block h-full">
                  <GlassCard interactive className="flex h-full flex-col p-5">
                    <span
                      className={`mb-4 grid h-10 w-10 place-items-center rounded-xl border ${a.bg} ${a.border} ${a.text}`}
                    >
                      <Icon name={d.icon} size={18} />
                    </span>
                    <p className="text-ink text-sm font-medium">{d.name}</p>
                    <p className="text-subtle mt-1 text-xs leading-snug">{d.tagline}</p>
                  </GlassCard>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </section>
    </>
  )
}
