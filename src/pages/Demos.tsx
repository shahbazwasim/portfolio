import { Link } from 'react-router-dom'
import { ArrowUpRight, Play, ShieldCheck } from 'lucide-react'
import { Seo, breadcrumbJsonLd } from '@/lib/seo'
import { ACCENT_CLASS, DEMOS } from '@/data/demos'
import { getProject } from '@/data/projects'
import { GlassCard } from '@/components/ui/Surfaces'
import { Icon } from '@/components/ui/Icon'
import { Reveal } from '@/components/ui/Reveal'

export default function Demos() {
  return (
    <>
      <Seo
        title="Live Demos"
        description="Six working applications built into this site — a CRM with a drag-and-drop pipeline, a retrieval-augmented AI assistant, an analytics dashboard, a storefront, a CMS and an invoice builder with real PDF export."
        path="/demos"
        keywords={['live demo', 'interactive portfolio', 'React demo', 'CRM demo', 'RAG demo']}
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Demos', path: '/demos' },
        ])}
      />

      <section className="container-page pt-32 pb-12 lg:pt-40">
        <Reveal>
          <span className="text-subtle font-mono text-xs tracking-[0.2em] uppercase">
            Live demos
          </span>
          <h1 className="mt-5 max-w-4xl text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.02]">
            Six real applications.
            <br />
            <span className="text-gradient">Not screenshots.</span>
          </h1>
          <p className="text-muted mt-7 max-w-2xl text-lg leading-relaxed">
            Every demo below is a working app running in your browser — drag deals between stages,
            cross-filter a dashboard, fill a cart, write a post, generate a real PDF. State persists
            across refreshes.
          </p>
        </Reveal>

        <Reveal delay={0.06}>
          <p className="text-subtle mt-7 inline-flex items-center gap-2 text-sm">
            <ShieldCheck size={15} />
            Everything runs client-side. No accounts, no server, nothing leaves your device.
          </p>
        </Reveal>
      </section>

      <section className="container-page pb-24">
        <div className="grid gap-5 lg:grid-cols-2">
          {DEMOS.map((d, i) => {
            const accent = ACCENT_CLASS[d.accent]
            const project = d.projectSlug ? getProject(d.projectSlug) : undefined

            return (
              <Reveal key={d.slug} delay={Math.min(i * 0.05, 0.2)}>
                <GlassCard interactive spotlight className="flex h-full flex-col p-6 lg:p-8">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <span
                      className={`grid h-12 w-12 place-items-center rounded-xl border ${accent.bg} ${accent.border} ${accent.text}`}
                    >
                      <Icon name={d.icon} size={22} />
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.6875rem] font-medium ${accent.bg} ${accent.border} ${accent.text}`}
                    >
                      <Play size={9} className="fill-current" />
                      Live
                    </span>
                  </div>

                  <h2 className="text-ink text-xl">{d.name}</h2>
                  <p className={`mt-1 text-sm font-medium ${accent.text}`}>{d.tagline}</p>
                  <p className="text-muted mt-4 text-sm leading-relaxed">{d.description}</p>

                  <div className="border-line mt-6 border-t pt-5">
                    <p className="text-subtle mb-3 font-mono text-[0.625rem] tracking-[0.16em] uppercase">
                      Things to try
                    </p>
                    <ul className="flex flex-col gap-2">
                      {d.tryThis.map((t) => (
                        <li key={t} className="text-muted flex gap-2.5 text-sm leading-relaxed">
                          <span className="from-cyan to-violet mt-[0.55em] h-px w-2.5 shrink-0 bg-gradient-to-r" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-2">
                    {d.tech.map((t) => (
                      <span
                        key={t}
                        className="border-line bg-surface-2 text-subtle rounded-md border px-2 py-0.5 font-mono text-[0.6875rem]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <Link
                      to={`/demos/${d.slug}`}
                      className="inline-flex h-11 items-center gap-2 rounded-full bg-[linear-gradient(120deg,var(--accent-cyan),var(--accent-violet))] px-6 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    >
                      Launch {d.name}
                      <ArrowUpRight size={16} />
                    </Link>
                    {project && (
                      <Link
                        to={`/work/${project.slug}`}
                        className="text-muted hover:text-ink text-sm underline underline-offset-4 transition-colors"
                      >
                        Read the case study
                      </Link>
                    )}
                  </div>
                </GlassCard>
              </Reveal>
            )
          })}
        </div>
      </section>
    </>
  )
}
