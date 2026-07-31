import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { useRef, useState, type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline'
type Size = 'sm' | 'md' | 'lg'

const BASE =
  'relative inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 select-none'

const VARIANTS: Record<Variant, string> = {
  primary:
    'text-white shadow-[0_8px_30px_-8px_var(--glow)] hover:shadow-[0_12px_40px_-8px_var(--glow)] hover:-translate-y-0.5',
  secondary:
    'bg-surface-2 text-ink border border-line hover:border-line-strong hover:bg-surface-3 hover:-translate-y-0.5',
  outline:
    'border border-line-strong text-ink hover:bg-surface-2 hover:-translate-y-0.5 bg-transparent',
  ghost: 'text-muted hover:text-ink hover:bg-surface-2',
}

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-[0.9375rem]',
  lg: 'h-13 px-8 text-base',
}

type CommonProps = {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
  /** Renders a trailing icon slot with a nudge-on-hover animation. */
  icon?: ReactNode
}

function Inner({ variant, children, icon }: { variant: Variant; children: ReactNode; icon?: ReactNode }) {
  return (
    <>
      {variant === 'primary' && (
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-10 rounded-full bg-[linear-gradient(100deg,var(--accent-cyan),var(--accent-violet)_50%,var(--accent-magenta))] bg-[length:200%_100%] transition-[background-position] duration-500 group-hover:bg-[position:100%_0]"
        />
      )}
      {children}
      {icon && (
        <span className="transition-transform duration-300 group-hover:translate-x-0.5">{icon}</span>
      )}
    </>
  )
}

type ButtonProps = CommonProps & Omit<ComponentProps<'button'>, 'className' | 'children'>

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  icon,
  ...rest
}: ButtonProps) {
  return (
    <button className={cn('group', BASE, VARIANTS[variant], SIZES[size], className)} {...rest}>
      <Inner variant={variant} icon={icon}>
        {children}
      </Inner>
    </button>
  )
}

type LinkButtonProps = CommonProps & {
  to: string
  /** Set for mailto:, tel:, or any off-site destination. */
  external?: boolean
} & Omit<ComponentProps<'a'>, 'className' | 'children' | 'href'>

export function LinkButton({
  variant = 'primary',
  size = 'md',
  className,
  children,
  icon,
  to,
  external,
  ...rest
}: LinkButtonProps) {
  const classes = cn('group', BASE, VARIANTS[variant], SIZES[size], className)
  const inner = (
    <Inner variant={variant} icon={icon}>
      {children}
    </Inner>
  )

  if (external || /^(https?:|mailto:|tel:)/.test(to)) {
    return (
      <a
        href={to}
        className={classes}
        target={to.startsWith('http') ? '_blank' : undefined}
        rel={to.startsWith('http') ? 'noopener noreferrer' : undefined}
        {...rest}
      >
        {inner}
      </a>
    )
  }

  return (
    <Link to={to} className={classes} {...rest}>
      {inner}
    </Link>
  )
}

/**
 * Button that leans toward the cursor. Disabled under reduced-motion, and the
 * pull is capped well below the button's own size so the hit area stays honest.
 */
export function MagneticButton({
  children,
  className,
  strength = 0.28,
  ...rest
}: { children: ReactNode; className?: string; strength?: number } & ComponentProps<'div'>) {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const reduced = useReducedMotion()

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduced || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - (rect.left + rect.width / 2)
    const y = e.clientY - (rect.top + rect.height / 2)
    setOffset({ x: x * strength, y: y * strength })
  }

  return (
    <motion.div
      ref={ref}
      className={cn('inline-block', className)}
      onMouseMove={onMove}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: 'spring', stiffness: 260, damping: 18, mass: 0.4 }}
      {...(rest as object)}
    >
      {children}
    </motion.div>
  )
}
