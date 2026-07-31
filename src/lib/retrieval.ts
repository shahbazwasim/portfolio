/**
 * A small but genuine retrieval engine, running entirely client-side.
 *
 * It is not a mock: documents are tokenised and stemmed, an inverse-document-
 * frequency table is built once at module load, and queries are scored with
 * BM25 (lexical) and cosine similarity over TF-IDF vectors (semantic-ish),
 * fused by reciprocal rank. The same architecture as a server-side pipeline,
 * minus the neural embedding model — which is exactly the part you cannot run
 * for free in a browser.
 *
 * Answers below `GROUNDING_THRESHOLD` are refused rather than guessed, which
 * is the behaviour the demo is there to illustrate.
 */

import { KNOWLEDGE, type Chunk } from '@/data/knowledge'

/* ------------------------------------------------------------------ config */

const K1 = 1.5 // BM25 term-frequency saturation
const B = 0.75 // BM25 length normalisation
export const GROUNDING_THRESHOLD = 0.12

const STOPWORDS = new Set(
  'a an the and or but if then than that this these those is are was were be been being am do does did doing have has had having i you he she it we they me him her them my your his its our their of in on at to for with about as by from into over under again further once here there all any both each few more most other some such no nor not only own same so too very can will just should now what which who whom how when where why do you your'.split(
    ' '
  )
)

/** Crude suffix stripper — enough to unify "building"/"builds"/"built"-ish forms. */
function stem(word: string): string {
  if (word.length <= 3) return word
  return word
    .replace(/(ational|tional|ization|iveness|fulness|ousness)$/, '')
    .replace(/(ements?|ations?|ingly|edly)$/, '')
    .replace(/(ing|ers?|est|ies|ied|ly)$/, '')
    .replace(/(es|s)$/, '')
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .split(/[\s\-.]+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
    .map(stem)
}

/* ------------------------------------------------------------------- index */

type Indexed = {
  chunk: Chunk
  tokens: string[]
  tf: Map<string, number>
  length: number
}

function buildIndex(chunks: Chunk[]) {
  const docs: Indexed[] = chunks.map((chunk) => {
    // Keywords are repeated so an explicit synonym outweighs an incidental
    // body-text mention of the same term.
    const surface = `${chunk.title} ${chunk.text} ${chunk.keywords.join(' ')} ${chunk.keywords.join(' ')}`
    const tokens = tokenize(surface)
    const tf = new Map<string, number>()
    for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1)
    return { chunk, tokens, tf, length: tokens.length }
  })

  const df = new Map<string, number>()
  for (const doc of docs) {
    for (const term of new Set(doc.tokens)) df.set(term, (df.get(term) ?? 0) + 1)
  }

  const N = docs.length
  const idf = new Map<string, number>()
  for (const [term, count] of df) {
    // Smoothed IDF, floored so a term present everywhere still scores > 0.
    idf.set(term, Math.max(Math.log((N - count + 0.5) / (count + 0.5) + 1), 0.05))
  }

  const avgLength = docs.reduce((sum, d) => sum + d.length, 0) / N

  // Pre-compute L2-normalised TF-IDF vectors for cosine scoring.
  const vectors = docs.map((doc) => {
    const vec = new Map<string, number>()
    let norm = 0
    for (const [term, freq] of doc.tf) {
      const w = (1 + Math.log(freq)) * (idf.get(term) ?? 0)
      vec.set(term, w)
      norm += w * w
    }
    norm = Math.sqrt(norm) || 1
    for (const [term, w] of vec) vec.set(term, w / norm)
    return vec
  })

  return { docs, idf, avgLength, vectors }
}

const INDEX = buildIndex(KNOWLEDGE)

/* ------------------------------------------------------------------ scoring */

function bm25(queryTokens: string[], docIndex: number): number {
  const doc = INDEX.docs[docIndex]
  let score = 0
  for (const term of queryTokens) {
    const freq = doc.tf.get(term)
    if (!freq) continue
    const idf = INDEX.idf.get(term) ?? 0
    const denom = freq + K1 * (1 - B + (B * doc.length) / INDEX.avgLength)
    score += idf * ((freq * (K1 + 1)) / denom)
  }
  return score
}

function cosine(queryTokens: string[], docIndex: number): number {
  const qtf = new Map<string, number>()
  for (const t of queryTokens) qtf.set(t, (qtf.get(t) ?? 0) + 1)

  let norm = 0
  const qvec = new Map<string, number>()
  for (const [term, freq] of qtf) {
    const w = (1 + Math.log(freq)) * (INDEX.idf.get(term) ?? 0)
    qvec.set(term, w)
    norm += w * w
  }
  norm = Math.sqrt(norm) || 1

  const dvec = INDEX.vectors[docIndex]
  let dot = 0
  for (const [term, w] of qvec) {
    const dw = dvec.get(term)
    if (dw) dot += (w / norm) * dw
  }
  return dot
}

export type RetrievalMode = 'keyword' | 'semantic' | 'hybrid'

export type ScoredChunk = {
  chunk: Chunk
  score: number
  bm25: number
  cosine: number
  /** Query terms this chunk actually contains — shown in the inspector. */
  matchedTerms: string[]
}

/**
 * Rank the knowledge base against a query.
 * `hybrid` fuses the two rankings with reciprocal rank fusion, which needs no
 * weight tuning and is robust when the two scorers disagree.
 */
export function retrieve(query: string, mode: RetrievalMode = 'hybrid', topK = 4): ScoredChunk[] {
  const qTokens = tokenize(query)
  if (qTokens.length === 0) return []

  const rows = INDEX.docs.map((doc, i) => ({
    i,
    chunk: doc.chunk,
    bm25: bm25(qTokens, i),
    cosine: cosine(qTokens, i),
    matchedTerms: [...new Set(qTokens)].filter((t) => doc.tf.has(t)),
  }))

  let ranked: ScoredChunk[]

  if (mode === 'keyword') {
    const max = Math.max(...rows.map((r) => r.bm25), 1e-6)
    ranked = rows.map((r) => ({ ...r, score: r.bm25 / max }))
  } else if (mode === 'semantic') {
    ranked = rows.map((r) => ({ ...r, score: r.cosine }))
  } else {
    const RRF_K = 20
    const byBm25 = [...rows].sort((a, b) => b.bm25 - a.bm25).map((r) => r.i)
    const byCos = [...rows].sort((a, b) => b.cosine - a.cosine).map((r) => r.i)
    const rankOf = (order: number[], i: number) => order.indexOf(i) + 1

    const fused = rows.map((r) => ({
      ...r,
      raw: 1 / (RRF_K + rankOf(byBm25, r.i)) + 1 / (RRF_K + rankOf(byCos, r.i)),
    }))
    // Normalise so the top result sits near 1 and the threshold is meaningful.
    const max = Math.max(...fused.map((f) => f.raw), 1e-6)
    ranked = fused.map((f) => ({
      chunk: f.chunk,
      bm25: f.bm25,
      cosine: f.cosine,
      matchedTerms: f.matchedTerms,
      // A fused rank means nothing if the chunk shares no terms with the query.
      score: f.matchedTerms.length === 0 ? 0 : (f.raw / max) * Math.min(1, f.cosine * 3 + 0.35),
    }))
  }

  return ranked
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
}

/* ----------------------------------------------------------------- answering */

export type Answer = {
  text: string
  sources: ScoredChunk[]
  grounded: boolean
  confidence: number
}

/**
 * Compose an answer from retrieved chunks.
 *
 * With no generation model in the browser, this stitches the retrieved source
 * text rather than paraphrasing it — which has a useful property: the answer
 * is *always* verbatim from the corpus, so it cannot hallucinate at all.
 */
export function answer(query: string, mode: RetrievalMode = 'hybrid'): Answer {
  const sources = retrieve(query, mode, 3)
  const top = sources[0]

  if (!top || top.score < GROUNDING_THRESHOLD) {
    return {
      text: "I don't have anything in my knowledge base that answers that. I only know about Shahbaz's experience, skills, projects and availability — ask me about those, or use the contact form and he'll answer directly.",
      sources: [],
      grounded: false,
      confidence: top?.score ?? 0,
    }
  }

  // A clearly dominant match answers alone; a close second gets appended.
  const second = sources[1]
  const useSecond = second && second.score > top.score * 0.72 && second.score > GROUNDING_THRESHOLD

  const parts = [top.chunk.text]
  if (useSecond) parts.push(second.chunk.text)

  return {
    text: parts.join('\n\n'),
    sources: useSecond ? [top, second] : [top],
    grounded: true,
    confidence: top.score,
  }
}
