/**
 * Blog content as structured blocks rather than MDX.
 *
 * Trade-off: MDX buys arbitrary JSX inside prose but drags in a compiler,
 * a Rollup plugin and a second syntax to maintain. For long-form technical
 * writing, a typed block union prerenders cleanly, keeps every post styleable
 * from one renderer, and makes malformed content a type error instead of a
 * runtime surprise.
 */

export type Block =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'code'; lang: string; code: string; caption?: string }
  | { type: 'quote'; text: string; cite?: string }
  | { type: 'callout'; tone: 'info' | 'warn' | 'success'; title: string; text: string }
  | { type: 'divider' }

export type Post = {
  slug: string
  title: string
  excerpt: string
  date: string
  readingMinutes: number
  tags: string[]
  category: 'AI' | 'Architecture' | 'Performance' | 'Engineering'
  featured?: boolean
  body: Block[]
}

export const POSTS: Post[] = [
  /* ------------------------------------------------------------------ */
  {
    slug: 'why-your-rag-system-hallucinates',
    title: "Why your RAG system hallucinates (and it usually isn't the model)",
    excerpt:
      'Teams reach for a bigger model when answers go wrong. Nine times out of ten the retrieval layer handed the model the wrong context and it did its best with it.',
    date: '2026-05-18',
    readingMinutes: 9,
    tags: ['RAG', 'LLM', 'Retrieval', 'Evaluation'],
    category: 'AI',
    featured: true,
    body: [
      {
        type: 'p',
        text: 'The first thing most teams do when their retrieval-augmented assistant gives a wrong answer is upgrade the model. It is the most visible knob, and it feels like the part doing the thinking. It is also almost never where the problem is.',
      },
      {
        type: 'p',
        text: 'A language model answering from retrieved context is doing reading comprehension. If the retrieved passages do not contain the answer, no amount of model capability fixes that — you have asked someone to summarise a document that was never handed to them. They will produce something plausible, because that is what the task demands.',
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'The diagnostic that takes ten minutes',
        text: 'Before touching prompts or models, log the retrieved chunks for every wrong answer and read them yourself. If you cannot answer the question from those chunks, it is a retrieval bug. In my experience that is the majority of them.',
      },
      { type: 'h2', text: 'Fixed-size chunking throws away the structure' },
      {
        type: 'p',
        text: 'The default in nearly every tutorial is to split documents every 512 tokens with some overlap. It is easy, and it is why so many systems retrieve fragments that begin mid-sentence and end before the answer.',
      },
      {
        type: 'p',
        text: 'Documents have structure — headings, sections, table rows, list items — and that structure encodes meaning the author put there deliberately. Splitting on it rather than on a token count keeps semantically complete units together.',
      },
      {
        type: 'code',
        lang: 'python',
        caption: 'Chunk on document structure, then merge undersized neighbours.',
        code: `def chunk_by_structure(doc, target=800, floor=200):
    """Split on headings/sections, then coalesce fragments that are too
    small to be independently meaningful."""
    sections = split_on_headings(doc)      # respects h1..h4 hierarchy
    chunks, buffer = [], ""

    for section in sections:
        if len(buffer) + len(section) <= target:
            buffer += section
            continue
        if buffer:
            chunks.append(buffer)
        # Oversized sections still need splitting, but on paragraph
        # boundaries rather than a blind token offset.
        buffer = section if len(section) <= target else ""
        if len(section) > target:
            chunks.extend(split_on_paragraphs(section, target))

    if len(buffer) >= floor:
        chunks.append(buffer)
    return chunks`,
      },
      {
        type: 'p',
        text: 'Carrying the heading path into each chunk as metadata matters too. A chunk that reads "the limit is 500 per hour" is ambiguous; the same chunk labelled "API Reference → Rate Limits → Enterprise tier" is not.',
      },
      { type: 'h2', text: 'Pure vector search misses exact terms' },
      {
        type: 'p',
        text: 'Embeddings capture meaning, which is exactly why they blur the difference between similar-sounding identifiers. Ask about error code E-4021 and a vector index will happily return the section on E-4012, because in embedding space those are nearly the same string.',
      },
      {
        type: 'p',
        text: 'Keyword search has the opposite failure: it is literal-minded and misses paraphrase entirely. Run both and fuse the rankings, and each covers the other\'s blind spot.',
      },
      {
        type: 'ul',
        items: [
          'BM25 catches exact identifiers, error codes, part numbers and proper nouns',
          'Vector search catches paraphrase and conceptual similarity',
          'Reciprocal rank fusion merges the two lists without tuning a weight by hand',
          'A cross-encoder rerank over the top ~30 then does the precision work properly',
        ],
      },
      {
        type: 'p',
        text: 'On the support-agent project this pattern lifted answer accuracy 23 percentage points over vector-only retrieval. The generation prompt did not change at all.',
      },
      { type: 'h2', text: 'Retrieve wide, rerank hard' },
      {
        type: 'p',
        text: 'Bi-encoders — the models producing your embeddings — encode the query and document separately, which is what makes them fast enough to index millions of chunks. It is also what limits their precision: they never see the query and document together.',
      },
      {
        type: 'p',
        text: 'A cross-encoder does see both at once and scores the pair directly. It is far too slow to run over a whole corpus, and perfectly fast over thirty candidates. Retrieve 30 with the cheap method, rerank to the best 5 with the expensive one.',
      },
      { type: 'h2', text: 'Make the model prove it read the sources' },
      {
        type: 'p',
        text: 'Even with good retrieval, a model will occasionally blend a retrieved fact with something from pretraining. The fix is structural rather than a matter of prompt wording: require every claim to cite a chunk, then verify the citations before the answer reaches the user.',
      },
      {
        type: 'code',
        lang: 'python',
        caption: 'Answers that fail grounding are suppressed, not shown with a caveat.',
        code: `def verify_grounding(answer, retrieved_chunks, threshold=0.8):
    claims = extract_claims(answer)
    grounded = 0

    for claim in claims:
        cited = retrieved_chunks.get(claim.citation_id)
        if cited and entails(cited.text, claim.text):
            grounded += 1

    ratio = grounded / max(len(claims), 1)
    if ratio < threshold:
        # Escalate rather than hedge. A confident wrong answer costs
        # far more trust than an honest "I don't know".
        raise InsufficientGrounding(ratio=ratio)
    return answer`,
      },
      {
        type: 'quote',
        text: 'An assistant that says "I don\'t know" 15% of the time and is right the rest is worth more than one that always answers and is right 85% of the time. Users can work with the first. They stop trusting the second entirely.',
      },
      { type: 'h2', text: 'You cannot improve what you do not measure' },
      {
        type: 'p',
        text: 'The single biggest difference between RAG systems that improve and ones that plateau is whether the team has an evaluation set. Without one, every prompt change is a vibe, and regressions ship silently because nobody tested the twelve questions that used to work.',
      },
      {
        type: 'ol',
        items: [
          'Collect 200–500 real questions from actual users, not questions you imagined',
          'Write the correct answer and the sources it should cite for each',
          'Measure retrieval and generation separately — recall@k, then answer accuracy',
          'Run the whole set on every prompt, chunking or index change',
          'Refuse to ship a change that regresses the suite, however good the demo looked',
        ],
      },
      {
        type: 'callout',
        tone: 'success',
        title: 'Where to start tomorrow',
        text: 'Take twenty answers your system got wrong last week and read the retrieved chunks for each. Then fix chunking, add hybrid search, and add a reranker — in that order. Only after all three should you consider a different model.',
      },
      { type: 'divider' },
      {
        type: 'p',
        text: 'Bigger models genuinely help with reasoning over retrieved context, and there are problems only a more capable model solves. But if the context is wrong, a better model just gives you a more articulate wrong answer — and those are harder to catch.',
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'custom-crm-vs-off-the-shelf',
    title: 'Custom CRM vs off-the-shelf: a decision framework that survives contact with reality',
    excerpt:
      'Most teams choose wrong in both directions. Here is the question that actually decides it, and the honest cost of each answer.',
    date: '2026-04-02',
    readingMinutes: 8,
    tags: ['CRM', 'Architecture', 'Product'],
    category: 'Architecture',
    featured: true,
    body: [
      {
        type: 'p',
        text: 'Two failure modes, equally common. A ten-person startup builds a bespoke CRM and spends eight months rebuilding Pipedrive badly. A 300-person operation with genuinely unusual processes buys an enterprise CRM and spends two years and a seven-figure budget customising it into something nobody wants to use.',
      },
      {
        type: 'p',
        text: 'The decision is not about company size or budget. It is about one thing.',
      },
      {
        type: 'quote',
        text: 'Is your sales process a competitive advantage, or is it just the way you happen to do it?',
      },
      {
        type: 'p',
        text: 'If the process is genuinely differentiated — if how you qualify, quote and close is part of why you win — then software that forces you into a generic pipeline is actively expensive. If your process is ordinary and you have simply never written it down, buying is almost always correct, and the adoption pain you are anticipating is really the pain of finally standardising.',
      },
      { type: 'h2', text: 'Buy when these are true' },
      {
        type: 'ul',
        items: [
          'Your process maps onto lead → opportunity → quote → close without contortion',
          'Fewer than ~50 users, and no per-field permission requirements',
          'Integrations you need are on the vendor\'s marketplace already',
          'You have no engineer who can own the system for its whole life',
          'Time-to-value matters more than fit — you need something on Monday',
        ],
      },
      {
        type: 'p',
        text: 'The honest cost of buying is not the licence fee. It is that your process bends toward the tool over time, and that data portability is worse than the sales engineer implied. Both are usually acceptable. Know that you are accepting them.',
      },
      { type: 'h2', text: 'Build when these are true' },
      {
        type: 'ul',
        items: [
          'Your pricing, quoting or approval logic is genuinely unusual and central to the business',
          'You are paying for three or more overlapping tools that disagree with each other',
          'Permission requirements go below record level — specific fields, specific roles',
          'The CRM must be the system of record that other systems read from',
          'Per-seat costs at your headcount exceed the amortised cost of a build',
        ],
      },
      {
        type: 'callout',
        tone: 'warn',
        title: 'The cost nobody budgets for',
        text: 'A custom CRM is not a project, it is a product with an indefinite maintenance commitment. Budget 15–20% of the build cost annually, forever. If that number is unacceptable, you have your answer and you have saved yourself eight months.',
      },
      { type: 'h2', text: 'The middle path most teams miss' },
      {
        type: 'p',
        text: 'The framing is usually presented as binary, and it is not. Keep a standard CRM for the parts that are standard — contacts, activity logging, email sync, the commodity 80% — and build only the differentiated slice, integrated through the API.',
      },
      {
        type: 'p',
        text: 'A distributor I worked with kept HubSpot for the top of the funnel and built exactly one custom service: a quoting engine encoding contract pricing, volume breaks and approval chains that no CRM models natively. Four months instead of fourteen, and the maintenance surface is one service rather than an entire platform.',
      },
      { type: 'h2', text: 'If you do build, model the process you have' },
      {
        type: 'p',
        text: 'The most common technical mistake in a custom build is copying the stage model from the tool being replaced — the one everyone complained about. Spend two weeks watching people work before designing the schema. On the Helio project, shadowing reps surfaced a stage model nothing like what the old system enforced, and that discovery was worth more than any architectural decision that followed.',
      },
      {
        type: 'ol',
        items: [
          'Shadow the people who will use it, before writing any schema',
          'Model the process that exists, not the one in the process document',
          'Make the thing people do all day the primary surface — everything else is secondary',
          'Migrate one team or region at a time, with the old system authoritative until each signs off',
          'Instrument adoption from day one; usage tells you where the design fights the work',
        ],
      },
      {
        type: 'callout',
        tone: 'success',
        title: 'A cheap way to find out',
        text: 'Before committing to either path, write down your sales process as it actually happens — every stage, every exception, every approval. Then open a trial of a mainstream CRM and try to model it. Where you get stuck is precisely the surface worth building. Often it is much smaller than expected.',
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'shopify-performance-app-tax',
    title: 'The Shopify app tax: how eleven apps cost three seconds',
    excerpt:
      'Most Shopify performance problems are not theme problems. They are dependency problems, and the fix is deletion rather than optimisation.',
    date: '2026-02-24',
    readingMinutes: 7,
    tags: ['Shopify', 'Performance', 'Core Web Vitals'],
    category: 'Performance',
    body: [
      {
        type: 'p',
        text: 'A storefront came to me with a mobile LCP of 4.1 seconds and a conversion rate the founders described, accurately, as heartbreaking. They had already paid two agencies for "speed optimisation". Both had compressed images and deferred some scripts. Both had moved the number by roughly nothing.',
      },
      {
        type: 'p',
        text: 'The theme was fine. Eleven apps were installed, and each had injected its own script tag into every page.',
      },
      { type: 'h2', text: 'What an app actually costs' },
      {
        type: 'p',
        text: 'An app that adds a "customers also bought" widget does not cost you a widget. Typically it costs a render-blocking script from a third-party domain, its own copy of a framework, a synchronous API call before it renders, a stylesheet, and a DNS lookup plus TLS handshake to a host with no relationship to your CDN.',
      },
      {
        type: 'p',
        text: 'Individually each is 200–400ms on mobile. Eleven of them do not add up linearly — they contend for the same limited connections and the same single main thread.',
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'Measure before you theorise',
        text: 'Open the Network panel, sort by domain, and count the third-party origins on a product page. If it is more than three, the apps are the story and no amount of theme tuning will change that.',
      },
      { type: 'h2', text: 'The audit' },
      {
        type: 'p',
        text: 'For each installed app, three questions in order:',
      },
      {
        type: 'ol',
        items: [
          'Does anyone use the feature? Check the analytics rather than asking. Roughly a third of apps on a typical store were installed for an experiment that concluded and never uninstalled.',
          'Is it worth its weight? A review widget that adds 600ms had better be measurably lifting conversion by more than the 600ms is costing.',
          'Could this be a few hundred lines of first-party code? Very often yes — and first-party code ships with your bundle, on your CDN, with no extra connection.',
        ],
      },
      {
        type: 'p',
        text: 'On the Lumina build, eleven apps became three. Eight were replaced with code that lives in the theme, loads with everything else, and does exactly what the store needs rather than what a general-purpose app supports.',
      },
      { type: 'h2', text: 'What survived, and why' },
      {
        type: 'ul',
        items: [
          'Reviews — genuine third-party value, moderation and verified-buyer logic worth outsourcing. Deferred below the fold and lazy-mounted on scroll.',
          'Analytics — one tool, not four. Three of the four were reporting the same events into dashboards nobody opened.',
          'Subscriptions — deep billing integration, correctly not something to rebuild.',
        ],
      },
      {
        type: 'p',
        text: 'Everything else — announcement bars, size guides, recently-viewed, wishlist, currency switcher, upsell widgets, cookie banner, live chat — became first-party code totalling under 12KB gzipped combined.',
      },
      { type: 'h2', text: 'The part nobody looks at' },
      {
        type: 'p',
        text: 'Once the third-party scripts were gone, the remaining LCP was an oversized hero image with no dimensions set. Two lines of fix, worth 400ms and a CLS of 0.00 through launch.',
      },
      {
        type: 'code',
        lang: 'html',
        caption: 'Explicit dimensions and fetchpriority on the LCP image.',
        code: `<img
  src="/hero-1200.avif"
  srcset="/hero-640.avif 640w, /hero-1200.avif 1200w, /hero-1920.avif 1920w"
  sizes="(max-width: 768px) 100vw, 1200px"
  width="1200" height="675"
  fetchpriority="high"
  decoding="async"
  alt="Pendant lighting in a modern kitchen"
/>`,
      },
      {
        type: 'p',
        text: 'Width and height let the browser reserve the space before the image arrives, which is what eliminates layout shift. `fetchpriority="high"` tells it this is the image worth fetching first. Both are trivial and both are routinely missing.',
      },
      { type: 'h2', text: 'The result' },
      {
        type: 'ul',
        items: [
          'Mobile LCP: 4.1s → 1.2s',
          'CLS: 0.24 → 0.00',
          'Third-party requests on a product page: 34 → 6',
          'Conversion rate: +34% over eight weeks',
        ],
      },
      {
        type: 'callout',
        tone: 'warn',
        title: 'Removal beats optimisation',
        text: 'Every hour spent making a third-party script load slightly faster is an hour not spent deleting it. Ask what the store would lose if the app were gone. Surprisingly often the honest answer is nothing.',
      },
      { type: 'divider' },
      {
        type: 'p',
        text: 'The uncomfortable conclusion is that most Shopify performance work is not engineering. It is having the argument about whether the wishlist widget is worth 400 milliseconds — and being willing to lose that argument sometimes, as long as it is made with a number attached.',
      },
    ],
  },
]

export const POST_CATEGORIES = ['All', 'AI', 'Architecture', 'Performance', 'Engineering'] as const

export function getPost(slug: string) {
  return POSTS.find((p) => p.slug === slug)
}

export const FEATURED_POSTS = POSTS.filter((p) => p.featured)

export function formatPostDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
