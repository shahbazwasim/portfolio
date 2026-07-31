import { motion, useReducedMotion, type Variants } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Direction = 'up' | 'down' | 'left' | 'right' | 'none'

const OFFSET: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 28 },
  down: { x: 0, y: -28 },
  left: { x: 32, y: 0 },
  right: { x: -32, y: 0 },
  none: { x: 0, y: 0 },
}

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  direction?: Direction
  /** Fraction of the element that must be visible before it animates. */
  amount?: number
  as?: 'div' | 'section' | 'li' | 'article' | 'span'
}

/**
 * Scroll-triggered entrance. Fires once, and collapses to a plain fade
 * (no transform) when the visitor prefers reduced motion.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  direction = 'up',
  amount = 0.25,
  as = 'div',
}: RevealProps) {
  const reduced = useReducedMotion()
  const offset = reduced ? OFFSET.none : OFFSET[direction]
  const MotionTag = motion[as]

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{
        duration: reduced ? 0.2 : 0.7,
        delay: reduced ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </MotionTag>
  )
}

const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

const staggerChild: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

/** Wraps a list so children cascade in. Pair with <StaggerItem>. */
export function Stagger({
  children,
  className,
  amount = 0.15,
}: {
  children: ReactNode
  className?: string
  amount?: number
}) {
  return (
    <motion.div
      className={cn(className)}
      variants={staggerParent}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={cn(className)}
      variants={reduced ? { hidden: { opacity: 0 }, show: { opacity: 1 } } : staggerChild}
    >
      {children}
    </motion.div>
  )
}
