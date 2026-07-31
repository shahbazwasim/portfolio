import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowRight,
  Braces,
  CornerDownLeft,
  FileText,
  House,
  Layers,
  Mail,
  Moon,
  Search,
  Sparkles,
  Sun,
  User,
  Wrench,
} from 'lucide-react'
import { SITE } from '@/data/site'
import { PROJECTS } from '@/data/projects'
import { DEMOS } from '@/data/demos'
import { useTheme } from '@/lib/theme'
import { cn } from '@/lib/cn'

type Item = {
  id: string
  label: string
  hint?: string
  group: string
  keywords?: string
  icon: React.ReactNode
  run: () => void
}

/** Subsequence match — "nxcrm" finds "NexusCRM". Returns null when it doesn't match. */
function fuzzyScore(query: string, target: string): number | null {
  if (!query) return 0
  const q = query.toLowerCase()
  const t = target.toLowerCase()

  const direct = t.indexOf(q)
  if (direct === 0) return 1000
  if (direct > 0) return 800 - direct

  let qi = 0
  let score = 0
  let streak = 0
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      streak++
      score += 10 + streak * 2
      if (ti === 0 || t[ti - 1] === ' ' || t[ti - 1] === '-') score += 15
      qi++
    } else {
      streak = 0
    }
  }
  return qi === q.length ? score : null
}

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const items = useMemo<Item[]>(() => {
    const go = (path: string) => () => {
      onOpenChange(false)
      navigate(path)
    }

    return [
      { id: 'home', label: 'Home', group: 'Pages', icon: <House size={16} />, run: go('/') },
      { id: 'work', label: 'Work', hint: 'Case studies', group: 'Pages', icon: <Layers size={16} />, run: go('/work') },
      { id: 'ai', label: 'AI Expertise', group: 'Pages', icon: <Sparkles size={16} />, run: go('/ai') },
      { id: 'demos', label: 'Live Demos', group: 'Pages', icon: <Braces size={16} />, run: go('/demos') },
      { id: 'skills', label: 'Skills', group: 'Pages', icon: <Wrench size={16} />, run: go('/skills') },
      { id: 'services', label: 'Services', group: 'Pages', icon: <Layers size={16} />, run: go('/services') },
      { id: 'about', label: 'About', group: 'Pages', icon: <User size={16} />, run: go('/about') },
      { id: 'blog', label: 'Blog', group: 'Pages', icon: <FileText size={16} />, run: go('/blog') },
      { id: 'resume', label: 'Résumé', group: 'Pages', icon: <FileText size={16} />, run: go('/resume') },
      { id: 'contact', label: 'Contact', group: 'Pages', icon: <Mail size={16} />, run: go('/contact') },

      ...PROJECTS.map<Item>((p) => ({
        id: `project-${p.slug}`,
        label: p.title,
        hint: p.client,
        group: 'Case studies',
        keywords: [p.category, ...p.tech].join(' '),
        icon: <Layers size={16} />,
        run: go(`/work/${p.slug}`),
      })),

      ...DEMOS.map<Item>((d) => ({
        id: `demo-${d.slug}`,
        label: d.name,
        hint: 'Live demo',
        group: 'Demos',
        keywords: d.tech.join(' '),
        icon: <Braces size={16} />,
        run: go(`/demos/${d.slug}`),
      })),

      {
        id: 'theme',
        label: `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`,
        group: 'Actions',
        keywords: 'theme dark light appearance',
        icon: theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />,
        run: () => {
          toggle()
          onOpenChange(false)
        },
      },
      {
        id: 'email',
        label: 'Send an email',
        hint: SITE.email,
        group: 'Actions',
        keywords: 'contact mail hire',
        icon: <Mail size={16} />,
        run: () => {
          onOpenChange(false)
          window.location.href = `mailto:${SITE.email}`
        },
      },
      {
        id: 'download-cv',
        label: 'Download résumé (PDF)',
        group: 'Actions',
        keywords: 'cv resume pdf download',
        icon: <FileText size={16} />,
        run: () => {
          onOpenChange(false)
          window.open(SITE.resumePath, '_blank', 'noopener')
        },
      },
    ]
  }, [navigate, onOpenChange, theme, toggle])

  const results = useMemo(() => {
    if (!query.trim()) return items
    return items
      .map((item) => {
        const haystack = `${item.label} ${item.hint ?? ''} ${item.keywords ?? ''}`
        const score = fuzzyScore(query.trim(), haystack)
        return score === null ? null : { item, score }
      })
      .filter((r): r is { item: Item; score: number } => r !== null)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.item)
  }, [items, query])

  const grouped = useMemo(() => {
    const map = new Map<string, Item[]>()
    for (const item of results) {
      const list = map.get(item.group) ?? []
      list.push(item)
      map.set(item.group, list)
    }
    return [...map.entries()]
  }, [results])

  // Global ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        onOpenChange(!open)
      }
      if (e.key === 'Escape' && open) onOpenChange(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      // Focus after the entrance animation has started, so it doesn't jump.
      const t = setTimeout(() => inputRef.current?.focus(), 40)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => setActive(0), [query])

  // Keep the highlighted row in view during keyboard navigation.
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({
      block: 'nearest',
    })
  }, [active])

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (i + 1) % Math.max(results.length, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (i - 1 + results.length) % Math.max(results.length, 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      results[active]?.run()
    }
  }

  let flatIndex = -1

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          data-no-print
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]"
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <div className="bg-bg/70 absolute inset-0 backdrop-blur-md" onClick={() => onOpenChange(false)} />

          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="glass border-line-strong relative w-full max-w-xl overflow-hidden rounded-2xl shadow-[var(--shadow-lift)]"
            onKeyDown={onKeyDown}
          >
            <div className="border-line flex items-center gap-3 border-b px-4">
              <Search size={17} className="text-subtle shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages, projects, demos…"
                aria-label="Search"
                className="text-ink placeholder:text-subtle h-14 flex-1 bg-transparent text-[0.9375rem] outline-none"
              />
              <kbd className="border-line text-subtle hidden rounded border px-1.5 py-0.5 font-mono text-[0.625rem] sm:block">
                ESC
              </kbd>
            </div>

            <div ref={listRef} className="max-h-[52vh] overflow-y-auto overscroll-contain p-2">
              {results.length === 0 && (
                <p className="text-subtle px-3 py-10 text-center text-sm">
                  No matches for “{query}”.
                </p>
              )}

              {grouped.map(([group, groupItems]) => (
                <div key={group} className="mb-1">
                  <p className="text-subtle px-3 pt-2 pb-1 font-mono text-[0.625rem] tracking-[0.16em] uppercase">
                    {group}
                  </p>
                  {groupItems.map((item) => {
                    flatIndex++
                    const isActive = flatIndex === active
                    const myIndex = flatIndex
                    return (
                      <button
                        key={item.id}
                        data-active={isActive}
                        onMouseEnter={() => setActive(myIndex)}
                        onClick={item.run}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                          isActive ? 'bg-surface-2 text-ink' : 'text-muted'
                        )}
                      >
                        <span className={cn('shrink-0', isActive ? 'text-accent' : 'text-subtle')}>
                          {item.icon}
                        </span>
                        <span className="flex-1 truncate text-sm font-medium">{item.label}</span>
                        {item.hint && (
                          <span className="text-subtle hidden truncate text-xs sm:block">
                            {item.hint}
                          </span>
                        )}
                        {isActive ? (
                          <CornerDownLeft size={13} className="text-subtle shrink-0" />
                        ) : (
                          <ArrowRight size={13} className="shrink-0 opacity-0" />
                        )}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>

            <div className="border-line text-subtle flex items-center justify-between border-t px-4 py-2.5 text-[0.6875rem]">
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="border-line rounded border px-1 font-mono">↑</kbd>
                  <kbd className="border-line rounded border px-1 font-mono">↓</kbd> navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="border-line rounded border px-1 font-mono">↵</kbd> open
                </span>
              </span>
              <span className="font-mono">{results.length} results</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
