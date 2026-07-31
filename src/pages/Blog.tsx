import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Clock } from 'lucide-react'
import { Seo, breadcrumbJsonLd } from '@/lib/seo'
import { POSTS, POST_CATEGORIES, formatPostDate } from '@/data/posts'
import { GlassCard } from '@/components/ui/Surfaces'
import { Reveal } from '@/components/ui/Reveal'
import { cn } from '@/lib/cn'

export default function Blog() {
  const [category, setCategory] = useState<(typeof POST_CATEGORIES)[number]>('All')

  const posts = useMemo(
    () =>
      [...POSTS]
        .filter((p) => category === 'All' || p.category === category)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [category]
  )

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of POSTS) map.set(p.category, (map.get(p.category) ?? 0) + 1)
    return map
  }, [])

  return (
    <>
      <Seo
        title="Blog"
        description="Writing on AI engineering, architecture decisions and performance work — including why RAG systems hallucinate, when to build a custom CRM, and the real cost of Shopify apps."
        path="/blog"
        keywords={['RAG', 'AI engineering blog', 'CRM architecture', 'Shopify performance']}
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
        ])}
      />

      <section className="container-page pt-32 pb-10 lg:pt-40">
        <Reveal>
          <span className="text-subtle font-mono text-xs tracking-[0.2em] uppercase">Writing</span>
          <h1 className="mt-5 max-w-4xl text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.02]">
            Things worth
            <br />
            <span className="text-gradient">writing down.</span>
          </h1>
          <p className="text-muted mt-7 max-w-2xl text-lg leading-relaxed">
            Long-form notes on problems I have actually hit — mostly about why the obvious fix was
            the wrong one.
          </p>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="mt-9 flex flex-wrap gap-2">
            {POST_CATEGORIES.map((c) => {
              const n = c === 'All' ? POSTS.length : (counts.get(c) ?? 0)
              if (n === 0) return null
              const active = c === category
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  aria-pressed={active}
                  className={cn(
                    'rounded-full border px-3.5 py-1.5 text-sm transition-all duration-200',
                    active
                      ? 'border-transparent bg-[linear-gradient(120deg,var(--accent-cyan),var(--accent-violet))] font-medium text-white'
                      : 'border-line text-muted hover:text-ink hover:border-line-strong'
                  )}
                >
                  {c}
                  <span className={cn('ml-1.5 text-xs', active ? 'text-white/70' : 'text-subtle')}>
                    {n}
                  </span>
                </button>
              )
            })}
          </div>
        </Reveal>
      </section>

      <section className="container-page pb-24">
        <div className="flex flex-col gap-4">
          {posts.map((post, i) => (
            <Reveal key={post.slug} delay={Math.min(i * 0.05, 0.2)}>
              <Link to={`/blog/${post.slug}`} className="block">
                <GlassCard interactive spotlight className="group p-6 lg:p-8">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="text-subtle mb-3 flex flex-wrap items-center gap-3 text-xs">
                        <span className="border-violet/25 bg-violet/10 text-violet rounded-full border px-2.5 py-0.5">
                          {post.category}
                        </span>
                        <span>{formatPostDate(post.date)}</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock size={11} />
                          {post.readingMinutes} min read
                        </span>
                      </div>

                      <h2 className="text-ink text-xl leading-snug sm:text-2xl">{post.title}</h2>
                      <p className="text-muted mt-3 max-w-3xl leading-relaxed">{post.excerpt}</p>

                      <ul className="mt-4 flex flex-wrap gap-1.5">
                        {post.tags.map((t) => (
                          <li
                            key={t}
                            className="border-line bg-surface-2 text-subtle rounded-md border px-2 py-0.5 font-mono text-[0.6875rem]"
                          >
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <span className="border-line text-muted group-hover:border-transparent group-hover:bg-[linear-gradient(120deg,var(--accent-cyan),var(--accent-violet))] grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-all duration-300 group-hover:text-white">
                      <ArrowUpRight size={18} />
                    </span>
                  </div>
                </GlassCard>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  )
}
