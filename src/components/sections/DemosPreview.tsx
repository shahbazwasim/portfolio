import { Link } from 'react-router-dom'
import { ArrowUpRight, Play } from 'lucide-react'
import { ACCENT_CLASS, DEMOS } from '@/data/demos'
import { GlassCard, SectionHeading } from '@/components/ui/Surfaces'
import { Icon } from '@/components/ui/Icon'
import { Reveal } from '@/components/ui/Reveal'

export function DemosPreview() {
  return (
    <section className="container-page section-y">
      <Reveal>
        <div className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="Live demos"
            title={
              <>
                Don't take my word for it — <span className="text-gradient">click something</span>
              </>
            }
            description="Six working applications built into this site. Real state, real interactions, real PDF generation. No screenshots, no video walkthroughs."
          />
          <Link
            to="/demos"
            className="text-muted hover:text-ink group inline-flex shrink-0 items-center gap-2 text-sm font-medium transition-colors"
          >
            All demos
            <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </Reveal>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {DEMOS.map((d, i) => {
          const accent = ACCENT_CLASS[d.accent]
          return (
            <Reveal key={d.slug} delay={i * 0.05}>
              <Link to={`/demos/${d.slug}`} className="block h-full">
                <GlassCard interactive spotlight className="group flex h-full flex-col p-6">
                  <div className="mb-5 flex items-start justify-between">
                    <span
                      className={`grid h-11 w-11 place-items-center rounded-xl border ${accent.bg} ${accent.border} ${accent.text}`}
                    >
                      <Icon name={d.icon} size={20} />
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.6875rem] font-medium ${accent.bg} ${accent.border} ${accent.text}`}
                    >
                      <Play size={9} className="fill-current" />
                      Live
                    </span>
                  </div>

                  <h3 className="text-ink text-lg">{d.name}</h3>
                  <p className={`mt-1 text-sm font-medium ${accent.text}`}>{d.tagline}</p>
                  <p className="text-muted mt-3.5 flex-1 text-sm leading-relaxed">{d.description}</p>

                  <ul className="border-line mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 border-t pt-4">
                    {d.proves.map((p, j) => (
                      <li key={p} className="text-subtle flex items-center gap-2 text-[0.6875rem]">
                        {j > 0 && <span aria-hidden="true" className="bg-line h-2.5 w-px" />}
                        {p}
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </Link>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
