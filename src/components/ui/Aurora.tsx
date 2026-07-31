import { cn } from '@/lib/cn'

type AuroraProps = {
  className?: string
  /** `fixed` for the page backdrop, `absolute` to scope it to a section. */
  position?: 'fixed' | 'absolute'
  intensity?: 'subtle' | 'normal' | 'vivid'
}

const INTENSITY = {
  subtle: 'opacity-[0.35]',
  normal: 'opacity-60',
  vivid: 'opacity-90',
} as const

/**
 * The signature backdrop: three slowly drifting colour blooms behind a fine grid.
 * Pure CSS — no canvas, no rAF loop, no main-thread cost — and the blobs are
 * `will-change: transform` so the drift stays on the compositor.
 */
export function Aurora({ className, position = 'absolute', intensity = 'normal' }: AuroraProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none inset-0 overflow-hidden',
        position === 'fixed' ? 'fixed -z-10' : 'absolute -z-10',
        INTENSITY[intensity],
        className
      )}
      style={{ opacity: `calc(var(--aurora-opacity) * 1)` }}
    >
      {/* Three drifting blooms. Blur radius is roughly halved below `sm`:
          a 100px+ blur over a 55vmax box is one of the most expensive things
          you can ask a phone GPU to composite, and at that size the visual
          difference is imperceptible. */}
      {/* Cyan — top left */}
      <div
        data-aurora
        className="animate-aurora absolute -top-[20%] -left-[10%] h-[55vmax] w-[55vmax] rounded-full blur-[55px] will-change-transform sm:blur-[100px]"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--accent-cyan) 55%, transparent), transparent 68%)',
          animationDelay: '0s',
        }}
      />
      {/* Violet — centre right */}
      <div
        data-aurora
        className="animate-aurora absolute top-[10%] -right-[15%] h-[60vmax] w-[60vmax] rounded-full blur-[60px] will-change-transform sm:blur-[120px]"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--accent-violet) 60%, transparent), transparent 68%)',
          animationDelay: '-8s',
          animationDuration: '30s',
        }}
      />
      {/* Magenta — bottom. Hidden on the smallest screens; three overlapping
          blurred layers is more compositing than the effect is worth there. */}
      <div
        data-aurora
        className="animate-aurora absolute -bottom-[25%] left-[20%] hidden h-[50vmax] w-[50vmax] rounded-full blur-[110px] will-change-transform sm:block"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--accent-magenta) 45%, transparent), transparent 68%)',
          animationDelay: '-16s',
          animationDuration: '36s',
        }}
      />

      {/* Technical grid, faded out toward the edges */}
      <div
        className="absolute inset-0 opacity-[0.06] dark:opacity-[0.09]"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--text) 1px, transparent 1px), linear-gradient(to bottom, var(--text) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, #000 30%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, #000 30%, transparent 78%)',
        }}
      />
    </div>
  )
}

/** Film grain overlay. Sits above the aurora, below content. */
export function Grain({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none fixed inset-0 -z-[9] mix-blend-overlay', className)}
      style={{
        opacity: 'var(--grain-opacity)',
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
        backgroundRepeat: 'repeat',
      }}
    />
  )
}
