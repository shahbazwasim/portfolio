import { ArrowUpRight, CircleCheck } from 'lucide-react'
import { Seo, breadcrumbJsonLd } from '@/lib/seo'
import { SITE } from '@/data/site'
import { ENGAGEMENT_MODELS, PROCESS_STEPS, SERVICES } from '@/data/services'
import { ACCENT_CLASS } from '@/data/demos'
import { GlassCard, SectionHeading, StatusDot } from '@/components/ui/Surfaces'
import { Icon } from '@/components/ui/Icon'
import { Reveal } from '@/components/ui/Reveal'
import { LinkButton } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

export default function Services() {
  return (
    <>
      <Seo
        title="Services"
        description={`AI integration, custom CRM development, e-commerce, full stack applications, data engineering and legacy modernisation. Discovery sprints, project delivery and embedded engineering with ${SITE.name}.`}
        path="/services"
        keywords={[
          'AI integration services',
          'custom CRM development',
          'Shopify development',
          'full stack development services',
          'Power BI consulting',
          'hire developer',
        ]}
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
        ])}
      />

      {/* ------------------------------------------------------------ hero */}
      <section className="container-page pt-32 pb-12 lg:pt-40">
        <Reveal>
          <span className="text-subtle font-mono text-xs tracking-[0.2em] uppercase">Services</span>
          <h1 className="mt-5 max-w-4xl text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.02]">
            Six ways teams
            <br />
            <span className="text-gradient">bring me in.</span>
          </h1>
          <p className="text-muted mt-7 max-w-2xl text-lg leading-relaxed">
            Sometimes it's a feature that needs building. More often it's something that already
            exists and isn't working — a storefront losing revenue to load time, a CRM the team
            works around, an AI prototype that can't survive real users.
          </p>
          <div className="text-muted mt-7 inline-flex items-center gap-2.5 text-sm">
            <StatusDot />
            {SITE.availability.detail}
          </div>
        </Reveal>
      </section>

      {/* -------------------------------------------------------- services */}
      <section className="container-page pb-8">
        <div className="flex flex-col gap-5">
          {SERVICES.map((s, i) => {
            const accent = ACCENT_CLASS[s.accent]
            return (
              <Reveal key={s.slug} delay={Math.min(i * 0.04, 0.16)}>
                <GlassCard
                  id={s.slug}
                  interactive
                  spotlight
                  className="grid scroll-mt-28 gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12 lg:p-10"
                >
                  <div>
                    <span
                      className={cn(
                        'mb-6 grid h-12 w-12 place-items-center rounded-xl border',
                        accent.bg,
                        accent.border,
                        accent.text
                      )}
                    >
                      <Icon name={s.icon} size={22} />
                    </span>
                    <h2 className="text-2xl leading-snug sm:text-3xl">{s.title}</h2>
                    <p className={cn('mt-2 text-base font-medium', accent.text)}>{s.tagline}</p>
                    <p className="text-muted mt-5 leading-relaxed">{s.description}</p>
                    <p className="border-line text-subtle mt-6 border-t pt-5 text-sm leading-relaxed">
                      <span className="text-muted font-medium">Best for:</span> {s.bestFor}
                    </p>
                  </div>

                  <div className="lg:border-line lg:border-l lg:pl-12">
                    <p className="text-subtle mb-5 font-mono text-[0.625rem] tracking-[0.18em] uppercase">
                      What you get
                    </p>
                    <ul className="flex flex-col gap-3.5">
                      {s.deliverables.map((d) => (
                        <li key={d} className="text-muted flex gap-3 text-sm leading-relaxed">
                          <CircleCheck size={15} className={cn('mt-0.5 shrink-0', accent.text)} />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </GlassCard>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* --------------------------------------------------------- process */}
      <section className="container-page section-y">
        <Reveal>
          <SectionHeading
            eyebrow="Process"
            title={
              <>
                How a project <span className="text-gradient">actually runs</span>
              </>
            }
            description="No black boxes and no three-month silences. You see working software every week and can change direction cheaply."
            className="mb-12 max-w-3xl"
          />
        </Reveal>

        <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {PROCESS_STEPS.map((step, i) => (
            <Reveal key={step.step} delay={i * 0.05}>
              <li className="border-line relative h-full rounded-xl border p-5">
                <span className="font-display text-gradient text-2xl font-bold">{step.step}</span>
                <h3 className="text-ink mt-3 text-base">{step.title}</h3>
                <p className="text-muted mt-2 text-sm leading-relaxed">{step.detail}</p>
                {i < PROCESS_STEPS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="via-line absolute top-1/2 -right-2 hidden h-px w-4 bg-gradient-to-r from-transparent to-transparent lg:block"
                  />
                )}
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------------ engagement */}
      <section className="container-page section-y border-line border-t">
        <Reveal>
          <SectionHeading
            eyebrow="Engagement models"
            title="Three ways to work together"
            description="Pick the shape that fits. If none of them quite do, say so — these are starting points, not a menu."
            className="mb-12 max-w-3xl"
          />
        </Reveal>

        <div className="grid gap-5 lg:grid-cols-3">
          {ENGAGEMENT_MODELS.map((m, i) => (
            <Reveal key={m.name} delay={i * 0.06}>
              <GlassCard
                interactive
                ring={m.featured}
                className={cn(
                  'flex h-full flex-col p-6 lg:p-8',
                  m.featured && 'border-violet/30'
                )}
              >
                {m.featured && (
                  <span className="border-violet/30 bg-violet/10 text-violet mb-4 -mt-1 inline-flex w-fit rounded-full border px-2.5 py-0.5 text-[0.625rem] font-medium tracking-wide uppercase">
                    Most common
                  </span>
                )}
                <h3 className="text-ink text-xl">{m.name}</h3>
                <p className="text-subtle mt-1 font-mono text-xs">{m.duration}</p>
                <p className="text-muted mt-4 flex-1 text-sm leading-relaxed">{m.description}</p>

                <ul className="border-line mt-6 flex flex-col gap-2.5 border-t pt-5">
                  {m.suits.map((s) => (
                    <li key={s} className="text-muted flex gap-2.5 text-sm leading-relaxed">
                      <span className="from-cyan to-violet mt-[0.55em] h-px w-2.5 shrink-0 bg-gradient-to-r" />
                      {s}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.12}>
          <div className="border-line rounded-panel mt-8 flex flex-col items-start justify-between gap-6 border p-7 sm:flex-row sm:items-center lg:p-9">
            <div>
              <h3 className="text-xl sm:text-2xl">Not sure which one fits?</h3>
              <p className="text-muted mt-2 max-w-xl leading-relaxed">
                Describe the problem and I'll tell you honestly what it needs — including if that's
                nothing from me.
              </p>
            </div>
            <LinkButton to="/contact" size="lg" icon={<ArrowUpRight size={18} />}>
              Start a conversation
            </LinkButton>
          </div>
        </Reveal>
      </section>
    </>
  )
}
