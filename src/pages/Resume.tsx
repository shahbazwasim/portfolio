import { Download, Mail, MapPin, Phone, Printer } from 'lucide-react'
import { Seo } from '@/lib/seo'
import { SITE, SOCIALS } from '@/data/site'
import { COURSES, EDUCATION, EXPERIENCE, LANGUAGES } from '@/data/experience'
import { SKILL_GROUPS } from '@/data/skills'
import { PROJECTS } from '@/data/projects'
import { Reveal } from '@/components/ui/Reveal'
import { LinkButton, Button } from '@/components/ui/Button'

/** Skills condensed to the strongest few per group — a CV isn't a full matrix. */
const CV_SKILLS = SKILL_GROUPS.map((g) => ({
  title: g.title,
  items: g.skills
    .filter((s) => s.level !== 'proficient')
    .slice(0, 8)
    .map((s) => s.name),
})).filter((g) => g.items.length > 0)

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-line border-t pt-8">
      <h2 className="text-subtle mb-6 font-mono text-xs tracking-[0.2em] uppercase">{title}</h2>
      {children}
    </section>
  )
}

export default function Resume() {
  const featured = PROJECTS.filter((p) => p.featured).slice(0, 4)

  return (
    <>
      <Seo
        title="Résumé"
        description={`Résumé of ${SITE.name} — ${SITE.role}. ${SITE.yearsExperience}+ years across AI, full stack development, CRM platforms and data engineering. MSc Artificial Intelligence.`}
        path="/resume"
      />

      <section className="container-page pt-32 pb-20 lg:pt-40">
        {/* -------------------------------------------------------- header */}
        <Reveal>
          <div
            data-no-print
            className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end"
          >
            <div>
              <span className="text-subtle font-mono text-xs tracking-[0.2em] uppercase">
                Résumé
              </span>
              <h1 className="mt-4 text-[clamp(2rem,5vw,3.5rem)] leading-[1.05]">
                {SITE.name}
              </h1>
              <p className="text-gradient mt-2 text-lg font-medium">{SITE.role}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <LinkButton
                to={SITE.resumePath}
                external
                icon={<Download size={16} />}
              >
                Download PDF
              </LinkButton>
              <Button
                variant="secondary"
                onClick={() => window.print()}
                icon={<Printer size={16} />}
              >
                Print
              </Button>
            </div>
          </div>
        </Reveal>

        <div className="mx-auto max-w-4xl">
          {/* Contact strip */}
          <Reveal>
            <ul className="text-muted mb-10 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <li className="inline-flex items-center gap-2">
                <MapPin size={14} className="text-subtle" />
                {SITE.location}
              </li>
              <li className="inline-flex items-center gap-2">
                <Phone size={14} className="text-subtle" />
                {SITE.phone}
              </li>
              <li className="inline-flex items-center gap-2">
                <Mail size={14} className="text-subtle" />
                <a href={`mailto:${SITE.email}`} className="hover:text-ink transition-colors">
                  {SITE.email}
                </a>
              </li>
              {SOCIALS.filter((s) => ['linkedin', 'github', 'behance'].includes(s.icon))
                .slice(0, 3)
                .map((s) => (
                  <li key={s.label + s.handle}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-ink transition-colors"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
            </ul>
          </Reveal>

          <div className="flex flex-col gap-10">
            {/* ------------------------------------------------------ summary */}
            <Reveal>
              <section>
                <h2 className="text-subtle mb-4 font-mono text-xs tracking-[0.2em] uppercase">
                  Profile
                </h2>
                <p className="text-muted leading-relaxed">
                  Full stack engineer with {SITE.yearsExperience}+ years designing and delivering
                  scalable web applications, AI-driven products and custom CRM platforms. Specialised
                  in LLM and retrieval systems, React and Node architecture, e-commerce
                  (Shopify, Magento, WordPress) and Power BI data engineering. MSc in Artificial
                  Intelligence and BSc in Computer Science. Comfortable owning a project from
                  discovery through production and handover. Open to relocating worldwide.
                </p>
              </section>
            </Reveal>

            {/* --------------------------------------------------- experience */}
            <Reveal>
              <Section title="Experience">
                <div className="flex flex-col gap-8">
                  {EXPERIENCE.map((role) => (
                    <article key={role.company + role.start}>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <h3 className="text-ink text-lg font-medium">
                          {role.title}
                          <span className="text-muted font-normal"> · {role.company}</span>
                        </h3>
                        <span className="text-subtle shrink-0 font-mono text-xs">
                          {role.period}
                        </span>
                      </div>
                      <p className="text-subtle mt-0.5 text-sm">{role.location}</p>
                      <ul className="mt-3 flex flex-col gap-1.5">
                        {role.highlights.map((h) => (
                          <li key={h} className="text-muted flex gap-2.5 text-sm leading-relaxed">
                            <span className="text-subtle mt-[0.15em] shrink-0">•</span>
                            {h}
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </Section>
            </Reveal>

            {/* ----------------------------------------------------- projects */}
            <Reveal>
              <Section title="Selected projects">
                <div className="flex flex-col gap-5">
                  {featured.map((p) => (
                    <article key={p.slug}>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                        <h3 className="text-ink font-medium">
                          {p.client}
                          <span className="text-muted font-normal"> — {p.title}</span>
                        </h3>
                        <span className="text-subtle shrink-0 font-mono text-xs">{p.year}</span>
                      </div>
                      <p className="text-muted mt-1.5 text-sm leading-relaxed">{p.summary}</p>
                      <p className="text-subtle mt-1.5 text-xs">
                        {p.metrics.map((m) => `${m.value} ${m.label.toLowerCase()}`).join(' · ')}
                      </p>
                      <p className="text-subtle mt-1.5 font-mono text-xs">{p.tech.join(' · ')}</p>
                    </article>
                  ))}
                </div>
              </Section>
            </Reveal>

            {/* ------------------------------------------------------- skills */}
            <Reveal>
              <Section title="Technical skills">
                <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                  {CV_SKILLS.map((g) => (
                    <div key={g.title}>
                      <dt className="text-ink text-sm font-medium">{g.title}</dt>
                      <dd className="text-muted mt-1 text-sm leading-relaxed">
                        {g.items.join(', ')}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Section>
            </Reveal>

            {/* ---------------------------------------------------- education */}
            <Reveal>
              <Section title="Education">
                <div className="flex flex-col gap-4">
                  {EDUCATION.map((e) => (
                    <div key={e.degree}>
                      <p className="text-ink font-medium">{e.degree}</p>
                      <p className="text-muted text-sm">
                        {e.institution} · {e.location}
                      </p>
                    </div>
                  ))}
                  <div>
                    <p className="text-ink font-medium">Additional coursework</p>
                    <p className="text-muted text-sm">
                      {COURSES.map((c) => `${c.name} (${c.institution})`).join(' · ')}
                    </p>
                  </div>
                </div>
              </Section>
            </Reveal>

            {/* ---------------------------------------------------- languages */}
            <Reveal>
              <Section title="Additional">
                <dl className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-x-3">
                    <dt className="text-ink text-sm font-medium">Languages:</dt>
                    <dd className="text-muted text-sm">
                      {LANGUAGES.map((l) => `${l.name} (${l.level})`).join(' · ')}
                    </dd>
                  </div>
                  <div className="flex flex-wrap gap-x-3">
                    <dt className="text-ink text-sm font-medium">Relocation:</dt>
                    <dd className="text-muted text-sm">
                      Open to relocating worldwide for the right opportunity.
                    </dd>
                  </div>
                  <div className="flex flex-wrap gap-x-3">
                    <dt className="text-ink text-sm font-medium">Availability:</dt>
                    <dd className="text-muted text-sm">
                      {SITE.availability.label} — full-time, contract or consulting.
                    </dd>
                  </div>
                </dl>
              </Section>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}
