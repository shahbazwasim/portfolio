import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { SERVICES } from '@/data/services'
import { GlassCard, SectionHeading } from '@/components/ui/Surfaces'
import { Icon } from '@/components/ui/Icon'
import { Reveal } from '@/components/ui/Reveal'
import { ACCENT_CLASS } from '@/data/demos'

export function ServicesPreview() {
  return (
    <section className="container-page section-y">
      <Reveal>
        <div className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="How I can help"
            title={
              <>
                Six ways teams <span className="text-gradient">bring me in</span>
              </>
            }
            description="Whether it's an AI feature that needs to survive production, a CRM that finally fits your process, or a storefront leaking revenue to load time."
          />
          <Link
            to="/services"
            className="text-muted hover:text-ink group inline-flex shrink-0 items-center gap-2 text-sm font-medium transition-colors"
          >
            Services &amp; engagement models
            <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </Reveal>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s, i) => {
          const accent = ACCENT_CLASS[s.accent]
          return (
            <Reveal key={s.slug} delay={i * 0.05}>
              <Link to={`/services#${s.slug}`} className="block h-full">
                <GlassCard interactive spotlight className="flex h-full flex-col p-6 lg:p-7">
                  <span
                    className={`mb-5 grid h-11 w-11 place-items-center rounded-xl border ${accent.bg} ${accent.border} ${accent.text}`}
                  >
                    <Icon name={s.icon} size={20} />
                  </span>
                  <h3 className="text-ink text-lg leading-snug">{s.title}</h3>
                  <p className={`mt-1.5 text-sm font-medium ${accent.text}`}>{s.tagline}</p>
                  <p className="text-muted mt-3.5 flex-1 text-sm leading-relaxed">
                    {s.description}
                  </p>
                  <p className="border-line text-subtle mt-5 border-t pt-4 text-xs leading-relaxed">
                    <span className="text-muted font-medium">Best for:</span> {s.bestFor}
                  </p>
                </GlassCard>
              </Link>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
