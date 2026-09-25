import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Check, ChevronDown, Copy, Lightbulb } from 'lucide-react'
import { Seo } from '@/lib/seo'
import { getProject } from '@/data/projects'
import {
  CREATOR_PROFILE,
  PUBLISHED_ISLANDS,
  VERSE_CONCEPTS,
  type PublishedIsland,
} from '@/data/uefn'
import { GlassCard } from '@/components/ui/Surfaces'
import { Reveal } from '@/components/ui/Reveal'
import { ProjectVisual } from '@/components/ui/ProjectVisual'
import { CodeWindow } from '@/components/ui/CodeWindow'
import { LinkButton } from '@/components/ui/Button'

/** Island code with one-click copy — the code is what a visitor pastes into Fortnite. */
function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard can be blocked; the code is still visible and selectable.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? 'Island code copied' : `Copy island code ${code}`}
      className="border-line bg-surface-2 text-ink hover:border-line-strong inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-sm transition-colors"
    >
      {code}
      {copied ? (
        <Check size={14} className="text-cyan" aria-hidden="true" />
      ) : (
        <Copy size={14} className="text-subtle" aria-hidden="true" />
      )}
    </button>
  )
}

function IslandCard({ island }: { island: PublishedIsland }) {
  return (
    <GlassCard className="flex h-full flex-col overflow-hidden" ring={false}>
      <img
        src={island.image}
        alt={`${island.title} — in-game screenshot`}
        loading="lazy"
        decoding="async"
        className="aspect-video w-full object-cover"
      />
      <div className="flex flex-1 flex-col p-5 lg:p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="text-subtle font-mono text-[0.625rem] tracking-[0.16em] uppercase">
            {island.genre}
          </span>
          <time className="text-subtle font-mono text-xs" dateTime={island.published}>
            {island.published}
          </time>
        </div>
        <h3 className="text-ink mt-2 text-lg leading-snug">{island.title}</h3>
        <p className="text-muted mt-2 text-sm leading-relaxed">{island.summary}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
          <CopyCode code={island.code} />
          <a
            href={`https://fortnite.gg/island?code=${island.code}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-ink inline-flex items-center gap-1.5 text-sm transition-colors"
          >
            Player stats
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
    </GlassCard>
  )
}

function ConceptCard({ slug, title, note }: { slug: string; title: string; note: string }) {
  const project = getProject(slug)
  if (!project) return null

  return (
    <GlassCard className="flex h-full flex-col p-3 lg:p-4" ring={false}>
      <figure>
        <ProjectVisual
          slug={project.slug}
          category={project.category}
          art={project.screenshots[0]?.art}
          alt={`Illustration: ${project.screenshots[0]?.caption ?? title}`}
        />
        {/* Same seeds as the case study's interface grid, so the art matches it. */}
        <div className="mt-2 grid grid-cols-2 gap-2">
          {project.screenshots.slice(1, 3).map((shot, i) => (
            <ProjectVisual
              key={shot.caption}
              slug={`${project.slug}-${i + 1}`}
              category={project.category}
              art={shot.art}
              alt={`Illustration: ${shot.caption}`}
              className="rounded-md"
            />
          ))}
        </div>
        <figcaption className="text-subtle mt-2 px-1 font-mono text-[0.625rem] tracking-[0.12em] uppercase">
          Illustrations — not screenshots
        </figcaption>
      </figure>

      <div className="flex flex-1 flex-col px-2 pt-4 pb-2">
        <span className="border-line bg-surface-2 text-muted inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.6875rem]">
          <Lightbulb size={11} className="text-cyan" aria-hidden="true" />
          Concept · not published
        </span>
        <h3 className="text-ink mt-3 text-lg leading-snug">{title}</h3>
        <p className="text-muted mt-2 text-sm leading-relaxed">{note}</p>

        {project.code && (
          <details className="group mt-4">
            <summary className="text-muted hover:text-ink flex cursor-pointer list-none items-center gap-1.5 text-sm font-medium transition-colors [&::-webkit-details-marker]:hidden">
              <ChevronDown
                size={15}
                className="transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
              Show the Verse · {project.code.file}
            </summary>
            <div className="mt-3 min-w-0">
              <CodeWindow code={project.code} />
            </div>
          </details>
        )}
      </div>
    </GlassCard>
  )
}

/**
 * Unlisted UEFN page: shared by direct link, kept out of the header menu, the
 * sitemap and search indexes. Published islands only ever come from
 * PUBLISHED_ISLANDS, so the page never shows a code that doesn't open.
 */
export default function Uefn() {
  const hasIslands = PUBLISHED_ISLANDS.length > 0

  return (
    <>
      <Seo
        title="UEFN portfolio"
        description={
          hasIslands
            ? 'Published Fortnite islands with their island codes, and Verse concept builds for game systems.'
            : 'Verse concept builds for Fortnite game systems: a ranked round engine, an AI director, a tycoon save schema and a physics puzzle controller.'
        }
        path="/uefn"
        noIndex
      />

      <section className="container-page grid items-center gap-10 pt-32 pb-12 lg:grid-cols-[1.2fr_1fr] lg:gap-14 lg:pt-40">
        <Reveal>
          <span className="text-subtle font-mono text-xs tracking-[0.2em] uppercase">
            UEFN & Verse
          </span>
          <h1 className="mt-5 max-w-4xl text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.02]">
            UEFN portfolio.
            <br />
            <span className="text-gradient">{hasIslands ? 'Islands and Verse.' : 'Verse game systems.'}</span>
          </h1>
          <p className="text-muted mt-7 max-w-2xl text-lg leading-relaxed">
            {hasIslands
              ? 'Published islands come first, each with its island code — open any of them in Fortnite. Below them are Verse concept builds: working code for game systems, not yet published as islands.'
              : 'Game systems for Fortnite islands, written in Verse: a ranked round engine, an AI director, a tycoon save schema and a physics puzzle-room controller.'}
          </p>
          {CREATOR_PROFILE && (
            <a
              href={CREATOR_PROFILE}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan mt-6 inline-flex items-center gap-1.5 text-sm font-medium"
            >
              Creator profile on fortnite.com
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          )}
        </Reveal>

        <Reveal delay={0.06} direction="right" className="min-w-0">
          <figure>
            <ProjectVisual
              slug="uefn-portfolio"
              category="UEFN & Games"
              art="island"
              alt="Illustration of an island minimap with a closing storm"
              className="rounded-panel shadow-[var(--shadow-lift)]"
            />
            <figcaption className="text-subtle mt-3 text-center font-mono text-[0.625rem] tracking-[0.12em] uppercase">
              Illustration
            </figcaption>
          </figure>
        </Reveal>
      </section>

      {/* ------------------------------------------------ published islands */}
      {/* Rendered only once PUBLISHED_ISLANDS has a real entry — no placeholder. */}
      {hasIslands && (
        <section className="container-page pb-16">
          <Reveal>
            <h2 className="text-subtle mb-6 font-mono text-xs tracking-[0.2em] uppercase">
              Published islands
            </h2>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {PUBLISHED_ISLANDS.map((island, i) => (
              <Reveal key={island.code} delay={Math.min(i * 0.05, 0.2)} className="min-w-0">
                <IslandCard island={island} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ------------------------------------------------- concept builds */}
      <section className="container-page border-line border-t pt-16 pb-24">
        <Reveal>
          <h2 className="text-subtle font-mono text-xs tracking-[0.2em] uppercase">
            Verse concept builds
          </h2>
          <p className="text-muted mt-4 mb-8 max-w-2xl leading-relaxed">
            Game systems designed and written in Verse, not yet published as islands. The images
            are illustrations; the code is real.
          </p>
        </Reveal>

        <div className="grid gap-5 lg:grid-cols-2">
          {VERSE_CONCEPTS.map((concept, i) => (
            <Reveal key={concept.slug} delay={Math.min(i * 0.05, 0.2)} className="min-w-0">
              <ConceptCard {...concept} />
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-12">
            <LinkButton to="/contact" icon={<ArrowUpRight size={17} />}>
              Get in touch
            </LinkButton>
          </div>
        </Reveal>
      </section>
    </>
  )
}
