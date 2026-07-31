import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, House } from 'lucide-react'
import { Seo } from '@/lib/seo'
import { NAV_LINKS } from '@/data/site'
import { LinkButton } from '@/components/ui/Button'
import { Aurora } from '@/components/ui/Aurora'

export default function NotFound() {
  const { pathname } = useLocation()

  return (
    <>
      <Seo title="Page not found" path="/404" noIndex />

      <section className="relative flex min-h-[85svh] items-center overflow-hidden">
        <Aurora intensity="vivid" />

        <div className="container-page relative text-center">
          <p className="font-display text-[clamp(6rem,22vw,16rem)] leading-none font-bold">
            <span className="text-gradient">404</span>
          </p>

          <h1 className="mt-2 text-2xl sm:text-3xl">This page doesn't exist</h1>

          <p className="text-muted mx-auto mt-4 max-w-md leading-relaxed">
            Nothing lives at{' '}
            <code className="border-line bg-surface-2 text-subtle rounded border px-1.5 py-0.5 font-mono text-sm">
              {pathname}
            </code>
            . It may have moved, or the link may have been mistyped.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <LinkButton to="/" size="lg" icon={<House size={17} />}>
              Back home
            </LinkButton>
            <button
              onClick={() => window.history.back()}
              className="border-line text-muted hover:text-ink hover:border-line-strong inline-flex h-13 items-center gap-2 rounded-full border px-8 text-base font-medium transition-colors"
            >
              <ArrowLeft size={17} />
              Go back
            </button>
          </div>

          <nav aria-label="Site sections" className="mt-14">
            <p className="text-subtle mb-4 font-mono text-xs tracking-[0.18em] uppercase">
              Or try one of these
            </p>
            <ul className="flex flex-wrap items-center justify-center gap-2">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    to={l.href}
                    className="glass border-line text-muted hover:text-ink hover:border-line-strong rounded-full px-4 py-2 text-sm transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>
    </>
  )
}
