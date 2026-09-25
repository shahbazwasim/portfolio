/**
 * Live demo registry. Each entry maps to a real, runnable app under src/demos.
 * The route component is lazy-loaded so a demo never lands in the main bundle.
 */

export type Demo = {
  slug: string
  name: string
  tagline: string
  description: string
  /** What a visitor should click first. */
  tryThis: string[]
  tech: string[]
  proves: string[]
  /** Links back to the case study this demo illustrates. */
  projectSlug?: string
  accent: 'cyan' | 'violet' | 'magenta' | 'emerald' | 'amber' | 'blue'
  icon: 'kanban' | 'sparkles' | 'chart' | 'store' | 'pen' | 'receipt'
}

export const DEMOS: Demo[] = [
  {
    slug: 'nexus-crm',
    name: 'NexusCRM',
    tagline: 'Sales pipeline, contacts and forecasting',
    description:
      'A working CRM: drag deals between stages, filter and bulk-edit contacts, open a deal to see its activity timeline, and watch the forecast recompute. State persists to your browser, so refresh and it is all still there.',
    tryThis: [
      'Drag a deal card into another pipeline stage',
      'Open a deal to see its activity timeline and notes',
      'Multi-select contacts and apply a bulk action',
      'Switch the role selector to see permission-scoped views',
    ],
    tech: ['React', 'TypeScript', 'dnd-kit', 'Recharts', 'localStorage'],
    proves: ['CRM development', 'Complex state management', 'Enterprise UI patterns'],
    projectSlug: 'helio-crm',
    accent: 'violet',
    icon: 'kanban',
  },
  {
    slug: 'aria-ai',
    name: 'Aria',
    tagline: 'Retrieval-augmented assistant',
    description:
      'Ask anything about my experience and watch the retrieval pipeline work: the question is embedded, scored against a knowledge base, and the winning chunks are shown before the answer is composed. Runs entirely in your browser — no API key, no server.',
    tryThis: [
      'Ask "what is your experience with Shopify?"',
      'Open the pipeline inspector to see chunk scoring',
      'Try a question outside the knowledge base and watch it decline',
      'Compare retrieval modes: keyword, semantic, hybrid',
    ],
    tech: ['React', 'TypeScript', 'Retrieval scoring', 'SSE-ready'],
    proves: ['LLM engineering', 'RAG architecture', 'AI product design'],
    projectSlug: 'aria-support-agent',
    accent: 'cyan',
    icon: 'sparkles',
  },
  {
    slug: 'pulse-bi',
    name: 'PulseBI',
    tagline: 'Analytics dashboard with cross-filtering',
    description:
      'A Power BI-style dashboard over synthetic retail data. Click any chart segment to cross-filter everything else, change the date range, drill into a region, and export the filtered slice to CSV.',
    tryThis: [
      'Click a bar or pie segment to cross-filter every other chart',
      'Change the date range and watch the KPIs recompute',
      'Drill into a region for store-level detail',
      'Export the current filtered slice as CSV',
    ],
    tech: ['React', 'Recharts', 'TypeScript', 'CSV export'],
    proves: ['Power BI / data viz', 'Analytics engineering', 'Dashboard UX'],
    projectSlug: 'vantage-bi',
    accent: 'emerald',
    icon: 'chart',
  },
  {
    slug: 'lumina-commerce',
    name: 'Lumina',
    tagline: 'Storefront with cart and checkout',
    description:
      'A full commerce front end: faceted product listing, product detail with variant selection and gallery, a cart drawer with live totals, and a multi-step checkout. Your cart survives a page refresh.',
    tryThis: [
      'Filter by category, price and availability',
      'Open a product and switch variants',
      'Add several items and open the cart drawer',
      'Walk the checkout stepper through to confirmation',
    ],
    tech: ['React', 'TypeScript', 'Faceted search', 'Cart state machine'],
    proves: ['Shopify / Magento', 'E-commerce UX', 'Conversion-focused front end'],
    projectSlug: 'lumina-commerce',
    accent: 'amber',
    icon: 'store',
  },
  {
    slug: 'quill-cms',
    name: 'Quill',
    tagline: 'Block-based content management',
    description:
      'A WordPress-style CMS: write posts in a block editor, manage a media library, organise categories and tags, preview exactly as readers will see it, then publish or schedule. Everything persists locally.',
    tryThis: [
      'Create a post and add heading, image and quote blocks',
      'Reorder blocks by dragging',
      'Toggle live preview to see the reader view',
      'Schedule a post and watch it move through the status flow',
    ],
    tech: ['React', 'TypeScript', 'Block editor', 'dnd-kit'],
    proves: ['WordPress / headless CMS', 'Editorial tooling', 'Content architecture'],
    projectSlug: 'quill-cms',
    accent: 'blue',
    icon: 'pen',
  },
  {
    slug: 'invoicely',
    name: 'Invoicely',
    tagline: 'Invoice builder with real PDF export',
    description:
      'Build an invoice with line items, tax, discounts and multi-currency, pick a client, choose a template — then download an actual PDF generated in your browser. Not a mockup: the PDF is real and it opens.',
    tryThis: [
      'Add line items and watch the totals recalculate',
      'Apply a discount and change the tax rate',
      'Switch currency and template style',
      'Download the PDF — it is generated client-side',
    ],
    tech: ['React', 'TypeScript', 'jsPDF', 'Form state'],
    proves: ['Product engineering', 'Document generation', 'Practical utility'],
    accent: 'magenta',
    icon: 'receipt',
  },
  {
    slug: 'stockroom',
    name: 'Stockroom',
    tagline: 'Real retail data from a tested dbt warehouse',
    description:
      'A dashboard over 1,067,371 real e-commerce transactions (UCI Online Retail II, 2009–2011), computed by an open-source dbt + DuckDB pipeline with 206 data tests. Every figure comes from the pipeline\'s exports — nothing on this page is simulated.',
    tryThis: [
      'Hover the revenue chart to read any month',
      'Compare each segment\'s share of customers with its share of revenue',
      'Hover a cell in the cohort heatmap for the exact retention',
      'Switch any panel to Table to see the underlying numbers',
    ],
    tech: ['dbt', 'DuckDB', 'SQL', 'React', 'Recharts'],
    proves: ['Analytics engineering', 'Data modelling & testing', 'Honest data visualisation'],
    projectSlug: 'commerce-analytics-dbt',
    accent: 'emerald',
    icon: 'chart',
  },
]

export function getDemo(slug: string) {
  return DEMOS.find((d) => d.slug === slug)
}

export const ACCENT_CLASS: Record<Demo['accent'], { text: string; bg: string; border: string; glow: string }> = {
  cyan: { text: 'text-cyan', bg: 'bg-cyan/10', border: 'border-cyan/25', glow: 'shadow-cyan/20' },
  violet: { text: 'text-violet', bg: 'bg-violet/10', border: 'border-violet/25', glow: 'shadow-violet/20' },
  magenta: { text: 'text-magenta', bg: 'bg-magenta/10', border: 'border-magenta/25', glow: 'shadow-magenta/20' },
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', glow: 'shadow-emerald-500/20' },
  amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/25', glow: 'shadow-amber-500/20' },
  blue: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/25', glow: 'shadow-blue-500/20' },
}
