import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowUpRight, CircleCheck, Play, Sparkles, TriangleAlert } from 'lucide-react'
import { Seo, breadcrumbJsonLd } from '@/lib/seo'
import { PROJECTS } from '@/data/projects'
import { findSkillGroup } from '@/data/skills'
import { GlassCard, SectionHeading } from '@/components/ui/Surfaces'
import { Reveal } from '@/components/ui/Reveal'
import { LinkButton } from '@/components/ui/Button'
import { ProjectCard } from '@/components/ui/ProjectCard'

const PIPELINE = [
  {
    stage: 'Ingest',
    title: 'Structure-aware chunking',
    detail:
      'Split on headings and sections, not a fixed token window. Carry the heading path into each chunk as metadata so “the limit is 500 per hour” is never ambiguous.',
    failure: 'Fixed 512-token splits that cut sentences in half.',
  },
  {
    stage: 'Index',
    title: 'Hybrid index',
    detail:
      'A vector index for paraphrase and a BM25 index for exact terms. Error codes, part numbers and proper nouns are precisely where embeddings blur.',
    failure: 'Vector-only search returning E-4012 when you asked about E-4021.',
  },
  {
    stage: 'Retrieve',
    title: 'Fuse, then rerank',
    detail:
      'Reciprocal rank fusion merges both rankings with no weight to tune. Retrieve ~30 candidates cheaply, then a cross-encoder scores query and document together to pick the best five.',
    failure: 'Trusting a bi-encoder top-5 that never saw query and document together.',
  },
  {
    stage: 'Generate',
    title: 'Cite or stay quiet',
    detail:
      'Every claim must map to a retrieved chunk. Structured citation output makes that checkable rather than aspirational.',
    failure: 'A confident paragraph blending retrieved facts with pretraining.',
  },
  {
    stage: 'Verify',
    title: 'Grounding gate',
    detail:
      'An entailment check runs before the answer reaches the user. Below threshold it is suppressed and escalated — the system says “I don’t know” instead of guessing.',
    failure: 'Shipping the answer with a “may be inaccurate” disclaimer nobody reads.',
  },
  {
    stage: 'Evaluate',
    title: 'Golden set, every change',
    detail:
      '500 real questions with known answers and expected sources. Retrieval and generation measured separately. No prompt ships without a measured delta.',
    failure: 'Changing a prompt because the new one “felt better” in three manual tests.',
  },
]

const CAPABILITIES = [
  {
    title: 'Retrieval-Augmented Generation',
    detail:
      'Hybrid retrieval, cross-encoder reranking, citation enforcement and grounding verification. The full pipeline, not a vector store with a prompt on top.',
    proof: 'aria-support-agent',
  },
  {
    title: 'Document Intelligence',
    detail:
      'OCR and transformer-based extraction from scans, photos and faxes. Image preprocessing, per-field confidence, and business-rule validation beyond schema checks.',
    proof: 'sentinel-docs',
  },
  {
    title: 'Agents & Tool Use',
    detail:
      'Models that call your functions, with the guardrails that matter: idempotent tools, approval gates on destructive actions, and bounded loops.',
  },
  {
    title: 'Fine-tuning & Adaptation',
    detail:
      'LoRA and full fine-tunes when prompting genuinely is not enough — plus the honest assessment of when it is not worth it.',
    proof: 'sentinel-docs',
  },
  {
    title: 'Evaluation & Observability',
    detail:
      'Golden sets, regression gating, retrieval metrics separated from generation metrics, and per-request tracing so failures are diagnosable.',
  },
  {
    title: 'Cost & Latency Engineering',
    detail:
      'Prompt caching on stable context, model routing by task difficulty, streaming for perceived speed, and token budgets that hold under load.',
  },
]

const HONEST_TAKES = [
  {
    claim: 'Bigger model, better answers',
    reality:
      'Usually a retrieval problem. If the right passage was never retrieved, a smarter model just writes a more articulate wrong answer.',
  },
  {
    claim: 'Add AI to everything',
    reality:
      'A deterministic rule beats a model whenever the rule exists. I will tell you when the answer is a database query rather than an LLM.',
  },
  {
    claim: 'The demo works, ship it',
    reality:
      'Demos run on happy-path questions. Production runs on typos, ambiguity and adversarial users. That gap is most of the work.',
  },
  {
    claim: 'Fine-tune it',
    reality:
      'Usually the expensive answer to a prompting or retrieval question. Worth it for format and tone, rarely for knowledge.',
  },
]

export default function AI() {
  const aiSkills = findSkillGroup('ai')
  const aiProjects = PROJECTS.filter((p) => p.category === 'AI & Machine Learning')

  return (
    <>
      <Seo
        title="AI Engineering"
        description="Production LLM systems: retrieval-augmented generation, document intelligence, agents and tool use, fine-tuning, evaluation harnesses and cost engineering. MSc in Artificial Intelligence."
        path="/ai"
        keywords={[
          'AI engineer',
          'LLM engineer',
          'RAG',
          'retrieval augmented generation',
          'AI consultant',
          'machine learning engineer',
          'Claude API',
          'vector database',
          'prompt engineering',
        ]}
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'AI Engineering', path: '/ai' },
        ])}
      />

      {/* ------------------------------------------------------------ hero */}
      <section className="container-page pt-32 pb-16 lg:pt-40">
        <Reveal>
          <span className="glass border-cyan/25 text-cyan mb-7 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium">
            <Sparkles size={13} />
            AI Engineering
          </span>
          <h1 className="max-w-4xl text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.02]">
            Anyone can call an API.
            <br />
            <span className="text-gradient">Making it trustworthy</span> is the job.
          </h1>
          <p className="text-muted mt-8 max-w-2xl text-lg leading-relaxed">
            I hold an MSc in Artificial Intelligence and I ship LLM systems that real users depend
            on. The interesting problems are not in the model call — they are in retrieval quality,
            grounding, evaluation and the cost curve at scale.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-9 flex flex-wrap gap-3">
            <LinkButton to="/demos/aria-ai" icon={<Play size={15} className="fill-current" />}>
              Try the RAG demo
            </LinkButton>
            <LinkButton to="/work/aria-support-agent" variant="secondary">
              Read the case study
            </LinkButton>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="border-line mt-14 grid gap-6 border-t pt-10 sm:grid-cols-4">
            {[
              { v: '61%', l: 'Support tickets deflected', s: 'Aria support agent' },
              { v: '97.2%', l: 'Extraction accuracy', s: 'Sentinel document AI' },
              { v: '23pts', l: 'Accuracy from hybrid retrieval', s: 'over vector-only search' },
              { v: 'MSc', l: 'Artificial Intelligence', s: 'Iqra University' },
            ].map((s) => (
              <div key={s.l}>
                <p className="font-display text-gradient text-3xl leading-none font-bold sm:text-4xl">
                  {s.v}
                </p>
                <p className="text-ink mt-2 text-sm">{s.l}</p>
                <p className="text-subtle mt-0.5 text-xs">{s.s}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* -------------------------------------------------------- pipeline */}
      <section className="container-page section-y border-line border-t">
        <Reveal>
          <SectionHeading
            eyebrow="The pipeline"
            title={
              <>
                Six stages, and what <span className="text-gradient">goes wrong</span> at each
              </>
            }
            description="Most RAG systems that disappoint are failing at one of these, and it is almost never the last one."
            className="mb-12 max-w-3xl"
          />
        </Reveal>

        <div className="flex flex-col gap-4">
          {PIPELINE.map((p, i) => (
            <Reveal key={p.stage} delay={Math.min(i * 0.04, 0.16)}>
              <GlassCard
                interactive
                className="grid gap-6 p-6 lg:grid-cols-[7rem_1fr_1fr] lg:items-start lg:gap-10 lg:p-8"
              >
                <div className="flex items-center gap-3 lg:flex-col lg:items-start lg:gap-2">
                  <span className="text-subtle font-mono text-xs">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="border-cyan/25 bg-cyan/10 text-cyan rounded-full border px-3 py-1 font-mono text-xs">
                    {p.stage}
                  </span>
                </div>

                <div>
                  <h3 className="text-ink text-lg leading-snug">{p.title}</h3>
                  <p className="text-muted mt-2.5 text-sm leading-relaxed">{p.detail}</p>
                </div>

                <div className="border-line lg:border-l lg:pl-8">
                  <p className="text-subtle mb-2 inline-flex items-center gap-1.5 font-mono text-[0.625rem] tracking-[0.16em] uppercase">
                    <TriangleAlert size={11} />
                    Common failure
                  </p>
                  <p className="text-muted text-sm leading-relaxed">{p.failure}</p>
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------- capabilities */}
      <section className="container-page section-y border-line border-t">
        <Reveal>
          <SectionHeading
            eyebrow="Capabilities"
            title="What I actually build"
            className="mb-12 max-w-3xl"
          />
        </Reveal>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.05}>
              <GlassCard interactive spotlight className="flex h-full flex-col p-6 lg:p-7">
                <h3 className="text-ink text-lg leading-snug">{c.title}</h3>
                <p className="text-muted mt-3 flex-1 text-sm leading-relaxed">{c.detail}</p>
                {c.proof && (
                  <Link
                    to={`/work/${c.proof}`}
                    className="text-cyan border-line group mt-5 inline-flex items-center gap-1.5 border-t pt-4 text-xs transition-colors hover:underline"
                  >
                    See it in production
                    <ArrowUpRight
                      size={12}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                )}
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------- honest takes */}
      <section className="container-page section-y border-line border-t">
        <Reveal>
          <SectionHeading
            eyebrow="Straight answers"
            title={
              <>
                Four things I'll tell you that{' '}
                <span className="text-gradient">an AI vendor won't</span>
              </>
            }
            className="mb-12 max-w-3xl"
          />
        </Reveal>

        <div className="grid gap-4 md:grid-cols-2">
          {HONEST_TAKES.map((t, i) => (
            <Reveal key={t.claim} delay={i * 0.05}>
              <div className="border-line h-full rounded-xl border p-6">
                <p className="text-subtle text-sm line-through decoration-1">“{t.claim}”</p>
                <p className="text-muted mt-3 leading-relaxed">{t.reality}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- toolset */}
      {aiSkills && (
        <section className="container-page section-y border-line border-t">
          <Reveal>
            <SectionHeading eyebrow="Toolset" title="The stack" className="mb-10 max-w-3xl" />
          </Reveal>
          <Reveal delay={0.05}>
            <ul className="flex flex-wrap gap-2">
              {aiSkills.skills.map((s, i) => (
                <motion.li
                  key={s.name}
                  initial={{ opacity: 0, scale: 0.94 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(i * 0.02, 0.3), duration: 0.35 }}
                  className="border-line bg-surface-2 text-muted flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                >
                  <CircleCheck size={13} className="text-cyan shrink-0" />
                  {s.name}
                </motion.li>
              ))}
            </ul>
          </Reveal>
        </section>
      )}

      {/* -------------------------------------------------- AI case studies */}
      <section className="container-page section-y border-line border-t">
        <Reveal>
          <SectionHeading
            eyebrow="In production"
            title="AI case studies"
            description="Two systems handling real volume, with the architecture and the numbers written up."
            className="mb-12 max-w-3xl"
          />
        </Reveal>
        <div className="grid gap-5 lg:grid-cols-2">
          {aiProjects.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.06}>
              <ProjectCard project={p} className="h-full" />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- CTA */}
      <section className="container-page pb-8">
        <Reveal>
          <GlassCard
            ring
            className="flex flex-col items-start justify-between gap-6 p-8 sm:flex-row sm:items-center lg:p-12"
          >
            <div>
              <h2 className="text-2xl sm:text-3xl">Have an AI problem worth solving?</h2>
              <p className="text-muted mt-3 max-w-xl leading-relaxed">
                Bring me the version you already tried and could not get working. Those are the
                interesting ones — and I will tell you honestly if a model is the wrong tool.
              </p>
            </div>
            <LinkButton to="/contact" size="lg" icon={<ArrowUpRight size={18} />}>
              Let's talk
            </LinkButton>
          </GlassCard>
        </Reveal>
      </section>
    </>
  )
}
