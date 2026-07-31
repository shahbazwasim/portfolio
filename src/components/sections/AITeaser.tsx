import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowUpRight, Sparkles } from 'lucide-react'
import { GlassCard } from '@/components/ui/Surfaces'
import { Reveal } from '@/components/ui/Reveal'
import { LinkButton } from '@/components/ui/Button'

const PIPELINE = [
  { step: 'Chunk', detail: 'Structure-aware splitting' },
  { step: 'Embed', detail: 'Vector + BM25 index' },
  { step: 'Retrieve', detail: 'Hybrid search, top-k' },
  { step: 'Rerank', detail: 'Cross-encoder precision' },
  { step: 'Generate', detail: 'Grounded, cited answer' },
  { step: 'Verify', detail: 'Suppress if unsupported' },
]

const CAPABILITIES = [
  'RAG architecture',
  'Agents & tool use',
  'Fine-tuning & LoRA',
  'Vector databases',
  'Document intelligence',
  'Computer vision',
  'LLM evaluation',
  'Prompt engineering',
]

export function AITeaser() {
  return (
    <section className="relative section-y overflow-hidden">
      {/* Local aurora wash so this band reads as its own space */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(70% 60% at 50% 0%, color-mix(in oklab, var(--accent-cyan) 12%, transparent), transparent 70%)',
        }}
      />

      <div className="container-page">
        <Reveal>
          <div className="mx-auto mb-12 flex max-w-3xl flex-col items-center gap-5 text-center">
            <span className="glass border-cyan/25 text-cyan inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium">
              <Sparkles size={13} />
              AI Engineering
            </span>
            <h2 className="text-3xl leading-[1.1] sm:text-4xl lg:text-5xl">
              Most AI demos work. <span className="text-gradient">Production is the hard part.</span>
            </h2>
            <p className="text-muted text-base leading-relaxed sm:text-lg">
              I build LLM systems with the parts that get skipped: retrieval that actually finds the
              right context, grounding checks that suppress confident nonsense, and an evaluation
              harness so you know a change helped instead of hoping it did.
            </p>
          </div>
        </Reveal>

        {/* Pipeline */}
        <Reveal delay={0.06}>
          <GlassCard className="overflow-hidden p-6 lg:p-8">
            <p className="text-subtle mb-6 font-mono text-xs tracking-[0.18em] uppercase">
              A production RAG pipeline
            </p>
            <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6 lg:gap-2">
              {PIPELINE.map((p, i) => (
                <motion.li
                  key={p.step}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="relative"
                >
                  <div className="border-line bg-surface-2/60 h-full rounded-xl border p-4">
                    <span className="text-subtle font-mono text-[0.625rem]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="text-ink mt-1 font-medium">{p.step}</p>
                    <p className="text-subtle mt-1 text-xs leading-snug">{p.detail}</p>
                  </div>
                  {i < PIPELINE.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="via-cyan/40 absolute top-1/2 -right-1 hidden h-px w-2 bg-gradient-to-r from-transparent to-transparent lg:block"
                    />
                  )}
                </motion.li>
              ))}
            </ol>
          </GlassCard>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <Reveal delay={0.1}>
            <ul className="flex flex-wrap gap-2">
              {CAPABILITIES.map((c) => (
                <li
                  key={c}
                  className="border-line bg-surface-2 text-muted rounded-full border px-3.5 py-1.5 text-sm"
                >
                  {c}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.14}>
            <div className="flex flex-wrap gap-3">
              <LinkButton to="/ai" icon={<ArrowUpRight size={17} />}>
                Explore AI expertise
              </LinkButton>
              <Link
                to="/demos/aria-ai"
                className="border-line text-muted hover:text-ink hover:border-line-strong inline-flex h-11 items-center rounded-full border px-6 text-[0.9375rem] font-medium transition-colors"
              >
                Try the RAG demo
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
