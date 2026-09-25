/**
 * Minimal Verse syntax highlighter for the case-study source excerpts.
 *
 * Not a parser — one pass of sticky regexes per line, leaning on Verse's own
 * naming conventions to classify identifiers: snake_case names are types, and
 * PascalCase names followed by `(`, `[` or a specifier are calls. That holds
 * for idiomatic Verse, which is all the excerpts contain, and it keeps a
 * grammar dependency out of the bundle.
 */

export type TokenKind =
  | 'plain'
  | 'keyword'
  | 'type'
  | 'fn'
  | 'string'
  | 'number'
  | 'comment'
  | 'spec'
  | 'punct'

export type Token = { kind: TokenKind; text: string }

const KEYWORDS = new Set([
  'using', 'class', 'struct', 'enum', 'interface', 'module', 'var', 'set',
  'if', 'then', 'else', 'for', 'loop', 'break', 'return', 'case', 'block',
  'and', 'or', 'not', 'spawn', 'race', 'rush', 'sync', 'branch', 'defer',
  'self', 'super', 'option', 'array', 'map', 'true', 'false', 'external',
])

type Rule = [TokenKind | 'ident', RegExp]

const RULES: Rule[] = [
  ['comment', /#.*/y],
  ['string', /"(?:[^"\\]|\\.)*"/y],
  // Module paths in `using` — /Fortnite.com/Devices
  ['string', /\/[A-Za-z][\w.]*(?:\/[A-Za-z][\w.]*)*/y],
  // Attributes and effect specifiers — @editable, <suspends>, <transacts>
  ['spec', /@[A-Za-z_]\w*|<[a-z_]+>/y],
  ['number', /\d+(?:\.\d+)?/y],
  ['ident', /[A-Za-z_]\w*/y],
  ['plain', /\s+/y],
  ['punct', /:=|[-+*/=<>!?:,.;()[\]{}]/y],
]

function classify(word: string, next: string): TokenKind {
  if (KEYWORDS.has(word)) return 'keyword'
  if (/^[a-z]/.test(word)) return 'type'
  if (next === '(' || next === '[' || next === '<') return 'fn'
  return 'plain'
}

/** Tokenises source into lines of tokens, merging runs of the same kind. */
export function tokenizeVerse(source: string): Token[][] {
  return source.split(/\r?\n/).map((line) => {
    const tokens: Token[] = []
    const push = (kind: TokenKind, text: string) => {
      const last = tokens[tokens.length - 1]
      if (last && last.kind === kind) last.text += text
      else tokens.push({ kind, text })
    }

    let i = 0
    while (i < line.length) {
      let matched = false
      for (const [kind, re] of RULES) {
        re.lastIndex = i
        const m = re.exec(line)
        if (!m) continue
        const text = m[0]
        push(kind === 'ident' ? classify(text, line[i + text.length] ?? '') : kind, text)
        i += text.length
        matched = true
        break
      }
      if (!matched) {
        push('plain', line[i])
        i++
      }
    }
    return tokens
  })
}
