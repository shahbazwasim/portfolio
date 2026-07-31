import { useRef, useState, type ComponentProps, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

/* -------------------------------------------------------------------------- */
/* GlassCard                                                                   */
/* -------------------------------------------------------------------------- */

type GlassCardProps = {
  children: ReactNode
  className?: string
  /** Adds the 1px gradient outline. */
  ring?: boolean
  /** Lifts and brightens on hover. Turn off for static/informational cards. */
  interactive?: boolean
  /** Cursor-following radial highlight. */
  spotlight?: boolean
} & Omit<ComponentProps<'div'>, 'className' | 'children'>

export function GlassCard({
  children,
  className,
  ring = true,
  interactive = false,
  spotlight = false,
  ...rest
}: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!spotlight || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top })
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setPos(null)}
      className={cn(
        'glass rounded-card relative overflow-hidden',
        interactive &&
          'transition-[transform,box-shadow,border-color] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] hover:border-line-strong',
        className
      )}
      {...rest}
    >
      {ring && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] p-px [background:linear-gradient(135deg,color-mix(in_oklab,var(--accent-cyan)_50%,transparent),color-mix(in_oklab,var(--accent-violet)_40%,transparent)_45%,transparent_75%)] [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] [mask-composite:exclude] opacity-40"
        />
      )}
      {spotlight && pos && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
          style={{
            background: `radial-gradient(340px circle at ${pos.x}px ${pos.y}px, color-mix(in oklab, var(--accent-violet) 16%, transparent), transparent 65%)`,
          }}
        />
      )}
      <div className="relative">{children}</div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Tilt                                                                        */
/* -------------------------------------------------------------------------- */

/** 3D tilt toward the cursor. Kept shallow — big angles read as gimmicky. */
export function Tilt({
  children,
  className,
  max = 7,
}: {
  children: ReactNode
  className?: string
  max?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [t, setT] = useState({ rx: 0, ry: 0 })
  const reduced = useReducedMotion()

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduced || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    setT({ rx: -py * max * 2, ry: px * max * 2 })
  }

  return (
    <motion.div
      ref={ref}
      className={cn('[transform-style:preserve-3d]', className)}
      style={{ perspective: 900 }}
      onMouseMove={onMove}
      onMouseLeave={() => setT({ rx: 0, ry: 0 })}
      animate={{ rotateX: t.rx, rotateY: t.ry }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      {children}
    </motion.div>
  )
}

/* -------------------------------------------------------------------------- */
/* Badge / Pill                                                                */
/* -------------------------------------------------------------------------- */

type BadgeTone = 'neutral' | 'cyan' | 'violet' | 'magenta' | 'success'

const TONES: Record<BadgeTone, string> = {
  neutral: 'border-line bg-surface-2 text-muted',
  cyan: 'border-cyan/25 bg-cyan/10 text-cyan',
  violet: 'border-violet/25 bg-violet/10 text-violet',
  magenta: 'border-magenta/25 bg-magenta/10 text-magenta',
  success: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400',
}

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode
  tone?: BadgeTone
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium tracking-wide',
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  )
}

/** Live availability chip with the pulsing ring. */
export function StatusDot({ tone = 'success' }: { tone?: 'success' | 'amber' }) {
  const color = tone === 'success' ? 'bg-emerald-400' : 'bg-amber-400'
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      <span className={cn('animate-pulse-ring absolute inline-flex h-full w-full rounded-full', color)} />
      <span className={cn('relative inline-flex h-2 w-2 rounded-full', color)} />
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/* SectionHeading                                                              */
/* -------------------------------------------------------------------------- */

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}: {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  align?: 'left' | 'center'
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' && 'items-center text-center',
        className
      )}
    >
      {eyebrow && (
        <div className="flex items-center gap-3">
          <span className="from-cyan h-px w-8 bg-gradient-to-r to-transparent" />
          <span className="font-mono text-xs tracking-[0.2em] text-subtle uppercase">{eyebrow}</span>
        </div>
      )}
      <h2 className="text-3xl leading-[1.1] sm:text-4xl lg:text-5xl">{title}</h2>
      {description && (
        <p className={cn('text-muted max-w-2xl text-base leading-relaxed sm:text-lg')}>
          {description}
        </p>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Marquee                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Infinite horizontal scroller. Children are duplicated once and the track
 * translates -50%, so the loop is seamless.
 */
export function Marquee({
  children,
  className,
  speed = 42,
  reverse = false,
  pauseOnHover = true,
}: {
  children: ReactNode
  className?: string
  speed?: number
  reverse?: boolean
  pauseOnHover?: boolean
}) {
  return (
    <div
      className={cn(
        'group relative flex overflow-hidden',
        '[mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]',
        className
      )}
    >
      {[0, 1].map((i) => (
        <div
          key={i}
          data-marquee
          aria-hidden={i === 1}
          className={cn(
            'animate-marquee flex shrink-0 items-center gap-4 pr-4',
            pauseOnHover && 'group-hover:[animation-play-state:paused]'
          )}
          style={{
            animationDuration: `${speed}s`,
            animationDirection: reverse ? 'reverse' : 'normal',
          }}
        >
          {children}
        </div>
      ))}
    </div>
  )
}
