/**
 * Skills taxonomy. `projects` holds case-study slugs so /skills can link each
 * skill straight to work that used it — a claim with evidence attached.
 */

export type SkillLevel = 'expert' | 'advanced' | 'proficient'

export type Skill = {
  name: string
  level: SkillLevel
  /** Case-study slugs from data/projects.ts. */
  projects?: string[]
  note?: string
}

export type SkillGroup = {
  id: string
  title: string
  blurb: string
  icon: string
  skills: Skill[]
}

export const SKILL_GROUPS: SkillGroup[] = [
  {
    id: 'ai',
    title: 'AI & Machine Learning',
    blurb: 'Production LLM systems, retrieval architecture and the evaluation discipline that keeps them honest.',
    icon: 'sparkles',
    skills: [
      { name: 'LLM Application Development', level: 'expert', projects: ['aria-support-agent'] },
      { name: 'RAG Architecture', level: 'expert', projects: ['aria-support-agent'], note: 'Hybrid retrieval, reranking, grounding verification' },
      { name: 'Prompt Engineering', level: 'expert', projects: ['aria-support-agent'] },
      { name: 'AI Agents & Tool Use', level: 'advanced', projects: ['aria-support-agent'] },
      { name: 'Anthropic Claude API', level: 'expert', projects: ['aria-support-agent'] },
      { name: 'OpenAI API', level: 'expert' },
      { name: 'LangChain', level: 'advanced', projects: ['aria-support-agent'] },
      { name: 'LlamaIndex', level: 'proficient' },
      { name: 'Vector Databases', level: 'advanced', projects: ['aria-support-agent'], note: 'pgvector, Pinecone, Weaviate' },
      { name: 'Embeddings & Semantic Search', level: 'expert', projects: ['aria-support-agent'] },
      { name: 'Fine-tuning & LoRA', level: 'advanced', projects: ['sentinel-docs'] },
      { name: 'PyTorch', level: 'advanced', projects: ['sentinel-docs'] },
      { name: 'TensorFlow', level: 'proficient' },
      { name: 'Hugging Face Transformers', level: 'advanced', projects: ['sentinel-docs'] },
      { name: 'Computer Vision', level: 'advanced', projects: ['sentinel-docs'], note: 'OpenCV, OCR, document understanding' },
      { name: 'Natural Language Processing', level: 'expert', projects: ['aria-support-agent', 'sentinel-docs'] },
      { name: 'scikit-learn', level: 'advanced' },
      { name: 'MLOps & Model Serving', level: 'advanced', projects: ['sentinel-docs'] },
      { name: 'LLM Evaluation', level: 'expert', projects: ['aria-support-agent'], note: 'Golden sets, regression gating' },
    ],
  },
  {
    id: 'frontend',
    title: 'Frontend Engineering',
    blurb: 'Interfaces that stay fast and accessible as they grow complicated.',
    icon: 'layout',
    skills: [
      { name: 'React', level: 'expert', projects: ['helio-crm', 'lumina-commerce', 'prism-design-system'] },
      { name: 'TypeScript', level: 'expert', projects: ['helio-crm', 'vertex-pay', 'prism-design-system'] },
      { name: 'Next.js', level: 'expert', projects: ['quill-cms'] },
      { name: 'Vue 3', level: 'advanced', projects: ['verdant-saas'] },
      { name: 'Nuxt 3', level: 'advanced', projects: ['verdant-saas'] },
      { name: 'Angular', level: 'proficient' },
      { name: 'Svelte', level: 'proficient' },
      { name: 'Remix', level: 'advanced', projects: ['lumina-commerce'] },
      { name: 'Tailwind CSS', level: 'expert', projects: ['lumina-commerce', 'prism-design-system'] },
      { name: 'Framer Motion', level: 'advanced' },
      { name: 'Three.js / WebGL', level: 'proficient' },
      { name: 'Redux & Zustand', level: 'expert', projects: ['helio-crm'] },
      { name: 'TanStack Query', level: 'expert', projects: ['helio-crm'] },
      { name: 'Pinia', level: 'advanced', projects: ['verdant-saas'] },
      { name: 'Vite', level: 'expert' },
      { name: 'Webpack', level: 'advanced' },
      { name: 'Web Performance', level: 'expert', projects: ['lumina-commerce', 'quill-cms'], note: 'Core Web Vitals, bundle budgets' },
      { name: 'Accessibility (WCAG 2.1)', level: 'advanced', projects: ['prism-design-system', 'verdant-saas'] },
    ],
  },
  {
    id: 'backend',
    title: 'Backend Engineering',
    blurb: 'APIs and services designed for the load and failure modes they will actually meet.',
    icon: 'server',
    skills: [
      { name: 'Node.js', level: 'expert', projects: ['helio-crm', 'vertex-pay', 'atlas-fleet'] },
      { name: 'NestJS', level: 'expert', projects: ['helio-crm'] },
      { name: 'Express', level: 'expert' },
      { name: 'Python', level: 'expert', projects: ['aria-support-agent', 'sentinel-docs'] },
      { name: 'FastAPI', level: 'expert', projects: ['aria-support-agent', 'sentinel-docs'] },
      { name: 'Django', level: 'advanced' },
      { name: 'PHP 8', level: 'expert', projects: ['meridian-magento', 'quill-cms'] },
      { name: 'Laravel', level: 'advanced' },
      { name: 'Java 17', level: 'advanced', projects: ['forge-microservices'] },
      { name: 'Spring Boot', level: 'advanced', projects: ['forge-microservices'] },
      { name: 'Go', level: 'proficient' },
      { name: 'GraphQL', level: 'expert', projects: ['lumina-commerce', 'quill-cms'] },
      { name: 'REST API Design', level: 'expert', projects: ['helio-crm', 'vertex-pay'] },
      { name: 'WebSockets', level: 'expert', projects: ['helio-crm', 'atlas-fleet'] },
      { name: 'gRPC', level: 'proficient' },
      { name: 'Event-Driven Architecture', level: 'advanced', projects: ['forge-microservices', 'vertex-pay'] },
      { name: 'Microservices', level: 'advanced', projects: ['forge-microservices'] },
      { name: 'Kafka', level: 'advanced', projects: ['forge-microservices', 'vertex-pay'] },
      { name: 'RabbitMQ', level: 'advanced', projects: ['meridian-magento'] },
    ],
  },
  {
    id: 'crm',
    title: 'CRM & Business Platforms',
    blurb: 'Custom CRM builds and integrations into the platforms teams already run on.',
    icon: 'users',
    skills: [
      { name: 'Custom CRM Development', level: 'expert', projects: ['helio-crm'] },
      { name: 'Salesforce', level: 'advanced', note: 'Apex, Lightning, REST integration' },
      { name: 'HubSpot', level: 'advanced', note: 'Workflows, custom objects, API sync' },
      { name: 'Zoho CRM', level: 'advanced' },
      { name: 'Microsoft Dynamics 365', level: 'proficient' },
      { name: 'CRM Data Migration', level: 'expert', projects: ['helio-crm'] },
      { name: 'Sales Pipeline Modelling', level: 'expert', projects: ['helio-crm'] },
      { name: 'Marketing Automation', level: 'advanced' },
      { name: 'Role-Based Access Control', level: 'expert', projects: ['helio-crm'] },
      { name: 'Workflow & Approval Engines', level: 'expert', projects: ['meridian-magento', 'helio-crm'] },
    ],
  },
  {
    id: 'commerce',
    title: 'E-Commerce & CMS',
    blurb: 'Storefronts and content platforms — themes, headless builds and the integrations behind them.',
    icon: 'shopping-bag',
    skills: [
      { name: 'Shopify & Shopify Plus', level: 'expert', projects: ['lumina-commerce'] },
      { name: 'Shopify Hydrogen', level: 'advanced', projects: ['lumina-commerce'] },
      { name: 'Liquid', level: 'expert', projects: ['lumina-commerce'] },
      { name: 'Magento 2', level: 'expert', projects: ['meridian-magento'] },
      { name: 'WooCommerce', level: 'advanced' },
      { name: 'WordPress', level: 'expert', projects: ['quill-cms'] },
      { name: 'Headless WordPress', level: 'expert', projects: ['quill-cms'], note: 'WPGraphQL, ACF Pro' },
      { name: 'Custom WP Plugin & Theme Dev', level: 'expert', projects: ['quill-cms'] },
      { name: 'Strapi', level: 'advanced' },
      { name: 'Sanity', level: 'advanced' },
      { name: 'Contentful', level: 'proficient' },
      { name: 'Payment Integration', level: 'expert', projects: ['vertex-pay'], note: 'Stripe, PayPal, local gateways' },
      { name: 'B2B Commerce', level: 'expert', projects: ['meridian-magento'] },
    ],
  },
  {
    id: 'data',
    title: 'Data, BI & Analytics',
    blurb: 'Pipelines, warehouses and dashboards people trust enough to make decisions from.',
    icon: 'bar-chart',
    skills: [
      { name: 'Power BI', level: 'expert', projects: ['vantage-bi'] },
      { name: 'DAX', level: 'expert', projects: ['vantage-bi'] },
      { name: 'SQL', level: 'expert', projects: ['vantage-bi', 'helio-crm', 'commerce-analytics-dbt'] },
      { name: 'Data Modelling', level: 'expert', projects: ['vantage-bi', 'commerce-analytics-dbt'], note: 'Star schema, slowly changing dimensions' },
      { name: 'dbt', level: 'advanced', projects: ['vantage-bi', 'commerce-analytics-dbt'] },
      { name: 'Apache Airflow', level: 'advanced', projects: ['vantage-bi'] },
      { name: 'Azure Data Factory', level: 'advanced', projects: ['vantage-bi'] },
      { name: 'Pandas & NumPy', level: 'expert' },
      { name: 'Tableau', level: 'proficient' },
      { name: 'Apache Spark', level: 'proficient' },
      { name: 'ETL / ELT Design', level: 'expert', projects: ['vantage-bi', 'commerce-analytics-dbt'] },
      { name: 'Snowflake', level: 'advanced' },
      { name: 'BigQuery', level: 'proficient' },
      { name: 'Statistical Analysis', level: 'advanced' },
    ],
  },
  {
    id: 'databases',
    title: 'Databases',
    blurb: 'Schema design, query tuning and picking the right store for the access pattern.',
    icon: 'database',
    skills: [
      { name: 'PostgreSQL', level: 'expert', projects: ['helio-crm', 'vertex-pay', 'forge-microservices'] },
      { name: 'MySQL', level: 'expert', projects: ['meridian-magento'] },
      { name: 'MongoDB', level: 'advanced' },
      { name: 'Redis', level: 'expert', projects: ['helio-crm', 'meridian-magento'] },
      { name: 'TimescaleDB', level: 'advanced', projects: ['atlas-fleet'] },
      { name: 'Elasticsearch', level: 'advanced', projects: ['meridian-magento'] },
      { name: 'Firebase / Firestore', level: 'advanced', projects: ['cadence-mobile'] },
      { name: 'Supabase', level: 'advanced' },
      { name: 'DynamoDB', level: 'proficient' },
      { name: 'Query Optimisation', level: 'expert', projects: ['vantage-bi', 'atlas-fleet'] },
      { name: 'Database Migrations', level: 'expert', projects: ['forge-microservices'] },
    ],
  },
  {
    id: 'cloud',
    title: 'Cloud & DevOps',
    blurb: 'Infrastructure as code, containers and delivery pipelines that make deploys boring.',
    icon: 'cloud',
    skills: [
      { name: 'AWS', level: 'expert', projects: ['helio-crm', 'orbit-devops', 'vertex-pay'], note: 'EC2, ECS, Lambda, RDS, S3, CloudFront' },
      { name: 'Docker', level: 'expert', projects: ['orbit-devops', 'forge-microservices'] },
      { name: 'Kubernetes', level: 'advanced', projects: ['orbit-devops', 'forge-microservices'] },
      { name: 'Terraform', level: 'advanced', projects: ['orbit-devops', 'vertex-pay'] },
      { name: 'GitHub Actions', level: 'expert', projects: ['orbit-devops'] },
      { name: 'CI/CD Pipeline Design', level: 'expert', projects: ['orbit-devops'] },
      { name: 'ArgoCD & GitOps', level: 'advanced', projects: ['orbit-devops'] },
      { name: 'Azure', level: 'advanced', projects: ['vantage-bi'] },
      { name: 'Google Cloud Platform', level: 'proficient' },
      { name: 'Nginx', level: 'advanced' },
      { name: 'Netlify & Vercel', level: 'expert' },
      { name: 'Cloudflare', level: 'advanced', projects: ['quill-cms'] },
      { name: 'Prometheus & Grafana', level: 'advanced', projects: ['orbit-devops', 'atlas-fleet'] },
      { name: 'Observability & SLOs', level: 'advanced', projects: ['orbit-devops'] },
    ],
  },
  {
    id: 'mobile',
    title: 'Mobile',
    blurb: 'Cross-platform apps that behave well on real devices and real networks.',
    icon: 'smartphone',
    skills: [
      { name: 'React Native', level: 'advanced', projects: ['cadence-mobile'] },
      { name: 'Expo', level: 'advanced', projects: ['cadence-mobile'] },
      { name: 'Offline-First Architecture', level: 'expert', projects: ['cadence-mobile'] },
      { name: 'Flutter', level: 'proficient' },
      { name: 'Push Notifications', level: 'advanced', projects: ['cadence-mobile'] },
      { name: 'App Store & Play Deployment', level: 'advanced', projects: ['cadence-mobile'] },
    ],
  },
  {
    id: 'games',
    title: 'Game Development & UEFN',
    blurb: 'Fortnite islands built in Unreal Editor for Fortnite — Verse systems engineered like production software, and the design work that brings players back.',
    icon: 'gamepad',
    skills: [
      { name: 'UEFN (Unreal Editor for Fortnite)', level: 'advanced', projects: ['tidebreak-ranked-arena', 'nightjar-ai-director', 'pinegrove-tycoon', 'orrery-learning-island'] },
      { name: 'Verse', level: 'advanced', projects: ['tidebreak-ranked-arena', 'nightjar-ai-director', 'pinegrove-tycoon', 'orrery-learning-island'], note: 'Structured concurrency, failure contexts, persistence, NPC behaviours' },
      { name: 'Verse Persistence', level: 'advanced', projects: ['pinegrove-tycoon', 'tidebreak-ranked-arena'], note: 'Versioned save schemas with forward-only migrations' },
      { name: 'Fortnite Creative Devices', level: 'advanced', projects: ['tidebreak-ranked-arena', 'nightjar-ai-director', 'pinegrove-tycoon', 'orrery-learning-island'] },
      { name: 'Game Systems Design', level: 'advanced', projects: ['tidebreak-ranked-arena', 'nightjar-ai-director'] },
      { name: 'Game AI & NPC Behaviours', level: 'advanced', projects: ['nightjar-ai-director'], note: 'AI-director pacing, role-based enemy archetypes' },
      { name: 'Matchmaking & Skill Rating', level: 'advanced', projects: ['tidebreak-ranked-arena'], note: 'Glicko-style rating with a deviation term' },
      { name: 'Game Economy Design', level: 'advanced', projects: ['pinegrove-tycoon'], note: 'Simulation-first tuning in Python' },
      { name: 'Player Analytics & Retention', level: 'advanced', projects: ['pinegrove-tycoon', 'nightjar-ai-director', 'orrery-learning-island'] },
      { name: 'Educational Game Design', level: 'advanced', projects: ['orrery-learning-island'] },
      { name: 'Level Design', level: 'proficient', projects: ['tidebreak-ranked-arena', 'orrery-learning-island'] },
      { name: 'Unreal Engine 5', level: 'proficient', projects: ['tidebreak-ranked-arena', 'nightjar-ai-director', 'orrery-learning-island'] },
    ],
  },
  {
    id: 'quality',
    title: 'Testing & Security',
    blurb: 'Confidence before deploy, and the security basics that are cheap early and expensive late.',
    icon: 'shield',
    skills: [
      { name: 'Jest & Vitest', level: 'expert', projects: ['verdant-saas'] },
      { name: 'Playwright', level: 'advanced', projects: ['verdant-saas', 'prism-design-system'] },
      { name: 'Cypress', level: 'advanced' },
      { name: 'React Testing Library', level: 'expert' },
      { name: 'pytest', level: 'advanced', projects: ['sentinel-docs'] },
      { name: 'PHPUnit', level: 'advanced', projects: ['meridian-magento'] },
      { name: 'JUnit', level: 'advanced', projects: ['forge-microservices'] },
      { name: 'Test-Driven Development', level: 'advanced' },
      { name: 'OWASP Top 10', level: 'advanced', projects: ['vertex-pay'] },
      { name: 'OAuth 2.0 & JWT', level: 'expert', projects: ['helio-crm', 'vertex-pay'] },
      { name: 'PCI-DSS Compliance', level: 'advanced', projects: ['vertex-pay'] },
      { name: 'Encryption & Key Management', level: 'advanced', projects: ['vertex-pay'] },
      { name: 'Secure SDLC', level: 'advanced' },
    ],
  },
  {
    id: 'design',
    title: 'Design & Product',
    blurb: 'Enough design capability to build the thing well when there is no designer in the room.',
    icon: 'palette',
    skills: [
      { name: 'Figma', level: 'advanced', projects: ['prism-design-system'] },
      { name: 'Adobe XD', level: 'advanced' },
      { name: 'Design Systems', level: 'expert', projects: ['prism-design-system'] },
      { name: 'UI/UX Design', level: 'advanced', projects: ['lumina-commerce', 'prism-design-system'] },
      { name: 'Photoshop & Illustrator', level: 'advanced' },
      { name: 'Prototyping', level: 'advanced' },
      { name: 'Design Tokens', level: 'expert', projects: ['prism-design-system'] },
      { name: 'Storybook', level: 'expert', projects: ['prism-design-system'] },
      { name: 'Technical SEO', level: 'advanced', projects: ['quill-cms', 'lumina-commerce'] },
    ],
  },
  {
    id: 'practice',
    title: 'Engineering Practice',
    blurb: 'How the work gets planned, reviewed and handed over.',
    icon: 'compass',
    skills: [
      { name: 'System Design', level: 'expert', projects: ['forge-microservices', 'vertex-pay'] },
      { name: 'Domain-Driven Design', level: 'advanced', projects: ['forge-microservices'] },
      { name: 'Agile & Scrum', level: 'expert' },
      { name: 'Code Review', level: 'expert' },
      { name: 'Technical Documentation', level: 'expert' },
      { name: 'Mentoring & Team Leadership', level: 'expert' },
      { name: 'Stakeholder Communication', level: 'expert' },
      { name: 'Legacy Migration Strategy', level: 'expert', projects: ['forge-microservices', 'quill-cms'] },
      { name: 'Technical Discovery', level: 'expert', projects: ['helio-crm'] },
    ],
  },
]

export const LEVEL_META: Record<SkillLevel, { label: string; weight: number; tone: string }> = {
  expert: { label: 'Expert', weight: 3, tone: 'text-cyan border-cyan/30 bg-cyan/10' },
  advanced: { label: 'Advanced', weight: 2, tone: 'text-violet border-violet/30 bg-violet/10' },
  proficient: { label: 'Proficient', weight: 1, tone: 'text-muted border-line bg-surface-2' },
}

export const TOTAL_SKILLS = SKILL_GROUPS.reduce((n, g) => n + g.skills.length, 0)

/** Flat list for the home-page marquee — expert-level names read best there. */
export const MARQUEE_SKILLS = SKILL_GROUPS.flatMap((g) =>
  g.skills.filter((s) => s.level === 'expert').map((s) => s.name)
)

export function findSkillGroup(id: string) {
  return SKILL_GROUPS.find((g) => g.id === id)
}
