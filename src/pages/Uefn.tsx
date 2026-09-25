import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Check, ChevronDown, Copy, Lightbulb, Maximize2 } from 'lucide-react'
import { Seo } from '@/lib/seo'
import { cn } from '@/lib/cn'
import { getProject } from '@/data/projects'
import {
  CREATOR_PROFILE,
  HERO_ART,
  PUBLISHED_ISLANDS,
  VERSE_CONCEPTS,
  type ConceptArt,
  type PublishedIsland,
} from '@/data/uefn'
import { GlassCard } from '@/components/ui/Surfaces'
import { Reveal } from '@/components/ui/Reveal'
import { ProjectVisual } from '@/components/ui/ProjectVisual'
import { CodeWindow } from '@/components/ui/CodeWindow'
import { Lightbox, type LightboxImage } from '@/components/ui/Lightbox'
import { LinkButton } from '@/components/ui/Button'

const ART_DIR = '/images/uefn/concept-art'

const artSources = (name: string) => ({
  src: `${ART_DIR}/${name}-1600.webp`,
  srcSet: `${ART_DIR}/${name}-800.webp 800w, ${ART_DIR}/${name}-1600.webp 1600w`,
})

/** Every concept image on the page, in the order the viewer pages through them. */
const GALLERY: ConceptArt[] = [HERO_ART, ...VERSE_CONCEPTS.flatMap((c) => [c.art, c.detail])]
const VIEWER_IMAGES: LightboxImage[] = GALLERY.map((art) => ({
  ...artSources(art.name),
  alt: art.alt,
  caption: `${art.caption} — concept art, not a game screenshot`,
}))
const viewerIndex = (art: ConceptArt) => GALLERY.findIndex((a) => a.name === art.name)

/** A concept render that opens the viewer. */
function ConceptImage({
  art,
  sizes,
  priority = false,
  onOpen,
  className,
}: {
  art: ConceptArt
  sizes: string
  priority?: boolean
  onOpen: () => void
  className?: string
}) {
  const { src, srcSet } = artSources(art.name)
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn('group bg-surface-2 relative block w-full overflow-hidden', className)}
    >
      <span className="sr-only">View larger: </span>
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        width={1600}
        height={900}
        alt={art.alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className="aspect-video w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />
      <span
        aria-hidden="true"
        className="bg-bg/70 text-ink absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        <Maximize2 size={14} />
      </span>
    </button>
  )
}

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

function ConceptCard({
  slug,
  title,
  note,
  art,
  onView,
}: {
  slug: string
  title: string
  note: string
  art: ConceptArt
  onView: (art: ConceptArt) => void
}) {
  const project = getProject(slug)
  if (!project) return null

  return (
    <GlassCard className="flex h-full flex-col p-3 lg:p-4" ring={false}>
      <figure>
        <ConceptImage
          art={art}
          sizes="(min-width: 1280px) 600px, (min-width: 1024px) 46vw, 100vw"
          onOpen={() => onView(art)}
          className="rounded-xl"
        />
        {/* Same seeds as the case study's interface grid, so the art matches it. */}
        <div className="mt-2 grid grid-cols-2 gap-2">
          {project.screenshots.slice(0, 2).map((shot, i) => (
            <ProjectVisual
              key={shot.caption}
              slug={i === 0 ? project.slug : `${project.slug}-${i}`}
              category={project.category}
              art={shot.art}
              alt={`Illustration: ${shot.caption}`}
              className="rounded-md"
            />
          ))}
        </div>
        <figcaption className="text-subtle mt-2 px-1 font-mono text-[0.625rem] tracking-[0.12em] uppercase">
          Concept art and illustrations — not screenshots
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
 * PUBLISHED_ISLANDS, so the page never shows a code that doesn't open; the
 * concept art is captioned as such wherever it appears.
 */
export default function Uefn() {
  const hasIslands = PUBLISHED_ISLANDS.length > 0
  const [viewing, setViewing] = useState<number | null>(null)
  const view = (art: ConceptArt) => setViewing(viewerIndex(art))

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
        image={`${ART_DIR}/hero-og.jpg`}
        noIndex
      />

      <section className="container-page grid items-center gap-10 pt-32 pb-12 lg:grid-cols-[1.1fr_1fr] lg:gap-14 lg:pt-40">
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
            <ConceptImage
              art={HERO_ART}
              sizes="(min-width: 1280px) 580px, (min-width: 1024px) 46vw, 100vw"
              priority
              onOpen={() => view(HERO_ART)}
              className="rounded-panel border-line border shadow-[var(--shadow-lift)]"
            />
            <figcaption className="text-subtle mt-3 text-center font-mono text-[0.625rem] tracking-[0.12em] uppercase">
              Concept art — rendered scene, not a game screenshot
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

      {/* ------------------------------------------------------ concept art */}
      <section className="container-page border-line border-t pt-16 pb-16">
        <Reveal>
          <h2 className="text-subtle font-mono text-xs tracking-[0.2em] uppercase">Concept art</h2>
          <p className="text-muted mt-4 mb-8 max-w-2xl leading-relaxed">
            Close-ups of the four builds below. These are rendered scenes, not in-game screenshots —
            select any image to see it full size.
          </p>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2">
          {VERSE_CONCEPTS.map((concept, i) => (
            <Reveal key={concept.detail.name} delay={Math.min(i * 0.05, 0.2)} className="min-w-0">
              <figure>
                <ConceptImage
                  art={concept.detail}
                  sizes="(min-width: 1280px) 620px, (min-width: 640px) 50vw, 100vw"
                  onOpen={() => view(concept.detail)}
                  className="border-line rounded-2xl border"
                />
                <figcaption className="text-muted mt-3 text-sm">{concept.detail.caption}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------- concept builds */}
      <section className="container-page border-line border-t pt-16 pb-24">
        <Reveal>
          <h2 className="text-subtle font-mono text-xs tracking-[0.2em] uppercase">
            Verse concept builds
          </h2>
          <p className="text-muted mt-4 mb-8 max-w-2xl leading-relaxed">
            Game systems designed and written in Verse, not yet published as islands. The images
            are concept art and illustrations; the code is real.
          </p>
        </Reveal>

        <div className="grid gap-5 lg:grid-cols-2">
          {VERSE_CONCEPTS.map((concept, i) => (
            <Reveal key={concept.slug} delay={Math.min(i * 0.05, 0.2)} className="min-w-0">
              <ConceptCard
                slug={concept.slug}
                title={concept.title}
                note={concept.note}
                art={concept.art}
                onView={view}
              />
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

      <Lightbox images={VIEWER_IMAGES} index={viewing} onIndexChange={setViewing} />
    </>
  )
}
