import { useCallback, useEffect, useState } from 'react'

/**
 * localStorage-backed state, safe to render during SSG.
 *
 * The first render always returns `initial` so server and client markup match;
 * the stored value is adopted in an effect immediately after hydration. That
 * costs one extra paint and avoids the hydration mismatch that `typeof window`
 * checks inside useState would cause.
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw !== null) setValue(JSON.parse(raw) as T)
    } catch {
      // Corrupt entry or storage blocked — fall through to `initial`.
    }
    setHydrated(true)
  }, [key])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Quota exceeded or private mode: the demo still works in memory.
    }
  }, [key, value, hydrated])

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
    setValue(initial)
    // `initial` is a literal at every call site, so excluding it from deps
    // avoids resetting the callback identity on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return { value, setValue, reset, hydrated } as const
}

/** Deterministic pseudo-random source, so demo seed data is identical for everyone. */
export function seededRandom(seed: number) {
  let s = seed || 1
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

export function currency(value: number, code = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: code,
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value)
}

export function compactNumber(value: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(
    value
  )
}
