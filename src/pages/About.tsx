import { Link } from 'react-router-dom'
import { motion, useScroll, useSpring } from 'motion/react'
import { useRef } from 'react'
import { ArrowUpRight, Download, GraduationCap, Languages, MapPin, Plane } from 'lucide-react'
import { Seo, breadcrumbJsonLd } from '@/lib/seo'
import { SITE, SOCIALS } from '@/data/site'
import { COURSES, EDUCATION, EXPERIENCE, LANGUAGES, PRINCIPLES } from '@/data/experience'
import { GlassCard, SectionHeading, StatusDot } from '@/components/ui/Surfaces'
import { Reveal } from '@/components/ui/Reveal'
import { LinkButton } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { SocialIcon } from '@/components/ui/SocialIcon'

/** Career timeline whose rail fills as the section scrolls past. */
function Timeline() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 65%', 'end 60%'] })
  const scaleY = useSpring(scrollYProgress, { stiffness: 110, damping: 30, restDelta: 0.001 })

  return (
    <div ref={ref} className="relative">
      <div className="bg-line absolute top-2 bottom-2 left-[7px] w-px sm:left-[11px]" />
      <motion.div
        style={{ scaleY }}
        aria-hidden="true"
        className="absolute top-2 bottom-2 left-[7px] w-px origin-top bg-[linear-gradient(180deg,var(--accent-cyan),var(--accent-violet),var(--accent-magenta))] sm:left-[11px]"
      />

      <ol className="flex flex-col gap-12">
        {EXPERIENCE.map((role, i) => (
          <li key={role.company + role.start} className="relative pl-9 sm:pl-14">
            <span
              className={`absolute top-1.5 left-0 grid h-[15px] w-[15px] place-items-center rounded-full border-2 sm:h-[23px] sm:w-[23px] ${
                role.current ? 'border-cyan bg-bg' : 'border-line bg-surface-2'
              }`}
            >
              {role.current && <span className="bg-cyan h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2" />}
            </span>

            <Reveal delay={i * 0.04} direction="left">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-ink text-xl sm:text-2xl">{role.title}</h3>
                {role.current && (
                  <span className="border-cyan/30 bg-cyan/10 text-cyan inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium">
                    <StatusDot />
                    Current
                  </span>
                )}
              </div>

              <p className="text-muted mt-1.5 text-[0.9375rem]">
                <span className="text-ink font-medium">{role.company}</span>
                <span className="text-subtle"> · {role.location}</span>
              </p>
              <p className="text-subtle mt-1 font-mono text-xs">{role.period}</p>

              <p className="text-muted mt-4 max-w-2xl leading-relaxed">{role.summary}</p>

              <ul className="mt-5 flex flex-col gap-2.5">
                {role.highlights.map((h) => (
                  <li key={h} className="text-muted flex gap-3 text-sm leading-relaxed">
                    <span className="from-cyan to-violet mt-[0.55em] h-px w-3 shrink-0 bg-gradient-to-r" />
                    {h}
                  </li>
                ))}
              </ul>

              <ul className="mt-5 flex flex-wrap gap-1.5">
                {role.stack.map((s) => (
                  <li
                    key={s}
                    className="border-line bg-surface-2 text-subtle rounded-md border px-2 py-0.5 font-mono text-[0.6875rem]"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </Reveal>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default function About() {
  return (
    <>
      <Seo
        title="About"
        description={`${SITE.name} is a ${SITE.role} based in ${SITE.location} with ${SITE.yearsExperience}+ years of experience. MSc in Artificial Intelligence, BSc in Computer Science. Open to relocation worldwide.`}
        path="/about"
        type="profile"
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
        ])}
      />

      {/* ------------------------------------------------------------ intro */}
      <section className="container-page pt-32 pb-16 lg:pt-40">
        <div className="grid items-start gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <div>
            <Reveal>
              <span className="text-subtle font-mono text-xs tracking-[0.2em] uppercase">
                About me
              </span>
              <h1 className="mt-5 text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.02]">
                I've been building
                <br />
                for the web since
                <br />
                <span className="text-gradient">{SITE.startedYear}.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="text-muted mt-8 flex max-w-2xl flex-col gap-5 text-base leading-relaxed sm:text-lg">
                <p>
                  I started making WordPress sites for shops around Karachi while I was still
                  finishing my Computer Science degree. The work was unglamorous and it taught me
                  the thing no course did: software is only useful if the person paying for it can
                  actually run their business with it.
                </p>
                <p>
                  That is still how I approach every project. I spend the first week asking
                  questions, reading the existing code and watching people work — because the most
                  expensive code is the code that solves the wrong problem perfectly.
                </p>
                <p>
                  The surface area has grown a lot since: React and Node applications, custom CRM
                  platforms, Shopify and Magento storefronts, Power BI reporting, and for the last
                  few years AI systems — retrieval pipelines, document intelligence, and the
                  evaluation harnesses that keep them honest. I took an MSc in Artificial
                  Intelligence because I wanted to understand the models rather than just call them.
                </p>
                <p className="text-ink font-medium">
                  I am currently open to full-time roles, contract work, and relocating
                  internationally for the right opportunity.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.14}>
              <div className="mt-9 flex flex-wrap gap-3">
                <LinkButton to="/contact" icon={<ArrowUpRight size={17} />}>
                  Get in touch
                </LinkButton>
                <LinkButton
                  to={SITE.resumePath}
                  variant="secondary"
                  external
                  icon={<Download size={16} />}
                >
                  Download résumé
                </LinkButton>
              </div>
            </Reveal>
          </div>

          {/* photos + facts */}
          <Reveal delay={0.1} direction="right">
            <div className="flex flex-col gap-4">
              <Avatar
                src="/images/shahbaz-standing.jpg"
                alt={`${SITE.name} standing`}
                rounded="panel"
                className="aspect-[3/4] w-full [container-type:inline-size]"
              />
              <div className="grid grid-cols-2 gap-4">
                <Avatar
                  src="/images/profile-hero.png"
                  alt={`Portrait of ${SITE.name}`}
                  rounded="card"
                  className="aspect-square w-full [container-type:inline-size]"
                />
                <Avatar
                  src="/images/shahbaz-outdoor.jpg"
                  alt={`${SITE.name} outdoors`}
                  rounded="card"
                  className="aspect-square w-full [container-type:inline-size]"
                />
              </div>

              <GlassCard className="p-5">
                <ul className="flex flex-col gap-3 text-sm">
                  <li className="text-muted flex items-center gap-2.5">
                    <MapPin size={15} className="text-subtle shrink-0" />
                    {SITE.location} · {SITE.timezone}
                  </li>
                  <li className="text-muted flex items-center gap-2.5">
                    <Plane size={15} className="text-subtle shrink-0" />
                    Open to relocation worldwide
                  </li>
                  <li className="text-muted flex items-center gap-2.5">
                    <Languages size={15} className="text-subtle shrink-0" />
                    {LANGUAGES.map((l) => l.name).join(' · ')}
                  </li>
                </ul>
                <div className="border-line mt-4 flex gap-1 border-t pt-4">
                  {SOCIALS.map((s) => (
                    <a
                      key={s.label + s.handle}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      title={`${s.label} — ${s.handle}`}
                      className="text-subtle hover:text-ink hover:bg-surface-2 grid h-8 w-8 place-items-center rounded-lg transition-colors"
                    >
                      <SocialIcon name={s.icon} size={15} />
                    </a>
                  ))}
                </div>
              </GlassCard>
            </div>
          </Reveal>
        </div>
      </section>

      {/* -------------------------------------------------------- principles */}
      <section className="container-page section-y">
        <Reveal>
          <SectionHeading
            eyebrow="How I work"
            title={
              <>
                Four things I learned <span className="text-gradient">the expensive way</span>
              </>
            }
            className="mb-10 max-w-3xl"
          />
        </Reveal>
        <div className="grid gap-4 md:grid-cols-2">
          {PRINCIPLES.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.05}>
              <GlassCard interactive className="h-full p-6 lg:p-7">
                <span className="text-subtle font-mono text-xs">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="text-ink mt-3 text-lg">{p.title}</h3>
                <p className="text-muted mt-2.5 text-sm leading-relaxed">{p.detail}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- timeline */}
      <section className="container-page section-y">
        <Reveal>
          <SectionHeading
            eyebrow="Experience"
            title={
              <>
                A decade, <span className="text-gradient">four chapters</span>
              </>
            }
            className="mb-14 max-w-3xl"
          />
        </Reveal>
        <Timeline />
      </section>

      {/* --------------------------------------------------------- education */}
      <section className="container-page section-y">
        <Reveal>
          <SectionHeading
            eyebrow="Education"
            title="Where the foundations came from"
            className="mb-10 max-w-3xl"
          />
        </Reveal>

        <div className="grid gap-4 lg:grid-cols-3">
          {EDUCATION.map((e, i) => (
            <Reveal key={e.degree} delay={i * 0.05}>
              <GlassCard interactive className="flex h-full flex-col p-6 lg:p-7">
                <GraduationCap size={22} className="text-violet mb-5" />
                <h3 className="text-ink text-lg leading-snug">{e.degree}</h3>
                <p className="text-muted mt-2 text-sm">{e.institution}</p>
                <p className="text-subtle text-xs">{e.location}</p>
                {e.note && (
                  <p className="border-line text-muted mt-5 border-t pt-4 text-sm leading-relaxed">
                    {e.note}
                  </p>
                )}
              </GlassCard>
            </Reveal>
          ))}

          <Reveal delay={0.1}>
            <GlassCard interactive className="flex h-full flex-col p-6 lg:p-7">
              <span className="text-subtle mb-5 font-mono text-xs tracking-widest uppercase">
                Also studied
              </span>
              <ul className="flex flex-col gap-4">
                {COURSES.map((c) => (
                  <li key={c.name}>
                    <p className="text-ink text-sm font-medium">{c.name}</p>
                    <p className="text-subtle text-xs">{c.institution}</p>
                  </li>
                ))}
              </ul>
              <Link
                to="/skills"
                className="text-muted hover:text-ink group border-line mt-auto inline-flex items-center gap-2 border-t pt-5 text-sm transition-colors"
              >
                See the full skills matrix
                <ArrowUpRight
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </GlassCard>
          </Reveal>
        </div>
      </section>
    </>
  )
}
