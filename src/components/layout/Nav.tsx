import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Menu, Moon, Search, Sun, X } from 'lucide-react'
import { NAV_LINKS, SITE } from '@/data/site'
import { useTheme } from '@/lib/theme'
import { cn } from '@/lib/cn'
import { LinkButton } from '@/components/ui/Button'

function Wordmark() {
  return (
    // No aria-label: the visible name and role already form a good accessible
    // name, and an override that omits the visible text fails
    // label-content-name-mismatch for speech-input users.
    <Link to="/" className="group flex items-center gap-2.5">
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-[linear-gradient(135deg,var(--accent-cyan),var(--accent-violet))] text-sm font-bold text-white shadow-[0_4px_16px_-4px_var(--glow)] transition-transform duration-300 group-hover:scale-105">
        SW
      </span>
      <span className="hidden flex-col leading-none sm:flex">
        <span className="font-display text-ink text-[0.9375rem] font-semibold tracking-tight">
          {SITE.name}
        </span>
        <span className="text-subtle mt-0.5 font-mono text-[0.625rem] tracking-widest uppercase">
          {SITE.role}
        </span>
      </span>
    </Link>
  )
}

export function Nav({ onOpenPalette }: { onOpenPalette: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { theme, toggle } = useTheme()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile sheet on navigation.
  useEffect(() => setOpen(false), [location.pathname])

  // Lock body scroll while the sheet is open.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <>
      <a
        href="#main"
        className="focus:bg-surface-2 focus:text-ink focus:border-line sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:border focus:px-5 focus:py-2.5 focus:text-sm"
      >
        Skip to content
      </a>

      <header
        data-no-print
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-500',
          scrolled ? 'py-2' : 'py-4'
        )}
      >
        <div className="container-page">
          <nav
            className={cn(
              'flex items-center justify-between rounded-full transition-all duration-500',
              scrolled
                ? 'glass border-line px-3 py-2 shadow-[var(--shadow-card)]'
                : 'border border-transparent px-1 py-2'
            )}
          >
            <Wordmark />

            <ul className="hidden items-center gap-1 lg:flex">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <NavLink
                    to={link.href}
                    className={({ isActive }) =>
                      cn(
                        'relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200',
                        isActive ? 'text-ink' : 'text-muted hover:text-ink'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.span
                            layoutId="nav-active"
                            className="bg-surface-2 border-line absolute inset-0 -z-10 rounded-full border"
                            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                          />
                        )}
                        {link.label}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenPalette}
                aria-label="Open command palette"
                title="Search  (Ctrl K)"
                className="text-muted hover:text-ink hover:bg-surface-2 hidden h-9 items-center gap-2 rounded-full px-3 text-sm transition-colors sm:flex"
              >
                <Search size={15} strokeWidth={2} />
                <kbd className="border-line bg-surface-2 text-subtle rounded border px-1.5 py-0.5 font-mono text-[0.625rem]">
                  ⌘K
                </kbd>
              </button>

              <button
                onClick={toggle}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                className="text-muted hover:text-ink hover:bg-surface-2 grid h-9 w-9 place-items-center rounded-full transition-colors"
              >
                {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              </button>

              <LinkButton to="/contact" size="sm" className="hidden md:inline-flex">
                Let's talk
              </LinkButton>

              <button
                onClick={() => setOpen((v) => !v)}
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
                className="text-ink hover:bg-surface-2 grid h-9 w-9 place-items-center rounded-full transition-colors lg:hidden"
              >
                {open ? <X size={19} /> : <Menu size={19} />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div
              className="bg-bg/80 absolute inset-0 backdrop-blur-xl"
              onClick={() => setOpen(false)}
            />
            <motion.nav
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="container-page relative flex h-full flex-col justify-center gap-1 pt-20 pb-10"
            >
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i + 0.05, duration: 0.35 }}
                >
                  <NavLink
                    to={link.href}
                    className={({ isActive }) =>
                      cn(
                        'font-display border-line block border-b py-4 text-3xl font-semibold transition-colors',
                        isActive ? 'text-gradient' : 'text-ink'
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.34 }}
                className="mt-8 flex flex-col gap-3"
              >
                <LinkButton to="/contact" size="lg" className="w-full">
                  Start a project
                </LinkButton>
                <LinkButton to="/resume" variant="secondary" size="lg" className="w-full">
                  View résumé
                </LinkButton>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
