import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { SITE } from '@/data/site'

/**
 * Photo with a designed fallback.
 *
 * The portrait files may not be in /public yet, so instead of a broken image
 * this renders a gradient monogram that looks deliberate. Drop the real file
 * at the given path and it takes over with no code change.
 */
export function Avatar({
  src,
  alt,
  className,
  rounded = 'full',
  priority = false,
}: {
  src: string
  alt: string
  className?: string
  rounded?: 'full' | 'card' | 'panel'
  priority?: boolean
}) {
  const [failed, setFailed] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // The markup is prerendered, so a missing image can finish failing before
  // React hydrates — and the onError that would have fired is lost. Re-check
  // the decoded state on mount to catch that case.
  useEffect(() => {
    const img = imgRef.current
    if (img?.complete && img.naturalWidth === 0) setFailed(true)
  }, [])

  const radius =
    rounded === 'full' ? 'rounded-full' : rounded === 'card' ? 'rounded-card' : 'rounded-panel'

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          'border-line relative grid place-items-center overflow-hidden border',
          radius,
          className
        )}
        style={{
          background:
            'linear-gradient(140deg, color-mix(in oklab, var(--accent-cyan) 26%, var(--surface-2)), color-mix(in oklab, var(--accent-violet) 30%, var(--surface-2)))',
        }}
      >
        {/* Topographic echo of the real portrait's backdrop. Uses the theme's
            ink colour so it reads in both light and dark. */}
        <svg
          aria-hidden="true"
          className="text-ink absolute inset-0 h-full w-full opacity-[0.18]"
          viewBox="0 0 200 200"
          preserveAspectRatio="xMidYMid slice"
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <circle
              key={i}
              cx={100 + Math.sin(i * 1.3) * 26}
              cy={100 + Math.cos(i * 1.1) * 22}
              r={16 + i * 11}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.1"
            />
          ))}
        </svg>
        <span className="font-display text-ink relative text-[clamp(1.5rem,18cqw,4rem)] font-bold tracking-tight opacity-80">
          SW
        </span>
      </div>
    )
  }

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      className={cn('border-line border object-cover', radius, className)}
    />
  )
}

/** Hero portrait: the cutout if present, otherwise the circular headshot. */
export function HeroPortrait({ className }: { className?: string }) {
  return (
    <Avatar
      src="/images/profile-hero.png"
      alt={`${SITE.name}, ${SITE.role}`}
      rounded="full"
      priority
      className={cn('[container-type:inline-size]', className)}
    />
  )
}
