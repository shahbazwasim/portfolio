import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, Clock, Info, Lightbulb, TriangleAlert } from 'lucide-react'
import { Seo, breadcrumbJsonLd } from '@/lib/seo'
import { SITE } from '@/data/site'
import { POSTS, formatPostDate, getPost, type Block } from '@/data/posts'
import { Reveal } from '@/components/ui/Reveal'
import { GlassCard } from '@/components/ui/Surfaces'
import { LinkButton } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

const CALLOUT_TONE = {
  info: { border: 'border-cyan/30', bg: 'bg-cyan/5', text: 'text-cyan', Icon: Info },
  warn: { border: 'border-amber-500/30', bg: 'bg-amber-500/5', text: 'text-amber-400', Icon: TriangleAlert },
  success: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', text: 'text-emerald-400', Icon: Lightbulb },
} as const

/**
 * Very small syntax highlighter.
 *
 * Shiki or Prism would be more accurate, but both are heavy for three code
 * samples on a portfolio. This tokenises comments, strings, numbers and a
 * keyword set — enough to read well without shipping a grammar bundle.
 */
function highlight(code: string, lang: string) {
  const KEYWORDS =
    lang === 'python'
      ? /\b(def|return|if|else|elif|for|while|in|not|and|or|import|from|class|try|except|raise|with|as|None|True|False|lambda)\b/g
      : /\b(const|let|var|function|return|if|else|for|while|import|from|export|default|class|new|await|async|try|catch|throw|type|interface|null|undefined|true|false)\b/g

  return code.split('\n').map((line, i) => {
    const parts: { text: string; cls: string }[] = []
    let rest = line

    // Whole-line comment
    const commentMatch = rest.match(/^(\s*)(#|\/\/)(.*)$/)
    if (commentMatch) {
      return (
        <span key={i} className="text-subtle italic">
          {line}
          {'\n'}
        </span>
      )
    }

    // Tokenise strings first so keywords inside them are not recoloured.
    const stringRe = /("[^"]*"|'[^']*'|`[^`]*`)/g
    let last = 0
    let m: RegExpExecArray | null
    while ((m = stringRe.exec(rest)) !== null) {
      if (m.index > last) parts.push({ text: rest.slice(last, m.index), cls: '' })
      parts.push({ text: m[0], cls: 'text-emerald-400' })
      last = m.index + m[0].length
    }
    if (last < rest.length) parts.push({ text: rest.slice(last), cls: '' })

    return (
      <span key={i}>
        {parts.map((p, j) =>
          p.cls ? (
            <span key={j} className={p.cls}>
              {p.text}
            </span>
          ) : (
            <span
              key={j}
              dangerouslySetInnerHTML={{
                __html: p.text
                  .replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(KEYWORDS, '<span class="text-violet">$1</span>')
                  .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="text-amber-400">$1</span>'),
              }}
            />
          )
        )}
        {'\n'}
      </span>
    )
  })
}

function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case 'h2':
      return <h2 className="text-ink mt-14 mb-1 text-2xl sm:text-3xl">{block.text}</h2>
    case 'h3':
      return <h3 className="text-ink mt-10 mb-1 text-xl">{block.text}</h3>
    case 'p':
      return <p className="text-muted text-[1.0625rem] leading-[1.75]">{block.text}</p>
    case 'ul':
      return (
        <ul className="flex flex-col gap-3">
          {block.items.map((item) => (
            <li key={item} className="text-muted flex gap-3.5 leading-relaxed">
              <span className="from-cyan to-violet mt-[0.7em] h-px w-3.5 shrink-0 bg-gradient-to-r" />
              {item}
            </li>
          ))}
        </ul>
      )
    case 'ol':
      return (
        <ol className="flex flex-col gap-3">
          {block.items.map((item, i) => (
            <li key={item} className="text-muted flex gap-3.5 leading-relaxed">
              <span className="border-line bg-surface-2 text-subtle grid h-6 w-6 shrink-0 place-items-center rounded-full border font-mono text-[0.625rem]">
                {i + 1}
              </span>
              <span className="pt-0.5">{item}</span>
            </li>
          ))}
        </ol>
      )
    case 'quote':
      return (
        <blockquote className="border-violet my-2 border-l-2 pl-6">
          <p className="text-ink text-lg leading-relaxed italic sm:text-xl">{block.text}</p>
          {block.cite && <cite className="text-subtle mt-2 block text-sm not-italic">— {block.cite}</cite>}
        </blockquote>
      )
    case 'code':
      return (
        <figure className="my-2">
          <div className="border-line bg-surface-2/60 overflow-hidden rounded-xl border">
            <div className="border-line text-subtle flex items-center justify-between border-b px-4 py-2 font-mono text-[0.625rem]">
              <span>{block.lang}</span>
              {block.caption && <span className="truncate pl-4">{block.caption}</span>}
            </div>
            <pre className="overflow-x-auto p-4 text-[0.8125rem] leading-relaxed">
              <code className="font-mono">{highlight(block.code, block.lang)}</code>
            </pre>
          </div>
        </figure>
      )
    case 'callout': {
      const tone = CALLOUT_TONE[block.tone]
      return (
        <div className={cn('rounded-xl border p-5', tone.border, tone.bg)}>
          <p className={cn('mb-2 inline-flex items-center gap-2 text-sm font-medium', tone.text)}>
            <tone.Icon size={15} />
            {block.title}
          </p>
          <p className="text-muted text-sm leading-relaxed">{block.text}</p>
        </div>
      )
    }
    case 'divider':
      return <hr className="border-line my-6" />
  }
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getPost(slug) : undefined

  if (!post) return <Navigate to="/404" replace />

  const others = POSTS.filter((p) => p.slug !== post.slug).slice(0, 2)

  return (
    <>
      <Seo
        title={post.title}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
        type="article"
        publishedAt={post.date}
        keywords={post.tags}
        jsonLd={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            datePublished: post.date,
            keywords: post.tags.join(', '),
            author: { '@type': 'Person', name: SITE.name, url: SITE.url },
            publisher: { '@type': 'Person', name: SITE.name },
            mainEntityOfPage: `${SITE.url}/blog/${post.slug}`,
          },
        ]}
      />

      <article className="container-page pt-32 pb-16 lg:pt-40">
        <Reveal>
          <Link
            to="/blog"
            className="text-subtle hover:text-ink group mb-9 inline-flex items-center gap-2 text-sm transition-colors"
          >
            <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
            All writing
          </Link>
        </Reveal>

        <header className="mx-auto max-w-3xl">
          <Reveal>
            <div className="text-subtle mb-5 flex flex-wrap items-center gap-3 text-xs">
              <span className="border-violet/25 bg-violet/10 text-violet rounded-full border px-2.5 py-0.5">
                {post.category}
              </span>
              <span>{formatPostDate(post.date)}</span>
              <span className="inline-flex items-center gap-1">
                <Clock size={11} />
                {post.readingMinutes} min read
              </span>
            </div>

            <h1 className="text-[clamp(2rem,5vw,3.5rem)] leading-[1.06]">{post.title}</h1>
            <p className="text-muted mt-6 text-lg leading-relaxed">{post.excerpt}</p>

            <div className="border-line mt-8 flex items-center gap-3 border-t pt-6">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[linear-gradient(135deg,var(--accent-cyan),var(--accent-violet))] text-xs font-bold text-white">
                SW
              </span>
              <div>
                <p className="text-ink text-sm font-medium">{SITE.name}</p>
                <p className="text-subtle text-xs">{SITE.role}</p>
              </div>
            </div>
          </Reveal>
        </header>

        <div className="mx-auto mt-14 flex max-w-3xl flex-col gap-6">
          {post.body.map((block, i) => (
            <Reveal key={i} delay={0} amount={0.05}>
              <BlockRenderer block={block} />
            </Reveal>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mx-auto mt-16 max-w-3xl">
          <Reveal>
            <GlassCard
              ring
              className="flex flex-col items-start justify-between gap-5 p-7 sm:flex-row sm:items-center"
            >
              <div>
                <h2 className="text-xl">Working on something like this?</h2>
                <p className="text-muted mt-2 max-w-md text-sm leading-relaxed">
                  I take on projects across AI, CRM, commerce and data — and I am happy to give a
                  straight answer on whether it is worth doing at all.
                </p>
              </div>
              <LinkButton to="/contact" icon={<ArrowUpRight size={17} />}>
                Get in touch
              </LinkButton>
            </GlassCard>
          </Reveal>
        </div>
      </article>

      {/* More posts */}
      <section className="container-page section-y border-line border-t">
        <Reveal>
          <h2 className="mb-8 text-2xl sm:text-3xl">Keep reading</h2>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-2">
          {others.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.05}>
              <Link to={`/blog/${p.slug}`} className="block h-full">
                <GlassCard interactive className="group flex h-full flex-col p-6">
                  <div className="text-subtle mb-3 flex items-center gap-3 text-xs">
                    <span className="border-violet/25 bg-violet/10 text-violet rounded-full border px-2.5 py-0.5">
                      {p.category}
                    </span>
                    <span>{p.readingMinutes} min</span>
                  </div>
                  <h3 className="text-ink text-lg leading-snug">{p.title}</h3>
                  <p className="text-muted mt-3 flex-1 text-sm leading-relaxed">{p.excerpt}</p>
                  <span className="text-cyan mt-5 inline-flex items-center gap-1.5 text-sm">
                    Read
                    <ArrowUpRight
                      size={14}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                </GlassCard>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  )
}
