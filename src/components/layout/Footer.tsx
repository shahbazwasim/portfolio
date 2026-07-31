import { Link } from 'react-router-dom'
import { ArrowUpRight, Mail, MapPin } from 'lucide-react'
import { FOOTER_LINKS, SITE, SOCIALS } from '@/data/site'
import { StatusDot } from '@/components/ui/Surfaces'
import { LinkButton } from '@/components/ui/Button'
import { SocialIcon } from '@/components/ui/SocialIcon'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer data-no-print className="border-line relative mt-24 border-t">
      {/* Closing CTA */}
      <div className="container-page border-line border-b py-16 lg:py-24">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="text-muted mb-5 inline-flex items-center gap-2 text-sm">
              <StatusDot />
              {SITE.availability.label}
            </div>
            <h2 className="text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
              Have something <span className="text-gradient">ambitious</span> in mind?
            </h2>
            <p className="text-muted mt-5 max-w-xl text-lg leading-relaxed">
              {SITE.availability.detail} {SITE.availability.responseTime}.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <LinkButton to="/contact" size="lg" icon={<ArrowUpRight size={18} />}>
              Start a project
            </LinkButton>
            <LinkButton to={`mailto:${SITE.email}`} variant="outline" size="lg" external>
              Email me
            </LinkButton>
          </div>
        </div>
      </div>

      {/* Link columns */}
      <div className="container-page py-14">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <Link to="/" className="mb-4 inline-flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[linear-gradient(135deg,var(--accent-cyan),var(--accent-violet))] text-sm font-bold text-white">
                SW
              </span>
              <span className="font-display text-ink font-semibold">{SITE.name}</span>
            </Link>
            <p className="text-muted max-w-xs text-sm leading-relaxed">{SITE.tagline}</p>
            <div className="text-subtle mt-5 flex flex-col gap-2 text-sm">
              <span className="inline-flex items-center gap-2">
                <MapPin size={14} /> {SITE.location} · {SITE.timezone}
              </span>
              <a
                href={`mailto:${SITE.email}`}
                className="hover:text-ink inline-flex items-center gap-2 transition-colors"
              >
                <Mail size={14} /> {SITE.email}
              </a>
            </div>
          </div>

          {FOOTER_LINKS.map((col) => (
            <div key={col.heading}>
              <h3 className="text-subtle mb-4 font-mono text-xs tracking-[0.18em] uppercase">
                {col.heading}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      to={l.href}
                      className="text-muted hover:text-ink text-sm transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-line border-t">
        <div className="container-page flex flex-col items-center justify-between gap-5 py-6 sm:flex-row">
          <p className="text-subtle text-center text-xs sm:text-left">
            © {year} {SITE.name}. Built with React, Vite &amp; Tailwind.
          </p>
          <ul className="flex items-center gap-1">
            {SOCIALS.map((s) => (
              <li key={s.label + s.handle}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${s.label} — ${s.handle}`}
                  title={s.label}
                  className="text-subtle hover:text-ink hover:bg-surface-2 grid h-9 w-9 place-items-center rounded-full transition-colors"
                >
                  <SocialIcon name={s.icon} size={17} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
