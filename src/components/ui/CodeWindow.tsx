import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Check, Copy, FileCode } from 'lucide-react'
import type { CodeExcerpt } from '@/data/projects'
import { tokenizeVerse, type Token, type TokenKind } from '@/lib/verse-highlight'
import { cn } from '@/lib/cn'

const TONE: Record<Exclude<TokenKind, 'plain'>, string> = {
  keyword: 'text-code-keyword',
  type: 'text-code-type',
  fn: 'text-code-fn',
  string: 'text-code-string',
  number: 'text-code-number',
  comment: 'text-code-comment italic',
  spec: 'text-code-spec',
  punct: 'text-code-punct',
}

/**
 * Flattens tokenised lines into one run, joining lines with newline text and
 * merging neighbouring plain text. Plain text renders as bare text nodes, so
 * only coloured tokens cost a DOM element — an excerpt stays a few hundred
 * nodes lighter than a span-per-token rendering.
 */
function flatten(lines: Token[][]): Token[] {
  const out: Token[] = []
  const push = (t: Token) => {
    const last = out[out.length - 1]
    if (last && last.kind === 'plain' && t.kind === 'plain') last.text += t.text
    else out.push({ ...t })
  }
  lines.forEach((tokens, i) => {
    if (i > 0) push({ kind: 'plain', text: '\n' })
    tokens.forEach(push)
  })
  return out
}

/** Read-only source viewer: file tab, line numbers, highlighting, copy. */
export function CodeWindow({ code, className }: { code: CodeExcerpt; className?: string }) {
  const { segments, gutter } = useMemo(() => {
    const lines = tokenizeVerse(code.source)
    return {
      segments: flatten(lines),
      gutter: lines.map((_, i) => i + 1).join('\n'),
    }
  }, [code.source])

  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code.source)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard access can be denied (permissions, insecure origin); the
      // code is still selectable, so there is nothing to recover here.
    }
  }

  return (
    <div className={cn('border-line bg-surface-2/60 overflow-hidden rounded-xl border', className)}>
      <div className="border-line flex items-center gap-3 border-b px-4 py-2.5">
        <span className="flex shrink-0 gap-1.5" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-red-400/50" />
          <span className="h-2 w-2 rounded-full bg-amber-400/50" />
          <span className="h-2 w-2 rounded-full bg-emerald-400/50" />
        </span>
        <span className="text-muted inline-flex min-w-0 items-center gap-1.5 font-mono text-xs">
          <FileCode size={13} className="text-cyan shrink-0" aria-hidden="true" />
          <span className="truncate">{code.file}</span>
        </span>
        <button
          type="button"
          onClick={copy}
          className="text-subtle hover:text-ink ml-auto inline-flex shrink-0 items-center gap-1.5 font-mono text-[0.6875rem] transition-colors"
          aria-label={copied ? 'Copied to clipboard' : `Copy ${code.file}`}
        >
          {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* The gutter sits outside the scroller, so line numbers stay put while
          long lines scroll — and never end up in a text selection. */}
      <div className="flex py-4 font-mono text-[0.75rem] leading-6 sm:text-[0.8125rem]">
        <span
          aria-hidden="true"
          className="text-subtle/70 w-12 shrink-0 pr-4 text-right whitespace-pre tabular-nums select-none"
        >
          {gutter}
        </span>
        <pre className="min-w-0 flex-1 overflow-x-auto pr-6">
          <code className="text-code-plain">
            {segments.map((s, i) =>
              s.kind === 'plain' ? (
                <Fragment key={i}>{s.text}</Fragment>
              ) : (
                <span key={i} className={TONE[s.kind]}>
                  {s.text}
                </span>
              )
            )}
          </code>
        </pre>
      </div>
    </div>
  )
}
