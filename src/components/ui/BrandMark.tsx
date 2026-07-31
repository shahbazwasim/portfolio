import { cn } from '@/lib/cn'

/**
 * Generated logo mark for the (fictional) client brands in the case studies.
 * Deterministic from the slug, so a brand always renders the same glyph and hue
 * across cards, detail pages and OG images — no image assets, no trademarks.
 */

function hash(str: string) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/** Six geometric glyphs, picked by hash. */
function Glyph({ variant, hue }: { variant: number; hue: number }) {
  const a = `hsl(${hue} 85% 62%)`
  const b = `hsl(${(hue + 48) % 360} 85% 58%)`

  switch (variant) {
    case 0: // concentric arcs
      return (
        <>
          <circle cx="16" cy="16" r="9" fill="none" stroke={a} strokeWidth="2.5" strokeDasharray="34 14" />
          <circle cx="16" cy="16" r="4" fill={b} />
        </>
      )
    case 1: // stacked chevrons
      return (
        <>
          <path d="M8 19l8-7 8 7" fill="none" stroke={a} strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 25l8-7 8 7" fill="none" stroke={b} strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
        </>
      )
    case 2: // offset squares
      return (
        <>
          <rect x="7" y="7" width="13" height="13" rx="3.5" fill={a} />
          <rect x="14" y="14" width="11" height="11" rx="3" fill={b} opacity="0.72" />
        </>
      )
    case 3: // orbit
      return (
        <>
          <ellipse cx="16" cy="16" rx="10" ry="5" fill="none" stroke={a} strokeWidth="2.25" transform="rotate(-32 16 16)" />
          <circle cx="16" cy="16" r="3.5" fill={b} />
        </>
      )
    case 4: // ascending bars
      return (
        <>
          <rect x="8" y="17" width="4" height="8" rx="2" fill={a} opacity="0.6" />
          <rect x="14" y="12" width="4" height="13" rx="2" fill={a} />
          <rect x="20" y="7" width="4" height="18" rx="2" fill={b} />
        </>
      )
    default: // prism
      return (
        <>
          <path d="M16 6l9 16H7z" fill="none" stroke={a} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M16 13l4.5 9h-9z" fill={b} />
        </>
      )
  }
}

type BrandMarkProps = {
  name: string
  slug: string
  className?: string
  /** Icon only, or icon plus wordmark. */
  variant?: 'icon' | 'full'
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: { box: 'h-8 w-8', text: 'text-sm', gap: 'gap-2' },
  md: { box: 'h-10 w-10', text: 'text-base', gap: 'gap-2.5' },
  lg: { box: 'h-14 w-14', text: 'text-xl', gap: 'gap-3.5' },
} as const

export function BrandMark({
  name,
  slug,
  className,
  variant = 'full',
  size = 'md',
}: BrandMarkProps) {
  const h = hash(slug)
  const hue = h % 360
  const glyph = h % 6
  const s = SIZES[size]

  return (
    <span className={cn('inline-flex items-center', s.gap, className)}>
      <span
        className={cn(
          'border-line grid shrink-0 place-items-center rounded-xl border',
          s.box
        )}
        style={{
          background: `linear-gradient(140deg, hsl(${hue} 70% 50% / 0.16), hsl(${(hue + 48) % 360} 70% 50% / 0.06))`,
        }}
      >
        <svg viewBox="0 0 32 32" className="h-[62%] w-[62%]" role="img" aria-label={`${name} logo`}>
          <Glyph variant={glyph} hue={hue} />
        </svg>
      </span>
      {variant === 'full' && (
        <span className={cn('font-display text-ink font-semibold tracking-tight', s.text)}>
          {name}
        </span>
      )}
    </span>
  )
}
