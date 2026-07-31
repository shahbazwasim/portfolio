import { Quote } from 'lucide-react'
import { TESTIMONIALS, hasPublishedTestimonials } from '@/data/testimonials'
import { GlassCard, SectionHeading } from '@/components/ui/Surfaces'
import { Reveal } from '@/components/ui/Reveal'

/**
 * Renders nothing until real recommendations are added.
 *
 * See src/data/testimonials.ts — the section is gated behind a flag rather than
 * shipped with invented quotes, because a recommendation is only worth anything
 * if a reader can click through and verify it.
 */
export function Testimonials() {
  if (!hasPublishedTestimonials()) return null

  return (
    <section className="container-page section-y">
      <Reveal>
        <SectionHeading
          eyebrow="Recommendations"
          title={
            <>
              What people <span className="text-gradient">say</span>
            </>
          }
          align="center"
          className="mx-auto mb-12 max-w-2xl items-center text-center"
        />
      </Reveal>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <Reveal key={t.author + i} delay={i * 0.06}>
            <GlassCard interactive className="flex h-full flex-col p-6 lg:p-7">
              <Quote size={22} className="text-violet mb-4 shrink-0 opacity-60" />
              <blockquote className="text-muted flex-1 text-sm leading-relaxed">
                “{t.quote}”
              </blockquote>
              <footer className="border-line mt-6 flex items-center gap-3 border-t pt-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,var(--accent-cyan),var(--accent-violet))] text-xs font-bold text-white">
                  {t.author
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="text-ink truncate text-sm font-medium">
                    {t.profileUrl ? (
                      <a
                        href={t.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-cyan transition-colors"
                      >
                        {t.author}
                      </a>
                    ) : (
                      t.author
                    )}
                  </p>
                  <p className="text-subtle truncate text-xs">
                    {t.title} · {t.company}
                  </p>
                </div>
              </footer>
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
