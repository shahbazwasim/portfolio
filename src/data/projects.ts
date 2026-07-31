/**
 * Case studies.
 *
 * Client names are illustrative brands used to frame the work — the
 * engineering, architecture and stack decisions described are the substance.
 * Each entry is pure data: the card and detail templates render from this
 * shape, so adding a project never means touching a component.
 */

export type ProjectCategory =
  | 'AI & Machine Learning'
  | 'CRM & Platforms'
  | 'E-Commerce'
  | 'Data & BI'
  | 'Web Applications'
  | 'Mobile'
  | 'DevOps & Cloud'
  | 'Design Systems'

export type Metric = { label: string; value: string }

export type Project = {
  slug: string
  title: string
  client: string
  clientDescriptor: string
  year: number
  duration: string
  role: string
  category: ProjectCategory
  /** One-line hook for cards and search. */
  summary: string
  featured: boolean
  tech: string[]
  metrics: [Metric, Metric, Metric]
  challenge: string
  approach: { title: string; detail: string }[]
  architecture: { layer: string; detail: string }[]
  highlights: string[]
  outcome: string
  /** Links the case study to a runnable demo in /demos. */
  demoSlug?: string
  screenshots: { caption: string; src?: string }[]
}

export const PROJECTS: Project[] = [
  /* ------------------------------------------------------------------ 1 */
  {
    slug: 'helio-crm',
    title: 'A sales CRM that replaced three tools',
    client: 'Helio Group',
    clientDescriptor: 'B2B logistics group, 240 seats',
    year: 2025,
    duration: '7 months',
    role: 'Lead Full Stack Engineer',
    category: 'CRM & Platforms',
    summary:
      'Custom CRM consolidating pipeline, quoting and post-sale support into one real-time workspace for 240 reps.',
    featured: true,
    tech: ['React', 'TypeScript', 'Node.js', 'NestJS', 'PostgreSQL', 'Redis', 'WebSockets', 'AWS'],
    metrics: [
      { label: 'Faster quote-to-close', value: '42%' },
      { label: 'Tools consolidated', value: '3 → 1' },
      { label: 'Seats in production', value: '240' },
    ],
    challenge:
      'Helio ran sales on a spreadsheet, a legacy ticketing tool and an off-the-shelf CRM nobody trusted. Deal data lived in all three and agreed in none. Reps re-keyed the same quote up to four times, and leadership had no reliable forecast because the pipeline was reconstructed by hand every Monday.',
    approach: [
      {
        title: 'Mapped the real process before writing code',
        detail:
          'Two weeks shadowing reps surfaced a stage model nothing like the one the old CRM enforced. The schema was designed around how Helio actually sells, not how a vendor assumed they should.',
      },
      {
        title: 'Built the pipeline as the primary surface',
        detail:
          'A drag-and-drop board where stage transitions are the write operation — no separate "update the CRM" step. Optimistic updates keep it instant; the server reconciles and broadcasts.',
      },
      {
        title: 'Made collaboration real-time',
        detail:
          'A WebSocket layer over Redis pub/sub pushes deal changes, notes and presence to every open board, so two reps never quietly overwrite each other.',
      },
      {
        title: 'Migrated in slices, not a big bang',
        detail:
          'Read-only mirroring first, then one region at a time. The legacy system stayed authoritative until each region signed off on parity.',
      },
    ],
    architecture: [
      { layer: 'Client', detail: 'React 19 + TypeScript, TanStack Query cache, dnd-kit board, virtualised tables' },
      { layer: 'API', detail: 'NestJS REST + WebSocket gateway, Zod-validated DTOs, row-level permission guards' },
      { layer: 'Data', detail: 'PostgreSQL with partitioned activity log, Redis for pub/sub, presence and rate limiting' },
      { layer: 'Infra', detail: 'ECS Fargate, RDS Multi-AZ, CloudFront, GitHub Actions CI with migration gating' },
    ],
    highlights: [
      'Role-based access down to the field level — commission data visible to managers only',
      'Full audit trail: every stage change, value edit and owner reassignment is replayable',
      'Offline-tolerant board that queues mutations and replays them on reconnect',
      'Forecast engine weighting deals by stage age and historical conversion, not just probability',
      'Bulk operations across 5,000-row selections without freezing the UI',
    ],
    outcome:
      'Quote-to-close time dropped 42% in the first quarter after full rollout. Monday forecast prep went from a half-day of manual reconciliation to a dashboard leadership reads on their phones. Three subscriptions were cancelled outright.',
    demoSlug: 'nexus-crm',
    screenshots: [
      { caption: 'Pipeline board with drag-and-drop stage transitions', src: '/images/projects/helio-crm/01-pipeline.webp' },
      { caption: 'Deal detail drawer with activity timeline', src: '/images/projects/helio-crm/02-deal-detail.webp' },
      { caption: 'Forecast dashboard with stage-weighted projections', src: '/images/projects/helio-crm/03-forecast.webp' },
    ],
  },

  /* ------------------------------------------------------------------ 2 */
  {
    slug: 'aria-support-agent',
    title: 'An AI support agent that deflects 61% of tickets',
    client: 'Aria',
    clientDescriptor: 'SaaS support platform',
    year: 2025,
    duration: '5 months',
    role: 'AI Engineer & Architect',
    category: 'AI & Machine Learning',
    summary:
      'Retrieval-augmented support agent grounded in 40k documents, with citation enforcement and a hard escalation path.',
    featured: true,
    tech: ['Python', 'FastAPI', 'LangChain', 'pgvector', 'Anthropic API', 'Redis', 'React', 'Docker'],
    metrics: [
      { label: 'Tickets deflected', value: '61%' },
      { label: 'First-response time', value: '4h → 8s' },
      { label: 'Answer accuracy', value: '94%' },
    ],
    challenge:
      'Aria\'s support team was drowning: 40,000 pages of product documentation, a four-hour median first response, and the same twelve questions accounting for over half of inbound volume. An earlier off-the-shelf chatbot had been switched off after it confidently invented pricing tiers.',
    approach: [
      {
        title: 'Fixed retrieval before touching generation',
        detail:
          'Most "the AI hallucinates" problems are retrieval problems. Semantic chunking on document structure rather than fixed token windows, hybrid BM25 + vector search, then a cross-encoder rerank over the top 30.',
      },
      {
        title: 'Made citation non-optional',
        detail:
          'Every claim in an answer must map to a retrieved chunk. Responses failing the grounding check are suppressed and escalated rather than shown — the agent says "I don\'t know" instead of guessing.',
      },
      {
        title: 'Escalated on confidence, not on keywords',
        detail:
          'Low retrieval scores, detected frustration and billing or security topics route straight to a human with the full transcript and the documents the agent considered.',
      },
      {
        title: 'Closed the evaluation loop',
        detail:
          'A 500-question golden set runs on every prompt or index change. No prompt ships without a measured delta — that is the difference between engineering and vibes.',
      },
    ],
    architecture: [
      { layer: 'Ingestion', detail: 'Structure-aware chunker, metadata extraction, incremental re-index on doc change' },
      { layer: 'Retrieval', detail: 'pgvector HNSW + BM25 hybrid, cross-encoder rerank, MMR diversity pass' },
      { layer: 'Generation', detail: 'Claude with a cached system prompt, strict citation schema, streamed via SSE' },
      { layer: 'Guardrails', detail: 'Grounding verifier, PII redaction, per-tenant rate limits, full request tracing' },
    ],
    highlights: [
      'Hybrid retrieval lifted answer accuracy 23 points over pure vector search',
      'Prompt caching on the static system context cut per-conversation cost roughly 70%',
      'Streaming responses put first token on screen in under 400ms',
      'Every answer links the exact source paragraphs — support leads audit it like a search engine',
      'Multi-tenant isolation enforced at the retrieval layer, not just the API',
    ],
    outcome:
      '61% of inbound tickets resolved without human involvement within three months. The support team stopped answering the same twelve questions and moved onto the complex work that actually needed them. Median first response fell from four hours to eight seconds.',
    demoSlug: 'aria-ai',
    screenshots: [
      { caption: 'Agent answering with inline source citations', src: '/images/projects/aria-support-agent/01-answer.webp' },
      { caption: 'Retrieval pipeline inspector', src: '/images/projects/aria-support-agent/02-pipeline.webp' },
      { caption: 'Indexed corpus browser', src: '/images/projects/aria-support-agent/03-corpus.webp' },
    ],
  },

  /* ------------------------------------------------------------------ 3 */
  {
    slug: 'vantage-bi',
    title: 'Retail analytics that made Monday meetings obsolete',
    client: 'Vantage Retail',
    clientDescriptor: '84-store retail chain',
    year: 2024,
    duration: '4 months',
    role: 'BI & Data Engineer',
    category: 'Data & BI',
    summary:
      'Power BI platform over a modelled warehouse, replacing 60+ hand-built spreadsheets with governed self-service.',
    featured: true,
    tech: ['Power BI', 'DAX', 'SQL Server', 'Azure Data Factory', 'dbt', 'Python', 'Airflow'],
    metrics: [
      { label: 'Reporting time saved', value: '30 hrs/wk' },
      { label: 'Spreadsheets retired', value: '60+' },
      { label: 'Data freshness', value: '24h → 15min' },
    ],
    challenge:
      'Every store manager maintained a personal spreadsheet. Head office had a report pack that took two analysts three days a week to assemble, and by the time it landed it described a week that had already ended. Two departments routinely quoted different revenue figures for the same month.',
    approach: [
      {
        title: 'Built one definition of every metric',
        detail:
          'A dbt semantic layer where "revenue", "margin" and "active SKU" are defined once and reused. Disagreement between departments became impossible by construction.',
      },
      {
        title: 'Moved from batch to near-real-time',
        detail:
          'Incremental CDC pipelines through Data Factory replaced nightly full loads, bringing freshness from 24 hours to 15 minutes.',
      },
      {
        title: 'Designed for the phone first',
        detail:
          'Store managers do not open laptops mid-shift. The daily view was designed for a phone screen and one thumb, with the full drill-down available on desktop.',
      },
      {
        title: 'Taught the model, not the tool',
        detail:
          'Training focused on the data model so managers could answer their own new questions rather than filing a request for every variation.',
      },
    ],
    architecture: [
      { layer: 'Sources', detail: 'POS, ERP, e-commerce, workforce scheduling, supplier EDI feeds' },
      { layer: 'Pipeline', detail: 'Azure Data Factory CDC ingestion orchestrated by Airflow, dbt transforms with tests' },
      { layer: 'Warehouse', detail: 'SQL Server star schema, incremental fact partitions, surrogate-key conformed dimensions' },
      { layer: 'Presentation', detail: 'Power BI composite model, optimised DAX measures, row-level security by store' },
    ],
    highlights: [
      'Row-level security so each manager sees their store, regionals see their region, automatically',
      'Anomaly alerts that flag unusual shrinkage before month-end rather than after',
      'Cohort analysis linking loyalty signups to 12-month repeat spend',
      'Query performance tuned from 40s to under 2s on the heaviest dashboard',
      'Data quality tests fail the pipeline loudly rather than publishing silently wrong numbers',
    ],
    outcome:
      'Roughly 30 analyst-hours a week returned to actual analysis. The Monday reporting meeting was cancelled — the numbers were already on everyone\'s phone by 7am. Business insight turnaround improved by an estimated 30%.',
    demoSlug: 'pulse-bi',
    screenshots: [
      { caption: 'Executive overview with cross-filtering', src: '/images/projects/vantage-bi/01-overview.webp' },
      { caption: 'Cross-filtered drill-down by region', src: '/images/projects/vantage-bi/02-filtered.webp' },
      { caption: 'Region x category revenue heatmap', src: '/images/projects/vantage-bi/03-heatmap.webp' },
    ],
  },

  /* ------------------------------------------------------------------ 4 */
  {
    slug: 'lumina-commerce',
    title: 'Shopify Plus rebuild that halved time-to-purchase',
    client: 'Lumina',
    clientDescriptor: 'DTC lighting brand',
    year: 2024,
    duration: '3 months',
    role: 'Lead Front-End Engineer',
    category: 'E-Commerce',
    summary:
      'Headless Hydrogen storefront with faceted discovery, a rebuilt cart and a checkout that stopped leaking revenue.',
    featured: true,
    tech: ['Shopify Plus', 'Hydrogen', 'Remix', 'Liquid', 'GraphQL', 'TypeScript', 'Tailwind'],
    metrics: [
      { label: 'Conversion rate', value: '+34%' },
      { label: 'LCP improvement', value: '4.1s → 1.2s' },
      { label: 'Cart abandonment', value: '−28%' },
    ],
    challenge:
      'Lumina\'s theme had accumulated eleven apps, each injecting its own scripts. Mobile LCP sat at 4.1 seconds, product filtering triggered a full page reload, and the three-step checkout lost a quarter of its traffic between shipping and payment.',
    approach: [
      {
        title: 'Went headless where it paid, kept Liquid where it did not',
        detail:
          'Hydrogen for the storefront where performance and interactivity matter; native Shopify checkout retained because rebuilding a PCI-compliant checkout is a liability, not a feature.',
      },
      {
        title: 'Removed apps instead of optimising around them',
        detail:
          'Eight of eleven apps were replaced with a few hundred lines of first-party code. Most "performance work" on Shopify is really dependency work.',
      },
      {
        title: 'Made filtering instant',
        detail:
          'Faceted search moved to the edge with URL-driven state, so filters are shareable, back-button-correct and render without a round trip.',
      },
      {
        title: 'Instrumented the funnel honestly',
        detail:
          'Real-user monitoring on every step surfaced that most abandonment came from a shipping estimator that silently failed for three countries.',
      },
    ],
    architecture: [
      { layer: 'Storefront', detail: 'Hydrogen on Remix, streaming SSR, Oxygen edge deployment' },
      { layer: 'Data', detail: 'Storefront GraphQL with persisted queries, edge cache keyed by market and currency' },
      { layer: 'Search', detail: 'Edge-side faceted index, URL-as-state, optimistic filter application' },
      { layer: 'Checkout', detail: 'Native Shopify checkout with a custom cart layer and Checkout UI extensions' },
    ],
    highlights: [
      'Product images served as responsive AVIF with correct art direction per breakpoint',
      'Cart drawer with optimistic line-item updates and inventory-aware quantity limits',
      'Internationalisation across 4 markets with correct currency, tax display and shipping rules',
      'Zero layout shift on the product page — CLS held at 0.00 through launch',
      'A/B framework at the edge, so experiments do not cost a render-blocking script',
    ],
    outcome:
      'Conversion rate up 34% within eight weeks. Mobile LCP fell from 4.1s to 1.2s. The fixed shipping estimator alone accounted for roughly a third of the cart-abandonment improvement.',
    demoSlug: 'lumina-commerce',
    screenshots: [
      { caption: 'Faceted product listing with instant filtering', src: '/images/projects/lumina-commerce/01-listing.webp' },
      { caption: 'Product detail with variant selection', src: '/images/projects/lumina-commerce/02-product.webp' },
      { caption: 'Cart drawer and checkout hand-off', src: '/images/projects/lumina-commerce/03-cart.webp' },
    ],
  },

  /* ------------------------------------------------------------------ 5 */
  {
    slug: 'meridian-magento',
    title: 'Magento 2 B2B marketplace serving 1,200 dealers',
    client: 'Meridian',
    clientDescriptor: 'Industrial parts distributor',
    year: 2023,
    duration: '9 months',
    role: 'Senior Magento Developer',
    category: 'E-Commerce',
    summary:
      'Multi-vendor B2B platform with contract pricing, credit terms and a 400k-SKU catalogue that stays fast.',
    featured: false,
    tech: ['Magento 2', 'PHP 8', 'MySQL', 'Elasticsearch', 'Redis', 'RabbitMQ', 'Varnish', 'Docker'],
    metrics: [
      { label: 'Dealers onboarded', value: '1,200' },
      { label: 'Catalogue size', value: '400k SKUs' },
      { label: 'Category load time', value: '−63%' },
    ],
    challenge:
      'Meridian sold through a phone-and-fax dealer network. Every dealer had negotiated pricing, credit limits and approval chains. Off-the-shelf B2B commerce assumed a public catalogue and a credit card — neither applied.',
    approach: [
      {
        title: 'Modelled contract pricing as a first-class concept',
        detail:
          'A custom pricing engine resolving dealer tier, contract overrides, volume breaks and promotions in a deterministic order — with the resolution explained in the UI so dealers trust the number.',
      },
      {
        title: 'Made 400k SKUs searchable, not just present',
        detail:
          'Elasticsearch with attribute-aware faceting and technical-spec search, because industrial buyers search by part number and tolerance, not by marketing copy.',
      },
      {
        title: 'Built approval workflows into the cart',
        detail:
          'Multi-level purchase approval with budget checks and delegated authority, matching how the dealers\' own procurement actually works.',
      },
      {
        title: 'Attacked performance at the indexer',
        detail:
          'Async indexing over RabbitMQ plus targeted Varnish rules brought category pages from unusable to sub-second under full catalogue load.',
      },
    ],
    architecture: [
      { layer: 'Application', detail: 'Magento 2 Commerce with custom pricing, approval and quoting modules' },
      { layer: 'Search', detail: 'Elasticsearch with custom analyzers for part numbers and dimensional specs' },
      { layer: 'Async', detail: 'RabbitMQ consumers for indexing, ERP sync, pricing recalculation and invoicing' },
      { layer: 'Caching', detail: 'Varnish full-page cache with hole-punched dealer pricing, Redis session and object cache' },
    ],
    highlights: [
      'Bi-directional ERP sync for stock, pricing and credit status with conflict resolution',
      'Quote-to-order workflow with negotiated line items and expiry',
      'Punch-out catalogue support for dealers running their own procurement systems',
      'Custom pricing engine covered by an extensive test suite — pricing bugs are expensive',
      'Zero-downtime deployment pipeline with automated schema migration checks',
    ],
    outcome:
      '1,200 dealers migrated off phone and fax within the first year. Category page load times fell 63% despite the catalogue tripling. Order entry errors dropped sharply once dealers keyed their own orders.',
    screenshots: [
      { caption: 'Dealer dashboard with contract pricing' },
      { caption: 'Technical-spec faceted search across 400k SKUs' },
      { caption: 'Multi-level purchase approval flow' },
    ],
  },

  /* ------------------------------------------------------------------ 6 */
  {
    slug: 'quill-cms',
    title: 'Headless WordPress for a 2M-reader publication',
    client: 'Quill',
    clientDescriptor: 'Digital publisher',
    year: 2024,
    duration: '4 months',
    role: 'Full Stack Engineer',
    category: 'Web Applications',
    summary:
      'WordPress kept as the editorial back end, front end rebuilt headless — editors kept their workflow, readers got speed.',
    featured: false,
    tech: ['WordPress', 'ACF Pro', 'WPGraphQL', 'Next.js', 'TypeScript', 'Redis', 'Cloudflare'],
    metrics: [
      { label: 'Monthly readers', value: '2M' },
      { label: 'Time to first byte', value: '−78%' },
      { label: 'Editorial retraining', value: 'None' },
    ],
    challenge:
      'Quill\'s WordPress install had grown to 47 plugins and buckled under traffic spikes whenever a story landed. The obvious answer — replatform to a modern CMS — would have meant retraining 30 editors mid-news-cycle. That was never going to happen.',
    approach: [
      {
        title: 'Kept the editorial experience untouched',
        detail:
          'Editors kept the WordPress admin they knew. Everything changed behind it. Migration risk on a publishing business is mostly people risk, not technical risk.',
      },
      {
        title: 'Rebuilt the reader-facing front end headless',
        detail:
          'Next.js consuming WPGraphQL with incremental static regeneration — breaking news publishes in seconds without rebuilding the site.',
      },
      {
        title: 'Replaced plugins with code where it mattered',
        detail:
          'The performance and SEO plugin stack was replaced by first-party implementations, cutting 47 plugins to 12.',
      },
      {
        title: 'Cached aggressively at the edge',
        detail:
          'Cloudflare with tag-based purging tied to WordPress publish hooks — an editor hitting Update invalidates exactly the right pages and nothing else.',
      },
    ],
    architecture: [
      { layer: 'CMS', detail: 'WordPress + ACF Pro as a headless content API, custom post types and editorial roles' },
      { layer: 'API', detail: 'WPGraphQL with persisted queries and a Redis response cache' },
      { layer: 'Front end', detail: 'Next.js App Router, ISR with on-demand revalidation, RSC-first rendering' },
      { layer: 'Edge', detail: 'Cloudflare CDN with tag-based purge triggered by WordPress publish hooks' },
    ],
    highlights: [
      'Live preview preserved — editors still see drafts exactly as readers will',
      'Structured data for articles, authors and breadcrumbs, lifting rich-result coverage',
      'Media pipeline generating responsive AVIF/WebP on upload',
      'Traffic-spike resilience validated by load testing at 10× peak',
      'Editorial workflow, scheduling and embargoes preserved end to end',
    ],
    outcome:
      'Time to first byte fell 78%. The site now absorbs traffic spikes that previously took it down. Not a single editor needed retraining — the thing they touch every day did not change.',
    demoSlug: 'quill-cms',
    screenshots: [
      { caption: 'Editorial dashboard with scheduling', src: '/images/projects/quill-cms/01-editor.webp' },
      { caption: 'Live preview of the reader view', src: '/images/projects/quill-cms/02-preview.webp' },
      { caption: 'Block editor with reorderable blocks', src: '/images/projects/quill-cms/03-blocks.webp' },
    ],
  },

  /* ------------------------------------------------------------------ 7 */
  {
    slug: 'sentinel-docs',
    title: 'Document intelligence for regulated onboarding',
    client: 'Sentinel',
    clientDescriptor: 'Compliance technology firm',
    year: 2025,
    duration: '6 months',
    role: 'AI Engineer',
    category: 'AI & Machine Learning',
    summary:
      'OCR plus transformer extraction turning unstructured onboarding packets into validated structured records.',
    featured: true,
    tech: ['Python', 'PyTorch', 'Transformers', 'Tesseract', 'OpenCV', 'FastAPI', 'PostgreSQL', 'Celery'],
    metrics: [
      { label: 'Extraction accuracy', value: '97.2%' },
      { label: 'Processing time', value: '45min → 90s' },
      { label: 'Manual review rate', value: '−82%' },
    ],
    challenge:
      'Sentinel\'s analysts hand-keyed data from client onboarding packets — scanned PDFs, phone photos of documents, occasional faxes — at roughly 45 minutes per packet. Volume was growing faster than they could hire, and manual transcription errors carried regulatory consequences.',
    approach: [
      {
        title: 'Cleaned up the image before asking a model anything',
        detail:
          'Deskew, denoise, adaptive thresholding and orientation detection in OpenCV. Most extraction failures on real-world documents are image-quality failures, and preprocessing is cheaper than a bigger model.',
      },
      {
        title: 'Classified before extracting',
        detail:
          'A document-type classifier routes each page to a specialised extractor, rather than asking one general model to handle 14 different form layouts.',
      },
      {
        title: 'Made the model report its own uncertainty',
        detail:
          'Per-field confidence scores decide what a human sees. Analysts review the 18% that is genuinely ambiguous instead of re-checking everything.',
      },
      {
        title: 'Validated against business rules, not just schemas',
        detail:
          'Cross-field checks — dates in sequence, identifiers passing checksums, totals that add up — catch plausible-looking extraction errors that a type check never would.',
      },
    ],
    architecture: [
      { layer: 'Preprocessing', detail: 'OpenCV deskew/denoise, page segmentation, orientation and quality scoring' },
      { layer: 'Recognition', detail: 'Tesseract with a fine-tuned LayoutLM pass for structured field extraction' },
      { layer: 'Validation', detail: 'Rule engine for cross-field consistency, checksums and regulatory constraints' },
      { layer: 'Serving', detail: 'FastAPI with Celery workers, GPU inference pool, full artefact audit trail' },
    ],
    highlights: [
      'Handles phone photos, scans and faxes without a separate pipeline per source',
      'Confidence-routed human review focused on genuinely ambiguous fields only',
      'Every extraction stores the source crop, so an auditor can see exactly where a value came from',
      'Active-learning loop feeds analyst corrections back into the next fine-tune',
      'Complete audit trail sufficient for regulatory review',
    ],
    outcome:
      'Processing time per packet fell from 45 minutes to 90 seconds. Manual review dropped 82%, and the analysts who used to transcribe now handle exception cases and client relationships.',
    screenshots: [
      { caption: 'Extraction review with per-field confidence' },
      { caption: 'Source-crop provenance for an extracted value' },
      { caption: 'Model performance across document types' },
    ],
  },

  /* ------------------------------------------------------------------ 8 */
  {
    slug: 'atlas-fleet',
    title: 'Real-time fleet telemetry at 12k events/second',
    client: 'Atlas Fleet',
    clientDescriptor: 'Logistics operator, 3,400 vehicles',
    year: 2024,
    duration: '5 months',
    role: 'Full Stack Engineer',
    category: 'Web Applications',
    summary:
      'IoT ingestion and live mapping for 3,400 vehicles, with route replay and predictive maintenance alerts.',
    featured: false,
    tech: ['Node.js', 'MQTT', 'TimescaleDB', 'Mapbox GL', 'React', 'WebSockets', 'Docker', 'Grafana'],
    metrics: [
      { label: 'Events ingested', value: '12k/sec' },
      { label: 'Vehicles tracked', value: '3,400' },
      { label: 'Unplanned downtime', value: '−24%' },
    ],
    challenge:
      'Atlas had telematics hardware on every vehicle and almost no usable software. Data landed in a relational table that had grown past a billion rows; the "live map" refreshed every five minutes and routinely timed out. Maintenance was purely reactive.',
    approach: [
      {
        title: 'Used a database built for time-series',
        detail:
          'TimescaleDB with hypertables, continuous aggregates and compression. Queries that timed out on plain Postgres return in milliseconds — the data model was the bottleneck, not the hardware.',
      },
      {
        title: 'Decoupled ingestion from the read path',
        detail:
          'MQTT into a buffered ingestion service, so a telemetry burst can never slow the dashboard down.',
      },
      {
        title: 'Rendered the map on the GPU',
        detail:
          'Mapbox GL with clustered vector layers keeps 3,400 live markers at 60fps, where DOM markers had collapsed at a few hundred.',
      },
      {
        title: 'Turned sensor drift into maintenance alerts',
        detail:
          'Rolling-window anomaly detection on engine temperature, fuel efficiency and braking patterns flags degradation weeks before failure.',
      },
    ],
    architecture: [
      { layer: 'Edge', detail: 'MQTT over TLS from vehicle units with store-and-forward for dead zones' },
      { layer: 'Ingestion', detail: 'Node.js consumers with back-pressure handling and batched writes' },
      { layer: 'Storage', detail: 'TimescaleDB hypertables, continuous aggregates, 90-day compression policy' },
      { layer: 'Delivery', detail: 'WebSocket fan-out with viewport-scoped subscriptions, Mapbox GL vector rendering' },
    ],
    highlights: [
      'Route replay for any vehicle across any historical window, rendered instantly',
      'Geofencing with entry/exit alerts and configurable dwell thresholds',
      'Driver behaviour scoring from harsh-braking and acceleration signatures',
      'Viewport-scoped subscriptions — clients receive only the vehicles they can see',
      'Grafana observability on the pipeline itself, not just the fleet',
    ],
    outcome:
      'The live map became genuinely live. Predictive maintenance alerts cut unplanned downtime 24% in the first six months, and dispatchers stopped phoning drivers to ask where they were.',
    screenshots: [
      { caption: 'Live fleet map with clustered vehicle markers' },
      { caption: 'Vehicle detail with route replay' },
      { caption: 'Predictive maintenance alert queue' },
    ],
  },

  /* ------------------------------------------------------------------ 9 */
  {
    slug: 'cadence-mobile',
    title: 'A fitness app with offline-first workout tracking',
    client: 'Cadence',
    clientDescriptor: 'Fitness startup',
    year: 2023,
    duration: '5 months',
    role: 'Mobile Engineer',
    category: 'Mobile',
    summary:
      'Cross-platform React Native app that works in basement gyms with no signal and reconciles cleanly when it returns.',
    featured: false,
    tech: ['React Native', 'Expo', 'TypeScript', 'Firebase', 'WatermelonDB', 'Reanimated'],
    metrics: [
      { label: 'App Store rating', value: '4.7★' },
      { label: 'D30 retention', value: '+41%' },
      { label: 'Offline sessions', value: '38%' },
    ],
    challenge:
      'The first version assumed connectivity. Gyms are often basements with no signal, so users lost workouts mid-session — the single most-cited reason in one-star reviews. Nearly 40% of sessions started offline.',
    approach: [
      {
        title: 'Treated offline as the default state',
        detail:
          'WatermelonDB as the source of truth on-device; the network is a sync channel, not a dependency. The app behaves identically with or without signal.',
      },
      {
        title: 'Resolved conflicts by field, not by record',
        detail:
          'Last-write-wins at record level loses data when someone logs on a watch and a phone. Field-level merge with tombstones keeps both edits.',
      },
      {
        title: 'Moved animation off the JS thread',
        detail:
          'Reanimated worklets keep rest timers and transitions at 60fps even while a sync batch is running.',
      },
      {
        title: 'Designed for one sweaty thumb',
        detail:
          'Large targets, high contrast, no precision gestures. Mid-set is a hostile interaction environment and the UI has to respect that.',
      },
    ],
    architecture: [
      { layer: 'Local', detail: 'WatermelonDB with lazy-loaded observables and per-field change tracking' },
      { layer: 'Sync', detail: 'Delta sync with vector clocks, exponential backoff, resumable batches' },
      { layer: 'Backend', detail: 'Firebase Auth, Firestore, Cloud Functions for aggregation and streak logic' },
      { layer: 'UI', detail: 'Expo Router, Reanimated worklets, Skia charts for progress visualisation' },
    ],
    highlights: [
      'Complete workout logging with zero connectivity, indefinitely',
      'Apple Health and Google Fit integration with two-way sync',
      'Progressive-overload suggestions computed from logged history',
      'Rest timers that survive backgrounding and device lock',
      'Under 3-second cold start on mid-range Android hardware',
    ],
    outcome:
      'Store rating climbed from 3.1 to 4.7 within two releases. 30-day retention rose 41%. Offline session loss — the top complaint — disappeared from reviews entirely.',
    screenshots: [
      { caption: 'Workout logging with offline indicator' },
      { caption: 'Progress charts rendered with Skia' },
      { caption: 'Sync reconciliation view' },
    ],
  },

  /* ------------------------------------------------------------------ 10 */
  {
    slug: 'vertex-pay',
    title: 'Payment orchestration across six providers',
    client: 'Vertex Pay',
    clientDescriptor: 'Fintech platform',
    year: 2024,
    duration: '6 months',
    role: 'Backend Engineer',
    category: 'Web Applications',
    summary:
      'Provider-agnostic payment layer with intelligent routing, idempotent retries and reconciliation that balances.',
    featured: false,
    tech: ['Node.js', 'TypeScript', 'Stripe', 'PostgreSQL', 'Redis', 'Kafka', 'Terraform', 'AWS'],
    metrics: [
      { label: 'Payment success rate', value: '+7.4pts' },
      { label: 'Providers unified', value: '6' },
      { label: 'Reconciliation drift', value: '0' },
    ],
    challenge:
      'Vertex integrated payment providers one at a time, each with its own SDK, error taxonomy and webhook semantics leaking into business logic. Failed payments were not retried intelligently, and month-end reconciliation took four days of spreadsheet work that never quite balanced.',
    approach: [
      {
        title: 'Put a domain model in front of the providers',
        detail:
          'One internal representation of a payment; provider adapters translate at the edge. Business logic never learns what a Stripe error code is.',
      },
      {
        title: 'Made every operation idempotent',
        detail:
          'Idempotency keys through the whole stack. In payments, the question is never whether a retry happens — it is whether the retry charges someone twice.',
      },
      {
        title: 'Routed on live success rates',
        detail:
          'A routing engine scoring providers by card type, geography, amount and rolling success rate, with automatic failover on degradation.',
      },
      {
        title: 'Made the ledger the source of truth',
        detail:
          'Double-entry ledger with an append-only event log. Reconciliation became a query rather than a spreadsheet exercise.',
      },
    ],
    architecture: [
      { layer: 'Domain', detail: 'Provider-agnostic payment aggregate with an explicit state machine' },
      { layer: 'Adapters', detail: 'Per-provider modules normalising auth, capture, refund and webhook semantics' },
      { layer: 'Events', detail: 'Kafka event log driving ledger projection, notifications and analytics' },
      { layer: 'Infra', detail: 'Terraform-managed AWS, KMS envelope encryption, PCI-scoped network segmentation' },
    ],
    highlights: [
      'Automatic failover between providers on degradation, transparent to the caller',
      'Smart retry with provider-specific backoff — soft declines retried, hard declines never',
      'Webhook handling that tolerates duplicates, out-of-order delivery and replays',
      'Double-entry ledger that has never required a manual adjusting entry',
      'PCI-DSS scope kept minimal — card data never touches Vertex infrastructure',
    ],
    outcome:
      'Payment success rate improved 7.4 percentage points, almost entirely from intelligent retry and failover. Month-end reconciliation went from four days to a report that runs in under a minute and balances.',
    screenshots: [
      { caption: 'Payment routing rules and live provider health' },
      { caption: 'Transaction detail with full event timeline' },
      { caption: 'Reconciliation dashboard' },
    ],
  },

  /* ------------------------------------------------------------------ 11 */
  {
    slug: 'orbit-devops',
    title: 'From 3-hour manual deploys to 9-minute pipelines',
    client: 'Orbit',
    clientDescriptor: 'SaaS engineering org, 40 engineers',
    year: 2023,
    duration: '4 months',
    role: 'DevOps Engineer',
    category: 'DevOps & Cloud',
    summary:
      'Containerised 14 services, moved to Kubernetes with Terraform-managed infra and progressive delivery.',
    featured: false,
    tech: ['Docker', 'Kubernetes', 'Terraform', 'GitHub Actions', 'AWS EKS', 'ArgoCD', 'Prometheus'],
    metrics: [
      { label: 'Deploy time', value: '3h → 9min' },
      { label: 'Deploy frequency', value: '2/wk → 40/wk' },
      { label: 'Change failure rate', value: '−71%' },
    ],
    challenge:
      'Orbit deployed on Thursday nights via a runbook one engineer fully understood. Environments drifted, rollbacks meant restoring a snapshot, and nobody deployed before a holiday. Fourteen services, all hand-placed on EC2 instances.',
    approach: [
      {
        title: 'Made infrastructure reproducible first',
        detail:
          'Terraform modules for everything, so environments become identical by construction. Automating deploys onto drifting infrastructure just automates the drift.',
      },
      {
        title: 'Containerised without rewriting',
        detail:
          'Multi-stage builds and externalised configuration for all 14 services, deliberately leaving application code alone to keep the change reviewable.',
      },
      {
        title: 'Adopted GitOps',
        detail:
          'ArgoCD reconciling cluster state from Git. Deployment became a merge; rollback became a revert.',
      },
      {
        title: 'Made releases progressive',
        detail:
          'Canary deployments with automated analysis on error rate and latency — a bad release rolls itself back before anyone is paged.',
      },
    ],
    architecture: [
      { layer: 'Infra', detail: 'Terraform-managed EKS, VPC, RDS and IAM with per-environment workspaces' },
      { layer: 'Delivery', detail: 'GitHub Actions build and test, ArgoCD sync, Argo Rollouts canary analysis' },
      { layer: 'Runtime', detail: 'Kubernetes with HPA, PodDisruptionBudgets, resource quotas and network policies' },
      { layer: 'Observability', detail: 'Prometheus, Grafana, Loki, distributed tracing with SLO-based alerting' },
    ],
    highlights: [
      'Ephemeral preview environments spun up per pull request and destroyed on merge',
      'Secrets managed through External Secrets Operator — none in Git, none in CI logs',
      'Automated rollback triggered by SLO burn rate rather than a human noticing',
      'Cost reduced ~34% via right-sizing and spot instances for non-critical workloads',
      'Runbook knowledge moved out of one person\'s head and into code',
    ],
    outcome:
      'Deploys went from a three-hour Thursday-night ritual to a nine-minute pipeline running forty times a week. Change failure rate dropped 71%. Deploying on a Friday stopped being a joke.',
    screenshots: [
      { caption: 'GitOps pipeline with canary analysis' },
      { caption: 'Per-PR preview environments' },
      { caption: 'SLO dashboard and burn-rate alerts' },
    ],
  },

  /* ------------------------------------------------------------------ 12 */
  {
    slug: 'verdant-saas',
    title: 'Vue 3 workspace for sustainability reporting',
    client: 'Verdant',
    clientDescriptor: 'ESG reporting SaaS',
    year: 2023,
    duration: '6 months',
    role: 'Front-End Lead',
    category: 'Web Applications',
    summary:
      'Nuxt 3 application turning fragmented emissions data into audit-ready disclosure reports.',
    featured: false,
    tech: ['Vue 3', 'Nuxt 3', 'TypeScript', 'Pinia', 'Vitest', 'Tailwind', 'Chart.js'],
    metrics: [
      { label: 'Report prep time', value: '−68%' },
      { label: 'Lighthouse score', value: '98' },
      { label: 'Test coverage', value: '87%' },
    ],
    challenge:
      'Sustainability teams assembled disclosure reports from utility bills, supplier surveys and travel exports, then defended every number to an auditor. The existing tool captured data but could not show where a figure came from — which is the entire job.',
    approach: [
      {
        title: 'Made provenance a first-class feature',
        detail:
          'Every figure traces back to its source document and calculation. If an auditor cannot follow the number to its origin, the report is worthless.',
      },
      {
        title: 'Built a spreadsheet-grade data grid',
        detail:
          'These users live in Excel. A grid with paste, fill-down, undo and inline validation earns adoption; a form-based CRUD interface does not.',
      },
      {
        title: 'Split the emissions engine from the UI',
        detail:
          'Calculation logic isolated as a pure, exhaustively tested module — regulatory factors change annually and must be versioned independently.',
      },
      {
        title: 'Rendered server-side for the auditors',
        detail:
          'Nuxt SSR so shared report links open instantly for external reviewers on unknown devices and networks.',
      },
    ],
    architecture: [
      { layer: 'Front end', detail: 'Nuxt 3 with hybrid rendering, Pinia stores, composable-driven domain logic' },
      { layer: 'Domain', detail: 'Versioned emissions-factor engine as a pure TypeScript package' },
      { layer: 'Data', detail: 'Normalised activity records with immutable source-document references' },
      { layer: 'Quality', detail: 'Vitest unit suite plus Playwright end-to-end coverage of the reporting flow' },
    ],
    highlights: [
      'Spreadsheet-style grid with paste, fill-down, multi-cell undo and validation',
      'Versioned emissions factors so historical reports never silently change',
      'Full audit trail from headline figure to source document',
      'Export to the disclosure formats regulators actually accept',
      'Accessible to WCAG 2.1 AA, verified with axe and manual keyboard passes',
    ],
    outcome:
      'Report preparation time fell 68%. Two enterprise customers cited the provenance trail as the deciding factor in choosing Verdant over an incumbent.',
    screenshots: [
      { caption: 'Emissions data grid with inline validation' },
      { caption: 'Provenance trail from figure to source document' },
      { caption: 'Generated disclosure report' },
    ],
  },

  /* ------------------------------------------------------------------ 13 */
  {
    slug: 'forge-microservices',
    title: 'Breaking a Java monolith into event-driven services',
    client: 'Forge',
    clientDescriptor: 'Manufacturing software vendor',
    year: 2022,
    duration: '11 months',
    role: 'Backend Engineer',
    category: 'DevOps & Cloud',
    summary:
      'Strangler-fig decomposition of a 400k-line Spring monolith into nine services on Kafka.',
    featured: false,
    tech: ['Java 17', 'Spring Boot', 'Kafka', 'PostgreSQL', 'Docker', 'Kubernetes', 'JUnit'],
    metrics: [
      { label: 'Services extracted', value: '9' },
      { label: 'Build time', value: '48min → 6min' },
      { label: 'Incidents', value: '0 major' },
    ],
    challenge:
      'A decade-old Spring monolith where a change to invoicing could break scheduling. Builds took 48 minutes, releases were quarterly, and a single slow query could take the entire product offline. A rewrite was proposed and, sensibly, rejected.',
    approach: [
      {
        title: 'Strangled rather than rewrote',
        detail:
          'Extracted one bounded context at a time behind a routing facade, with the monolith authoritative until each service proved itself. Big-bang rewrites of business-critical systems fail.',
      },
      {
        title: 'Let the domain define the seams',
        detail:
          'Event-storming sessions with domain experts found the real boundaries — which did not match the package structure at all.',
      },
      {
        title: 'Made events the integration contract',
        detail:
          'Kafka with a schema registry and explicit compatibility rules, so services evolve without coordinated deploys.',
      },
      {
        title: 'Kept data ownership strict',
        detail:
          'Each service owns its schema. No shared tables, no cross-service joins — the discipline that decides whether this becomes microservices or a distributed monolith.',
      },
    ],
    architecture: [
      { layer: 'Services', detail: 'Nine Spring Boot services, each owning its PostgreSQL schema' },
      { layer: 'Messaging', detail: 'Kafka with Avro schema registry and enforced backward compatibility' },
      { layer: 'Patterns', detail: 'Outbox pattern for reliable publishing, saga orchestration for cross-service flows' },
      { layer: 'Runtime', detail: 'Kubernetes with per-service autoscaling and independent release cadence' },
    ],
    highlights: [
      'Outbox pattern guaranteeing no event is lost between database commit and publish',
      'Sagas with compensating transactions for multi-service business flows',
      'Contract tests preventing breaking schema changes from reaching production',
      'Per-service scaling — the scheduling engine scales without scaling invoicing',
      'Zero major incidents across an eleven-month migration',
    ],
    outcome:
      'Nine services extracted with no major customer-facing incident. Build time fell from 48 minutes to 6. Release cadence went from quarterly to weekly, and teams stopped queuing behind each other.',
    screenshots: [
      { caption: 'Service topology and event flow' },
      { caption: 'Saga orchestration for cross-service transactions' },
      { caption: 'Schema registry compatibility gate' },
    ],
  },

  /* ------------------------------------------------------------------ 14 */
  {
    slug: 'prism-design-system',
    title: 'A design system three product teams actually use',
    client: 'Prism',
    clientDescriptor: 'Enterprise software group',
    year: 2024,
    duration: '5 months',
    role: 'Design Systems Engineer',
    category: 'Design Systems',
    summary:
      'Token-driven component library shared across three products, with accessibility enforced in CI.',
    featured: false,
    tech: ['React', 'TypeScript', 'Storybook', 'Figma', 'Style Dictionary', 'Radix UI', 'Playwright'],
    metrics: [
      { label: 'Components shipped', value: '64' },
      { label: 'UI build time', value: '−45%' },
      { label: 'A11y violations', value: '0 in CI' },
    ],
    challenge:
      'Three product teams had three button components, three date pickers and three interpretations of the brand. A previous design system existed and nobody used it — it shipped as a Figma file with no code, so the two drifted apart within a month.',
    approach: [
      {
        title: 'Generated tokens from one source',
        detail:
          'Style Dictionary emitting CSS variables, Tailwind config and Figma variables from a single token file. Design and code cannot drift when both are generated from the same input.',
      },
      {
        title: 'Built on accessible primitives',
        detail:
          'Radix under the hood for focus management, keyboard interaction and ARIA. Hand-rolling a combobox that works with a screen reader is a solved problem worth not re-solving.',
      },
      {
        title: 'Made accessibility a build failure',
        detail:
          'axe assertions in Storybook run on every story in CI. A component with a contrast violation does not merge.',
      },
      {
        title: 'Earned adoption instead of mandating it',
        detail:
          'Migrated the highest-traffic screen of each product personally. Teams adopted the system because it demonstrably saved them time.',
      },
    ],
    architecture: [
      { layer: 'Tokens', detail: 'Style Dictionary pipeline emitting CSS vars, Tailwind preset and Figma variables' },
      { layer: 'Primitives', detail: 'Radix UI behaviours wrapped in themed, strictly typed components' },
      { layer: 'Docs', detail: 'Storybook with live prop controls, usage guidance and do/don\'t examples' },
      { layer: 'Quality', detail: 'Playwright visual regression, axe accessibility assertions, semver release automation' },
    ],
    highlights: [
      '64 components covering forms, data display, navigation, overlays and feedback',
      'Light and dark themes derived from tokens — no duplicated component code',
      'Visual regression testing catching unintended changes before release',
      'Codemods shipped with breaking changes so upgrades are mechanical',
      'Adopted by all three teams within four months, without a mandate',
    ],
    outcome:
      'UI build time across the three products fell 45%. Accessibility violations stopped reaching production. The system is now the default starting point for new features rather than something teams work around.',
    screenshots: [
      { caption: 'Storybook component catalogue' },
      { caption: 'Token pipeline from source to platforms' },
      { caption: 'Visual regression diff in CI' },
    ],
  },
]

export const PROJECT_CATEGORIES = [
  'All',
  'AI & Machine Learning',
  'CRM & Platforms',
  'E-Commerce',
  'Data & BI',
  'Web Applications',
  'Mobile',
  'DevOps & Cloud',
  'Design Systems',
] as const

export const FEATURED_PROJECTS = PROJECTS.filter((p) => p.featured)

export function getProject(slug: string) {
  return PROJECTS.find((p) => p.slug === slug)
}

/** Every distinct technology across all case studies, sorted by frequency. */
export function allProjectTech(): string[] {
  const counts = new Map<string, number>()
  for (const p of PROJECTS) {
    for (const t of p.tech) counts.set(t, (counts.get(t) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([t]) => t)
}

/** Case studies that use a given technology — powers the /skills cross-links. */
export function projectsUsing(tech: string) {
  const needle = tech.toLowerCase()
  return PROJECTS.filter((p) => p.tech.some((t) => t.toLowerCase() === needle))
}
