import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight, FileText, Send, Sparkles, X } from 'lucide-react'
import { SUGGESTED_QUESTIONS } from '@/data/knowledge'
import { answer, type Answer } from '@/lib/retrieval'
import { cn } from '@/lib/cn'

type Message =
  | { role: 'user'; id: string; text: string }
  | { role: 'assistant'; id: string; text: string; result: Answer; streamed: boolean }

const GREETING =
  "Hi — I'm Aria. I answer questions about Shahbaz's experience, skills and availability, using only what's in my knowledge base. If I don't know something, I'll say so."

/** Reveals text progressively so answers feel generated rather than pasted. */
function useTypewriter(full: string, active: boolean, onDone: () => void) {
  const [shown, setShown] = useState(active ? '' : full)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!active) {
      setShown(full)
      return
    }
    if (reduced) {
      setShown(full)
      onDone()
      return
    }
    let i = 0
    setShown('')
    const id = setInterval(() => {
      // Several characters per tick — one-per-tick is too slow for paragraphs.
      i = Math.min(i + 4, full.length)
      setShown(full.slice(0, i))
      if (i >= full.length) {
        clearInterval(id)
        onDone()
      }
    }, 16)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [full, active, reduced])

  return shown
}

function AssistantBubble({
  message,
  onStreamed,
}: {
  message: Extract<Message, { role: 'assistant' }>
  onStreamed: (id: string) => void
}) {
  const text = useTypewriter(message.text, !message.streamed, () => onStreamed(message.id))

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-surface-2 border-line text-muted rounded-2xl rounded-tl-sm border px-4 py-3 text-sm leading-relaxed whitespace-pre-line">
        {text}
        {text.length < message.text.length && (
          <span className="bg-cyan ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse" />
        )}
      </div>

      {message.result.grounded && text.length === message.text.length && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-1.5 pl-1"
        >
          <p className="text-subtle font-mono text-[0.625rem] tracking-wider uppercase">
            Sources · {Math.round(message.result.confidence * 100)}% match
          </p>
          {message.result.sources.map((s) => (
            <div key={s.chunk.id} className="flex items-center gap-2">
              <FileText size={11} className="text-subtle shrink-0" />
              <span className="text-subtle truncate text-[0.6875rem]">{s.chunk.section}</span>
              <span className="border-line text-subtle ml-auto shrink-0 rounded border px-1 font-mono text-[0.5625rem]">
                {s.score.toFixed(2)}
              </span>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

export function AriaDock() {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // The dock is a client-only affordance; rendering it during SSG would put a
  // non-interactive floating button into the prerendered HTML.
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120)
  }, [open])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  function ask(question: string) {
    const q = question.trim()
    if (!q) return
    const result = answer(q)
    setMessages((prev) => [
      ...prev,
      { role: 'user', id: `u${prev.length}`, text: q },
      { role: 'assistant', id: `a${prev.length}`, text: result.text, result, streamed: false },
    ])
    setInput('')
  }

  function markStreamed(id: string) {
    setMessages((prev) =>
      prev.map((m) => (m.role === 'assistant' && m.id === id ? { ...m, streamed: true } : m))
    )
  }

  if (!mounted) return null

  return (
    <>
      {/* Launcher */}
      <AnimatePresence>
        {!open && (
          <motion.button
            data-no-print
            initial={{ opacity: 0, scale: 0.8, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 12 }}
            transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
            onClick={() => setOpen(true)}
            // Must contain the visible label ("Ask me anything" / "Ask AI") so
            // speech input can activate it by what the user can actually read.
            aria-label="Ask me anything — Aria AI assistant"
            className="group fixed right-5 bottom-5 z-[65] flex items-center gap-2.5 rounded-full bg-[linear-gradient(120deg,var(--accent-cyan),var(--accent-violet))] py-3 pr-5 pl-4 text-sm font-medium text-white shadow-[0_8px_32px_-8px_var(--glow)] transition-shadow hover:shadow-[0_12px_40px_-8px_var(--glow)] sm:right-7 sm:bottom-7"
          >
            <Sparkles size={17} />
            <span className="hidden sm:inline">Ask me anything</span>
            <span className="sm:hidden">Ask AI</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            data-no-print
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="Aria assistant"
            className="glass border-line-strong fixed inset-x-4 bottom-4 z-[65] flex max-h-[min(620px,80svh)] flex-col overflow-hidden rounded-2xl shadow-[var(--shadow-lift)] sm:inset-x-auto sm:right-7 sm:bottom-7 sm:w-[400px]"
          >
            {/* Header */}
            <header className="border-line flex items-center gap-3 border-b px-4 py-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[linear-gradient(120deg,var(--accent-cyan),var(--accent-violet))] text-white">
                <Sparkles size={15} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-ink text-sm font-medium">Aria</p>
                <p className="text-subtle truncate text-[0.6875rem]">
                  Retrieval-augmented · runs in your browser
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close assistant"
                className="text-subtle hover:text-ink hover:bg-surface-2 grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </header>

            {/* Transcript */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain p-4">
              <div className="flex flex-col gap-4">
                <div className="bg-surface-2 border-line text-muted rounded-2xl rounded-tl-sm border px-4 py-3 text-sm leading-relaxed">
                  {GREETING}
                </div>

                {messages.map((m) =>
                  m.role === 'user' ? (
                    <div key={m.id} className="flex justify-end">
                      <p className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[linear-gradient(120deg,var(--accent-cyan),var(--accent-violet))] px-4 py-2.5 text-sm text-white">
                        {m.text}
                      </p>
                    </div>
                  ) : (
                    <AssistantBubble key={m.id} message={m} onStreamed={markStreamed} />
                  )
                )}

                {messages.length === 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-subtle font-mono text-[0.625rem] tracking-wider uppercase">
                      Try asking
                    </p>
                    {SUGGESTED_QUESTIONS.slice(0, 4).map((q) => (
                      <button
                        key={q}
                        onClick={() => ask(q)}
                        className="border-line text-muted hover:text-ink hover:border-line-strong hover:bg-surface-2 rounded-xl border px-3.5 py-2.5 text-left text-[0.8125rem] transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Composer */}
            <div className="border-line border-t p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  ask(input)
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about experience, skills, availability…"
                  aria-label="Ask Aria a question"
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
              <Link
                to="/demos/aria-ai"
                className="text-subtle hover:text-ink mt-2.5 flex items-center justify-center gap-1.5 text-[0.6875rem] transition-colors"
              >
                See how the retrieval pipeline works
                <ArrowUpRight size={11} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
