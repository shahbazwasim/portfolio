import type { ReactNode } from 'react'
import { RotateCcw } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Shared shell for the demo apps: an app-window frame with a title bar,
 * an optional toolbar and a reset control.
 *
 * Each demo renders inside this so they read as distinct applications embedded
 * in the page rather than as more page sections.
 */
export function DemoChrome({
  title,
  subtitle,
  onReset,
  children,
  className,
  bodyClassName,
}: {
  title: string
  subtitle?: string
  onReset?: () => void
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <div
      className={cn(
        'border-line bg-surface overflow-hidden rounded-2xl border shadow-[var(--shadow-lift)]',
        className
      )}
    >
      {/* Title bar */}
      <div className="border-line bg-surface-2/70 flex items-center gap-3 border-b px-4 py-2.5">
        <div className="flex shrink-0 gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
        </div>
        <div className="min-w-0 flex-1 text-center">
          <p className="text-muted truncate font-mono text-xs">
            {title}
            {subtitle && <span className="text-subtle"> — {subtitle}</span>}
          </p>
        </div>
        {onReset ? (
          <button
            onClick={onReset}
            title="Reset demo data"
            className="text-subtle hover:text-ink hover:bg-surface-3 inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-[0.6875rem] transition-colors"
          >
            <RotateCcw size={11} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        ) : (
          <span className="w-6 shrink-0" />
        )}
      </div>

      <div className={cn('bg-bg', bodyClassName)}>{children}</div>
    </div>
  )
}

/** Sidebar/toolbar section label. */
export function DemoLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-subtle px-1 pb-2 font-mono text-[0.625rem] tracking-[0.16em] uppercase">
      {children}
    </p>
  )
}

/** Compact stat tile used across the CRM and BI demos. */
export function StatTile({
  label,
  value,
  delta,
  accent,
}: {
  label: string
  value: string
  delta?: { value: string; positive: boolean }
  accent?: string
}) {
  return (
    <div className="border-line bg-surface-2/50 rounded-xl border p-4">
      <p className="text-subtle text-xs">{label}</p>
      <p className={cn('font-display mt-2 text-2xl font-semibold', accent ?? 'text-ink')}>{value}</p>
      {delta && (
        <p
          className={cn(
            'mt-1 text-xs',
            delta.positive ? 'text-emerald-400' : 'text-red-400'
          )}
        >
          {delta.positive ? '▲' : '▼'} {delta.value}
        </p>
      )}
    </div>
  )
}
