import { Clock, Mail, MapPin, MessageSquare, Phone } from 'lucide-react'
import { Seo, breadcrumbJsonLd } from '@/lib/seo'
import { SITE, SOCIALS } from '@/data/site'
import { ContactForm } from '@/components/ContactForm'
import { GlassCard, StatusDot } from '@/components/ui/Surfaces'
import { Reveal } from '@/components/ui/Reveal'
import { SocialIcon } from '@/components/ui/SocialIcon'

const NEXT_STEPS = [
  {
    title: 'I read it properly',
    detail: 'Not a template reply. If your message has enough detail, my first response will too.',
  },
  {
    title: 'A short call if it fits',
    detail: '20–30 minutes to understand the problem and tell you honestly whether I am the right person.',
  },
  {
    title: 'A written proposal',
    detail: 'Scope, approach, timeline and cost — specific enough that you could hand it to another engineer.',
  },
]

export default function Contact() {
  const whatsapp = SOCIALS.find((s) => s.icon === 'whatsapp')!

  return (
    <>
      <Seo
        title="Contact"
        description={`Get in touch with ${SITE.name} — ${SITE.role}. Available for projects, contract work and full-time roles. ${SITE.availability.responseTime}.`}
        path="/contact"
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Contact', path: '/contact' },
        ])}
      />

      <section className="container-page pt-32 pb-20 lg:pt-40">
        <Reveal>
          <div className="max-w-3xl">
            <div className="glass border-line text-muted mb-7 inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-sm">
              <StatusDot />
              {SITE.availability.label}
            </div>
            <h1 className="text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.02]">
              Let's build
              <br />
              something <span className="text-gradient">worth building.</span>
            </h1>
            <p className="text-muted mt-7 max-w-2xl text-lg leading-relaxed">
              Whether you have a fully specified project or just a problem you cannot get past —
              tell me about it. I reply to everything.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
          {/* Form */}
          <Reveal delay={0.06}>
            <GlassCard className="p-6 sm:p-8 lg:p-10">
              <ContactForm />
            </GlassCard>
          </Reveal>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <Reveal delay={0.1} direction="right">
              <GlassCard className="p-6">
                <h2 className="text-subtle mb-5 font-mono text-xs tracking-[0.18em] uppercase">
                  Reach me directly
                </h2>
                <ul className="flex flex-col gap-1">
                  <li>
                    <a
                      href={`mailto:${SITE.email}`}
                      className="text-muted hover:text-ink hover:bg-surface-2 -mx-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
                    >
                      <Mail size={16} className="text-subtle shrink-0" />
                      <span className="truncate">{SITE.email}</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href={whatsapp.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted hover:text-ink hover:bg-surface-2 -mx-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
                    >
                      <SocialIcon name="whatsapp" size={16} className="text-subtle shrink-0" />
                      <span className="truncate">WhatsApp — {SITE.phone}</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href={`tel:${SITE.phoneRaw}`}
                      className="text-muted hover:text-ink hover:bg-surface-2 -mx-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
                    >
                      <Phone size={16} className="text-subtle shrink-0" />
                      <span className="truncate">{SITE.phone}</span>
                    </a>
                  </li>
                </ul>

                <div className="border-line mt-5 border-t pt-5">
                  <ul className="text-subtle flex flex-col gap-2.5 text-xs">
                    <li className="flex items-center gap-2.5">
                      <MapPin size={13} className="shrink-0" />
                      {SITE.location}
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Clock size={13} className="shrink-0" />
                      {SITE.timezone} · {SITE.availability.responseTime}
                    </li>
                  </ul>
                </div>

                <div className="border-line mt-5 flex gap-1 border-t pt-5">
                  {SOCIALS.filter((s) => s.icon !== 'whatsapp').map((s) => (
                    <a
                      key={s.label + s.handle}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      title={`${s.label} — ${s.handle}`}
                      className="text-subtle hover:text-ink hover:bg-surface-2 grid h-9 w-9 place-items-center rounded-lg transition-colors"
                    >
                      <SocialIcon name={s.icon} size={16} />
                    </a>
                  ))}
                </div>
              </GlassCard>
            </Reveal>

            <Reveal delay={0.14} direction="right">
              <GlassCard className="p-6">
                <h2 className="text-subtle mb-5 inline-flex items-center gap-2 font-mono text-xs tracking-[0.18em] uppercase">
                  <MessageSquare size={13} />
                  What happens next
                </h2>
                <ol className="flex flex-col gap-5">
                  {NEXT_STEPS.map((s, i) => (
                    <li key={s.title} className="flex gap-3.5">
                      <span className="border-line bg-surface-2 text-subtle grid h-6 w-6 shrink-0 place-items-center rounded-full border font-mono text-[0.625rem]">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-ink text-sm font-medium">{s.title}</p>
                        <p className="text-muted mt-1 text-xs leading-relaxed">{s.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </GlassCard>
            </Reveal>

            <Reveal delay={0.18} direction="right">
              <GlassCard className="p-6">
                <p className="text-muted text-sm leading-relaxed">
                  <span className="text-ink font-medium">Not ready to talk yet?</span> Have a look
                  at the{' '}
                  <a href="/demos" className="text-cyan underline underline-offset-4">
                    live demos
                  </a>{' '}
                  or read a{' '}
                  <a href="/work" className="text-cyan underline underline-offset-4">
                    case study
                  </a>{' '}
                  first — they will tell you more than a call would.
                </p>
              </GlassCard>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}
