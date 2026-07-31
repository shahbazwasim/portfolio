import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import {
  Braces,
  Database,
  FileText,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from 'lucide-react'
import { KNOWLEDGE, SUGGESTED_QUESTIONS } from '@/data/knowledge'
import {
  GROUNDING_THRESHOLD,
  answer,
  retrieve,
  type Answer,
  type RetrievalMode,
  type ScoredChunk,
} from '@/lib/retrieval'
import { DemoChrome } from '@/demos/shared/DemoChrome'
import { cn } from '@/lib/cn'

const MODES: { id: RetrievalMode; label: string; blurb: string }[] = [
  { id: 'keyword', label: 'Keyword (BM25)', blurb: 'Exact term matching. Great for IDs, blind to paraphrase.' },
  { id: 'semantic', label: 'Semantic (TF-IDF cosine)', blurb: 'Catches paraphrase, blurs similar identifiers.' },
  { id: 'hybrid', label: 'Hybrid (RRF)', blurb: 'Fuses both rankings. What production systems use.' },
]

type Turn = { question: string; result: Answer; sources: ScoredChunk[]; mode: RetrievalMode }

/* -------------------------------------------------------------------------- */
/* Pipeline inspector                                                         */
/* -------------------------------------------------------------------------- */

function ScoreBar({ value, tone }: { value: number; tone: string }) {
  return (
    <div className="bg-surface-3 h-1.5 w-full overflow-hidden rounded-full">
      <motion.div
        className={cn('h-full rounded-full', tone)}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(value * 100, 100)}%` }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  )
}

function Inspector({
  query,
  mode,
  scored,
}: {
  query: string
  mode: RetrievalMode
  scored: ScoredChunk[]
}) {
  if (!query) {
    return (
      <div className="text-subtle grid h-full place-items-center p-6 text-center text-xs">
        <div>
          <Braces size={22} className="mx-auto mb-3 opacity-40" />
          Ask a question to watch the retrieval pipeline score every chunk.
        </div>
      </div>
    )
  }

  const top = scored[0]
  const grounded = top && top.score >= GROUNDING_THRESHOLD

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Stage 1 — query */}
      <div>
        <p className="text-subtle mb-2 font-mono text-[0.625rem] tracking-[0.16em] uppercase">
          1 · Query
        </p>
        <p className="border-line bg-surface-2 text-muted rounded-lg border px-3 py-2 font-mono text-xs">
          {query}
        </p>
      </div>

      {/* Stage 2 — retrieval */}
      <div>
        <p className="text-subtle mb-2 font-mono text-[0.625rem] tracking-[0.16em] uppercase">
          2 · Retrieve · {MODES.find((m) => m.id === mode)!.label}
        </p>
        <div className="flex flex-col gap-2.5">
          {scored.length === 0 && (
            <p className="text-subtle text-xs">No chunk shares any term with this query.</p>
          )}
          {scored.map((s, i) => (
            <motion.div
              key={s.chunk.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className={cn(
                'rounded-lg border p-2.5',
                i === 0 && grounded ? 'border-cyan/40 bg-cyan/5' : 'border-line bg-surface-2/50'
              )}
            >
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-ink truncate text-[0.6875rem] font-medium">
                  {s.chunk.section}
                </span>
                <span
                  className={cn(
                    'shrink-0 font-mono text-[0.625rem]',
                    i === 0 && grounded ? 'text-cyan' : 'text-subtle'
                  )}
                >
                  {s.score.toFixed(3)}
                </span>
              </div>
              <ScoreBar
                value={s.score}
                tone={i === 0 && grounded ? 'bg-cyan' : 'bg-surface-3'}
              />
              <div className="mt-2 flex flex-wrap gap-1">
                {s.matchedTerms.slice(0, 6).map((t) => (
                  <span
                    key={t}
                    className="border-line text-subtle rounded border px-1 py-px font-mono text-[0.5625rem]"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="text-subtle mt-2 flex gap-3 font-mono text-[0.5625rem]">
                <span>bm25 {s.bm25.toFixed(2)}</span>
                <span>cos {s.cosine.toFixed(3)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stage 3 — grounding gate */}
      <div>
        <p className="text-subtle mb-2 font-mono text-[0.625rem] tracking-[0.16em] uppercase">
          3 · Grounding gate
        </p>
        <div
          className={cn(
            'flex items-start gap-2.5 rounded-lg border p-3 text-xs leading-relaxed',
            grounded
              ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400'
              : 'border-amber-500/30 bg-amber-500/5 text-amber-400'
          )}
        >
          {grounded ? (
            <ShieldCheck size={14} className="mt-px shrink-0" />
          ) : (
            <TriangleAlert size={14} className="mt-px shrink-0" />
          )}
          <span>
            Top score {(top?.score ?? 0).toFixed(3)} vs threshold {GROUNDING_THRESHOLD} —{' '}
            {grounded
              ? 'answer released with citations.'
              : 'below threshold, so the answer is suppressed and the visitor is referred to the contact form.'}
          </span>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Root                                                                       */
/* -------------------------------------------------------------------------- */

export default function AriaDemo() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<RetrievalMode>('hybrid')
  const [turns, setTurns] = useState<Turn[]>([])
  const [inspecting, setInspecting] = useState<{ query: string; mode: RetrievalMode } | null>(null)
  const [tab, setTab] = useState<'inspector' | 'corpus'>('inspector')

  const scored = useMemo(
    () => (inspecting ? retrieve(inspecting.query, inspecting.mode, 5) : []),
    [inspecting]
  )

  function ask(q: string) {
    const question = q.trim()
    if (!question) return
    const result = answer(question, mode)
    setTurns((prev) => [
      ...prev,
      { question, result, sources: result.sources, mode },
    ])
    setInspecting({ query: question, mode })
    setTab('inspector')
    setInput('')
  }

  /** Re-run the last question under a different retrieval mode. */
  function rerun(nextMode: RetrievalMode) {
    setMode(nextMode)
    const last = turns[turns.length - 1]
    if (!last) return
    const result = answer(last.question, nextMode)
    setTurns((prev) => [...prev, { question: last.question, result, sources: result.sources, mode: nextMode }])
    setInspecting({ query: last.question, mode: nextMode })
  }

  return (
    <DemoChrome
      title="Aria"
      subtitle="retrieval-augmented assistant"
      onReset={() => {
        setTurns([])
        setInspecting(null)
        setInput('')
      }}
    >
      {/* Mode selector */}
      <div className="border-line flex flex-wrap items-center gap-2 border-b px-4 py-2.5">
        <span className="text-subtle mr-1 font-mono text-[0.625rem] tracking-widest uppercase">
          Retrieval
        </span>
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => rerun(m.id)}
            title={m.blurb}
            className={cn(
              'rounded-lg border px-2.5 py-1 text-[0.6875rem] transition-colors',
              mode === m.id
                ? 'border-cyan/50 bg-cyan/10 text-cyan'
                : 'border-line text-subtle hover:text-ink'
            )}
          >
            {m.label}
          </button>
        ))}
        <span className="text-subtle ml-auto hidden text-[0.625rem] lg:block">
          {MODES.find((m) => m.id === mode)!.blurb}
        </span>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px]">
        {/* Chat */}
        <div className="border-line flex min-h-[460px] flex-col lg:border-r">
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            <div className="bg-surface-2 border-line text-muted rounded-2xl rounded-tl-sm border px-4 py-3 text-sm leading-relaxed">
              I answer only from a curated knowledge base about Shahbaz — no external model, no API
              key, running entirely in your browser. Try something outside my corpus and watch the
              grounding gate refuse rather than guess.
            </div>

            {turns.map((t, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-end">
                  <p className="max-w-[80%] rounded-2xl rounded-tr-sm bg-[linear-gradient(120deg,var(--accent-cyan),var(--accent-violet))] px-4 py-2.5 text-sm text-white">
                    {t.question}
                  </p>
                </div>
                <div className="space-y-2">
                  <div
                    className={cn(
                      'rounded-2xl rounded-tl-sm border px-4 py-3 text-sm leading-relaxed whitespace-pre-line',
                      t.result.grounded
                        ? 'border-line bg-surface-2 text-muted'
                        : 'border-amber-500/30 bg-amber-500/5 text-amber-200/90'
                    )}
                  >
                    {t.result.text}
                  </div>
                  {t.result.grounded && (
                    <div className="flex flex-wrap gap-1.5 pl-1">
                      {t.sources.map((s) => (
                        <span
                          key={s.chunk.id}
                          className="border-line text-subtle inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[0.625rem]"
                        >
                          <FileText size={9} />
                          {s.chunk.section}
                          <span className="font-mono opacity-60">{s.score.toFixed(2)}</span>
                        </span>
                      ))}
                      <span className="text-subtle inline-flex items-center gap-1 px-1 py-1 font-mono text-[0.625rem]">
                        via {t.mode}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {turns.length === 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-subtle font-mono text-[0.625rem] tracking-widest uppercase">
                  Try asking
                </p>
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => ask(q)}
                    className="border-line text-muted hover:text-ink hover:border-line-strong hover:bg-surface-2 block w-full rounded-lg border px-3 py-2 text-left text-xs transition-colors"
                  >
                    {q}
                  </button>
                ))}
                <button
                  onClick={() => ask('What is the capital of Peru?')}
                  className="block w-full rounded-lg border border-amber-500/30 px-3 py-2 text-left text-xs text-amber-400/90 transition-colors hover:bg-amber-500/5"
                >
                  What is the capital of Peru? <span className="opacity-60">— watch it refuse</span>
                </button>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              ask(input)
            }}
            className="border-line flex items-center gap-2 border-t p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about experience, skills, availability…"
              aria-label="Ask a question"
              className="border-line bg-surface-2/60 text-ink placeholder:text-subtle h-10 flex-1 rounded-xl border px-3.5 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--accent-violet)]"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send"
              className={cn(
                'grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-all',
                input.trim()
                  ? 'bg-[linear-gradient(120deg,var(--accent-cyan),var(--accent-violet))] text-white'
                  : 'bg-surface-2 text-subtle cursor-not-allowed'
              )}
            >
              <Send size={15} />
            </button>
          </form>
        </div>

        {/* Inspector / corpus */}
        <aside className="flex min-h-[460px] flex-col">
          <div className="border-line flex border-b">
            {(
              [
                ['inspector', 'Pipeline', Braces],
                ['corpus', `Corpus (${KNOWLEDGE.length})`, Database],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs transition-colors',
                  tab === id
                    ? 'text-ink border-cyan border-b-2'
                    : 'text-subtle hover:text-ink border-b-2 border-transparent'
                )}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {tab === 'inspector' ? (
              <Inspector
                query={inspecting?.query ?? ''}
                mode={inspecting?.mode ?? mode}
                scored={scored}
              />
            ) : (
              <div className="flex flex-col gap-2 p-4">
                <p className="text-subtle mb-1 text-xs leading-relaxed">
                  The complete corpus. The assistant cannot say anything that is not in here — which
                  is what makes hallucination structurally impossible rather than merely unlikely.
                </p>
                {KNOWLEDGE.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setInput(c.title)
                      setTab('inspector')
                    }}
                    className="border-line bg-surface-2/40 hover:border-line-strong rounded-lg border p-2.5 text-left transition-colors"
                  >
                    <p className="text-ink text-[0.6875rem] font-medium">{c.title}</p>
                    <p className="text-subtle mt-0.5 font-mono text-[0.5625rem]">{c.section}</p>
                    <p className="text-subtle mt-1.5 line-clamp-2 text-[0.625rem] leading-relaxed">
                      {c.text}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Footnote */}
      <div className="border-line text-subtle flex flex-wrap items-center gap-x-4 gap-y-1 border-t px-4 py-2.5 text-[0.625rem]">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles size={10} /> {KNOWLEDGE.length} chunks indexed
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Search size={10} /> BM25 + TF-IDF cosine, fused by reciprocal rank
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck size={10} /> grounding threshold {GROUNDING_THRESHOLD}
        </span>
        <span className="ml-auto hidden sm:inline">0 network requests</span>
      </div>
    </DemoChrome>
  )
}
