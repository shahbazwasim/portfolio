export type Service = {
  slug: string
  title: string
  tagline: string
  description: string
  deliverables: string[]
  bestFor: string
  icon: string
  accent: 'cyan' | 'violet' | 'magenta' | 'emerald' | 'amber' | 'blue'
}

export const SERVICES: Service[] = [
  {
    slug: 'ai-integration',
    title: 'AI & LLM Integration',
    tagline: 'Ship AI features that hold up in production',
    description:
      'Retrieval-augmented assistants, document intelligence, agent workflows and model integration — built with the evaluation harness and guardrails that separate a demo from a product.',
    deliverables: [
      'RAG pipeline with hybrid retrieval and reranking',
      'Grounding verification and citation enforcement',
      'Evaluation harness with a golden question set',
      'Cost controls: prompt caching, model routing, token budgets',
      'Streaming UX and graceful escalation to humans',
    ],
    bestFor: 'Teams with a real corpus who need answers users can trust.',
    icon: 'sparkles',
    accent: 'cyan',
  },
  {
    slug: 'custom-crm',
    title: 'Custom CRM & Internal Tools',
    tagline: 'Software shaped like your process, not a vendor\'s',
    description:
      'When off-the-shelf CRM forces your team to work backwards, a custom build pays for itself. Pipeline management, quoting, approvals, reporting — modelled on how you actually sell.',
    deliverables: [
      'Process discovery and data model design',
      'Pipeline, contact and activity management',
      'Role-based permissions down to the field level',
      'Integrations with the tools you already run',
      'Migration from existing systems with parallel running',
    ],
    bestFor: 'Teams whose process does not fit the CRM they are paying for.',
    icon: 'users',
    accent: 'violet',
  },
  {
    slug: 'ecommerce',
    title: 'E-Commerce Development',
    tagline: 'Storefronts that convert and stay fast',
    description:
      'Shopify, Shopify Plus, Magento 2 and headless commerce. Theme development, custom apps, B2B pricing engines, ERP integration and the performance work that actually moves conversion.',
    deliverables: [
      'Custom theme or headless storefront build',
      'Core Web Vitals optimisation with before/after numbers',
      'Payment, shipping and tax integration',
      'B2B features: contract pricing, approvals, quoting',
      'ERP and inventory synchronisation',
    ],
    bestFor: 'Merchants losing revenue to a slow or awkward storefront.',
    icon: 'shopping-bag',
    accent: 'amber',
  },
  {
    slug: 'web-applications',
    title: 'Full Stack Web Applications',
    tagline: 'From blank repository to production',
    description:
      'End-to-end product engineering with React, Next.js, Node and Python. Architecture, build, deployment and handover — including the unglamorous parts that decide whether it survives its second year.',
    deliverables: [
      'Technical discovery and architecture design',
      'Full stack implementation with typed contracts',
      'Authentication, authorisation and audit logging',
      'Automated testing and CI/CD pipeline',
      'Documentation and team handover',
    ],
    bestFor: 'Founders and teams who need the whole thing built properly.',
    icon: 'code',
    accent: 'blue',
  },
  {
    slug: 'data-bi',
    title: 'Data Engineering & BI',
    tagline: 'Dashboards people trust enough to act on',
    description:
      'Power BI, warehouse modelling and ETL pipelines. One definition of every metric, tested transformations, and reports that answer the question rather than raising three more.',
    deliverables: [
      'Source audit and dimensional data model',
      'ETL/ELT pipelines with data quality tests',
      'Power BI dashboards with row-level security',
      'Optimised DAX and query performance tuning',
      'Team training on the model, not just the tool',
    ],
    bestFor: 'Organisations where two departments quote different numbers.',
    icon: 'bar-chart',
    accent: 'emerald',
  },
  {
    slug: 'modernisation',
    title: 'Legacy Modernisation',
    tagline: 'Move off it without stopping the business',
    description:
      'Monolith decomposition, framework upgrades, replatforming and cloud migration — done incrementally, with the old system authoritative until the new one has earned the traffic.',
    deliverables: [
      'Codebase audit and risk assessment',
      'Incremental migration plan with rollback at each stage',
      'Strangler-pattern extraction of bounded contexts',
      'Containerisation and CI/CD modernisation',
      'Knowledge transfer so the team owns it afterwards',
    ],
    bestFor: 'Teams afraid to deploy on a Friday.',
    icon: 'refresh',
    accent: 'magenta',
  },
]

export type EngagementModel = {
  name: string
  duration: string
  description: string
  suits: string[]
  featured?: boolean
}

export const ENGAGEMENT_MODELS: EngagementModel[] = [
  {
    name: 'Discovery Sprint',
    duration: '1 — 2 weeks',
    description:
      'Before committing to a build: audit the current system, map requirements, and produce an architecture and delivery plan you could hand to any engineer.',
    suits: [
      'Scoping a project properly before budgeting it',
      'Second opinion on an approach or an estimate',
      'Auditing a codebase you inherited',
    ],
  },
  {
    name: 'Project Delivery',
    duration: '1 — 6 months',
    description:
      'Fixed-scope build with defined milestones. Weekly demos, staged delivery, and documented handover so your team owns it at the end.',
    suits: [
      'A defined product or feature that needs shipping',
      'Replatform or migration with a clear finish line',
      'Teams without in-house capacity for this specific work',
    ],
    featured: true,
  },
  {
    name: 'Embedded Engineer',
    duration: 'Ongoing',
    description:
      'Part- or full-time as a member of your team — standups, code review, planning, the lot. Contract or full-time, and open to relocation.',
    suits: [
      'Sustained roadmap delivery',
      'Filling a senior gap while you hire',
      'Teams wanting to build AI capability in-house',
    ],
  },
]

export const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Discovery',
    detail:
      'I ask a lot of questions, read the existing code, and talk to the people who will use the thing. Most bad software is a discovery failure, not an engineering one.',
  },
  {
    step: '02',
    title: 'Architecture',
    detail:
      'A written plan: data model, system boundaries, stack choices with reasons, and the risks I can see. You approve it before anything gets built.',
  },
  {
    step: '03',
    title: 'Build',
    detail:
      'Incremental delivery with a working demo every week. You see progress continuously and can change direction cheaply, because nothing is a black box for three months.',
  },
  {
    step: '04',
    title: 'Harden',
    detail:
      'Tests, error handling, performance budgets, security review and monitoring. This is the phase that gets cut on doomed projects.',
  },
  {
    step: '05',
    title: 'Handover',
    detail:
      'Documentation, a walkthrough with your team, and a support window. I aim to make myself unnecessary — creating dependency is bad engineering.',
  },
] as const
