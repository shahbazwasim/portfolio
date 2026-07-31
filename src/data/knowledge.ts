/**
 * Knowledge base for the Aria assistant.
 *
 * These are the retrieval corpus. The assistant answers *only* from these
 * chunks — if nothing scores above the grounding threshold it declines rather
 * than inventing something, which is the whole point of the demo.
 */

export type Chunk = {
  id: string
  /** Heading path, carried into scoring and shown as provenance. */
  section: string
  title: string
  text: string
  /** Extra retrieval surface for phrasings not present in the body text. */
  keywords: string[]
}

export const KNOWLEDGE: Chunk[] = [
  {
    id: 'identity',
    section: 'About → Identity',
    title: 'Who Shahbaz is',
    text: 'Shahbaz Wasim is a Full Stack and AI Engineer with over 10 years of experience building software since 2015, working remotely with clients worldwide. He holds an MSc in Artificial Intelligence from Iqra University and a BSc in Computer Science from DHA Suffa University. He works across AI systems, custom CRM platforms, e-commerce and data engineering.',
    keywords: ['who', 'about', 'introduction', 'name', 'background', 'bio', 'summary'],
  },
  {
    id: 'availability',
    section: 'About → Availability',
    title: 'Availability and relocation',
    text: 'Shahbaz is currently available for new projects and open to full-time roles, contract work and consulting. He works remotely with clients worldwide and is open to relocating internationally for the right opportunity. He operates on PKT (UTC+5) but is flexible on hours for other timezones, and usually replies to enquiries within 24 hours.',
    keywords: ['available', 'hire', 'hiring', 'relocate', 'relocation', 'remote', 'full-time', 'contract', 'freelance', 'visa', 'timezone'],
  },
  {
    id: 'contact',
    section: 'Contact',
    title: 'How to get in touch',
    text: 'The fastest way to reach Shahbaz is the contact form on this site, or email at shahbaz.wasim01@gmail.com. He is also reachable on WhatsApp at +92 334 3456735, and on LinkedIn, GitHub, Behance and YouTube — all linked in the footer.',
    keywords: ['contact', 'email', 'reach', 'phone', 'whatsapp', 'linkedin', 'get in touch', 'message'],
  },
  {
    id: 'experience-current',
    section: 'Experience → Current',
    title: 'Current role at Habl Tech',
    text: 'Since August 2023 Shahbaz has been a Full Stack Developer at Habl Tech Company. He builds scalable web applications with ReactJS, Node.js and Magento, integrates AI-driven features and CRM solutions, designs Power BI reporting that improved business insight turnaround by around 30%, implements security practices that cut vulnerabilities by roughly 20%, and mentors junior developers.',
    keywords: ['current job', 'habl', 'now', 'present', 'employer', 'work'],
  },
  {
    id: 'experience-history',
    section: 'Experience → History',
    title: 'Career history',
    text: 'Shahbaz started freelancing in 2015 building WordPress and PHP sites for small businesses. From February 2017 to July 2021 he was a Software Engineer at Techsol IT, where he built responsive applications in JavaScript, PHP and MySQL, improved application performance by about 30% through query optimisation, and introduced automated testing that reduced bugs by around 25%. From 2021 to 2023 he worked as an independent consultant for startups and agencies across e-commerce, SaaS and data. He joined Habl Tech in August 2023.',
    keywords: ['history', 'career', 'previous', 'techsol', 'freelance', 'consulting', 'years', 'experience', 'timeline'],
  },
  {
    id: 'ai-expertise',
    section: 'Skills → AI',
    title: 'AI and machine learning expertise',
    text: 'Shahbaz builds production LLM systems: retrieval-augmented generation with hybrid search and reranking, AI agents with tool use, prompt engineering, fine-tuning and LoRA, embeddings and vector databases including pgvector, Pinecone and Weaviate. He works with the Anthropic Claude API and OpenAI API, LangChain and LlamaIndex, PyTorch, TensorFlow and Hugging Face Transformers. He also does computer vision and document intelligence with OpenCV and OCR, plus MLOps and model serving. He treats LLM evaluation as non-negotiable — golden question sets and regression gating on every prompt change.',
    keywords: ['ai', 'artificial intelligence', 'machine learning', 'ml', 'llm', 'rag', 'gpt', 'claude', 'openai', 'anthropic', 'embeddings', 'vector', 'agents', 'fine-tuning', 'nlp'],
  },
  {
    id: 'rag-approach',
    section: 'AI → RAG',
    title: 'How Shahbaz approaches RAG',
    text: 'His view is that most RAG hallucination is a retrieval failure, not a model failure. He chunks on document structure rather than fixed token windows, runs hybrid BM25 plus vector search fused by reciprocal rank, reranks the top candidates with a cross-encoder, and enforces citation so every claim maps to a retrieved chunk. Answers that fail the grounding check are suppressed and escalated rather than shown. On the Aria support agent this lifted answer accuracy 23 points over pure vector search and deflected 61% of tickets.',
    keywords: ['rag', 'retrieval', 'hallucination', 'grounding', 'chunking', 'reranking', 'hybrid search', 'citations', 'vector search'],
  },
  {
    id: 'crm',
    section: 'Skills → CRM',
    title: 'CRM development',
    text: 'Shahbaz builds custom CRM platforms and integrates existing ones. He built NexusCRM for Helio Group — a 240-seat sales CRM replacing three separate tools, with a drag-and-drop pipeline, real-time collaboration over WebSockets, field-level role-based permissions and a forecast engine. It cut quote-to-close time by 42%. He also works with Salesforce, HubSpot, Zoho and Dynamics 365, and handles CRM data migration and integration.',
    keywords: ['crm', 'salesforce', 'hubspot', 'zoho', 'dynamics', 'pipeline', 'sales', 'nexuscrm', 'helio'],
  },
  {
    id: 'ecommerce',
    section: 'Skills → E-commerce',
    title: 'E-commerce and CMS',
    text: 'Shahbaz works across Shopify and Shopify Plus including Hydrogen and Liquid, Magento 2 including B2B commerce, WooCommerce and WordPress. On the Lumina Shopify Plus rebuild he cut mobile LCP from 4.1 seconds to 1.2 and lifted conversion 34%, largely by replacing eight of eleven third-party apps with first-party code. On Meridian he built a Magento 2 B2B marketplace for 1,200 dealers with a contract pricing engine over a 400,000-SKU catalogue.',
    keywords: ['shopify', 'magento', 'woocommerce', 'ecommerce', 'e-commerce', 'store', 'storefront', 'hydrogen', 'liquid', 'commerce'],
  },
  {
    id: 'wordpress',
    section: 'Skills → WordPress',
    title: 'WordPress and headless CMS',
    text: 'Shahbaz has built WordPress since 2015 — custom themes, custom plugins, and headless architectures. On the Quill project he kept WordPress as the editorial back end for a 2M-reader publication while rebuilding the front end in Next.js over WPGraphQL, cutting time to first byte by 78% and requiring zero editor retraining. He also works with Strapi, Sanity and Contentful.',
    keywords: ['wordpress', 'wp', 'headless', 'cms', 'strapi', 'sanity', 'contentful', 'acf', 'wpgraphql', 'quill'],
  },
  {
    id: 'frontend',
    section: 'Skills → Frontend',
    title: 'Frontend engineering',
    text: 'Shahbaz is expert-level in React, TypeScript, Next.js and Tailwind CSS, and advanced in Vue 3, Nuxt, Remix, Framer Motion and state tools like Redux, Zustand and TanStack Query. He also works with Angular and Svelte. He treats Core Web Vitals as an engineering constraint, not an afterthought, and builds to WCAG 2.1 AA.',
    keywords: ['frontend', 'react', 'typescript', 'nextjs', 'next.js', 'vue', 'nuxt', 'tailwind', 'javascript', 'ui', 'angular', 'svelte'],
  },
  {
    id: 'backend',
    section: 'Skills → Backend',
    title: 'Backend engineering',
    text: 'Shahbaz builds backends in Node.js with NestJS and Express, Python with FastAPI and Django, PHP with Laravel, and Java with Spring Boot. He designs REST and GraphQL APIs, real-time systems over WebSockets, and event-driven architectures on Kafka and RabbitMQ. He has decomposed a 400,000-line Java monolith into nine event-driven services using the strangler pattern, with zero major incidents across an eleven-month migration.',
    keywords: ['backend', 'node', 'nodejs', 'python', 'php', 'java', 'api', 'graphql', 'rest', 'microservices', 'kafka', 'nestjs', 'fastapi', 'laravel', 'spring'],
  },
  {
    id: 'data-bi',
    section: 'Skills → Data',
    title: 'Data engineering and Power BI',
    text: 'Shahbaz builds Power BI reporting on top of properly modelled warehouses. On the Vantage Retail project he replaced 60+ hand-built spreadsheets across 84 stores with a governed semantic layer in dbt, moved data freshness from 24 hours to 15 minutes with CDC pipelines, and returned roughly 30 analyst-hours a week. He works with DAX, SQL, dbt, Airflow, Azure Data Factory, Pandas, Snowflake and BigQuery.',
    keywords: ['power bi', 'powerbi', 'bi', 'data', 'analytics', 'dashboard', 'sql', 'dax', 'etl', 'warehouse', 'dbt', 'airflow', 'reporting'],
  },
  {
    id: 'cloud-devops',
    section: 'Skills → Cloud',
    title: 'Cloud and DevOps',
    text: 'Shahbaz works extensively on AWS with EC2, ECS, Lambda, RDS, S3 and CloudFront, plus Azure and GCP. He containerises with Docker, orchestrates with Kubernetes, manages infrastructure as code with Terraform, and builds CI/CD on GitHub Actions and ArgoCD. On the Orbit project he took deploys from a three-hour manual Thursday-night ritual to a nine-minute pipeline running forty times a week, cutting change failure rate by 71%.',
    keywords: ['aws', 'cloud', 'devops', 'docker', 'kubernetes', 'terraform', 'ci/cd', 'cicd', 'deployment', 'infrastructure', 'azure', 'gcp'],
  },
  {
    id: 'mobile',
    section: 'Skills → Mobile',
    title: 'Mobile development',
    text: 'Shahbaz builds cross-platform mobile apps with React Native and Expo, and has worked with Flutter. On the Cadence fitness app he rebuilt the architecture offline-first with WatermelonDB and field-level conflict resolution, because nearly 40% of workout sessions started in gyms with no signal. The store rating went from 3.1 to 4.7 and 30-day retention rose 41%.',
    keywords: ['mobile', 'react native', 'ios', 'android', 'app', 'flutter', 'expo', 'offline'],
  },
  {
    id: 'services',
    section: 'Services',
    title: 'What Shahbaz offers',
    text: 'Six service areas: AI and LLM integration, custom CRM and internal tools, e-commerce development, full stack web applications, data engineering and BI, and legacy modernisation. Engagements come in three shapes — a one to two week discovery sprint, fixed-scope project delivery over one to six months, or embedded engineering as part of your team on an ongoing basis.',
    keywords: ['services', 'offer', 'hire', 'engagement', 'consulting', 'discovery', 'project', 'embedded', 'work together'],
  },
  {
    id: 'process',
    section: 'Services → Process',
    title: 'How Shahbaz runs a project',
    text: 'Five stages: discovery (asking questions, reading the code, watching people work), architecture (a written plan you approve before anything is built), build (incremental delivery with a working demo every week), harden (tests, error handling, performance budgets, security review, monitoring), and handover (documentation, a walkthrough, and a support window). He aims to make himself unnecessary — creating dependency is bad engineering.',
    keywords: ['process', 'how you work', 'methodology', 'approach', 'delivery', 'agile', 'handover'],
  },
  {
    id: 'demos',
    section: 'Demos',
    title: 'The live demos on this site',
    text: 'Six working applications are built into this site: NexusCRM (drag-and-drop sales pipeline), Aria (this assistant, with a RAG pipeline inspector), PulseBI (cross-filtering analytics dashboard), Lumina (storefront with cart and checkout), Quill (block-based CMS) and Invoicely (invoice builder with real client-side PDF export). All state persists to your browser and nothing is sent to a server.',
    keywords: ['demo', 'demos', 'try', 'live', 'interactive', 'playground', 'examples', 'nexuscrm', 'pulsebi', 'invoicely', 'lumina'],
  },
  {
    id: 'education',
    section: 'Education',
    title: 'Education',
    text: 'Shahbaz holds an MSc in Artificial Intelligence from Iqra University, covering machine learning, natural language processing, computer vision and applied deep learning. He also holds a BSc in Computer Science from DHA Suffa University. He has additionally completed CS101 Computer Science at Stanford and CS50 Understanding Technology at Harvard.',
    keywords: ['education', 'degree', 'university', 'msc', 'bsc', 'masters', 'bachelors', 'study', 'qualification', 'iqra', 'dha suffa'],
  },
  {
    id: 'languages',
    section: 'About → Languages',
    title: 'Spoken languages',
    text: 'Shahbaz speaks English at a native professional level, and Urdu and Hindi natively.',
    keywords: ['language', 'languages', 'speak', 'english', 'urdu', 'hindi'],
  },
  {
    id: 'philosophy',
    section: 'About → Principles',
    title: 'Engineering principles',
    text: 'Four things Shahbaz works by: understand before building, because the most expensive code solves the wrong problem perfectly; migrate in slices, because big-bang rewrites of working systems fail; measure then optimise, because performance work without a profiler is guesswork; and leave it maintainable, because consultants who create dependency are a liability.',
    keywords: ['philosophy', 'principles', 'values', 'beliefs', 'opinion', 'approach', 'style'],
  },
  {
    id: 'this-site',
    section: 'Meta',
    title: 'How this site was built',
    text: 'This portfolio is built with React 19, Vite, TypeScript and Tailwind CSS v4, prerendered to static HTML with vite-react-ssg for SEO, animated with Motion, and deployed on Netlify. The contact form runs on Netlify Forms. This assistant runs entirely in your browser using a keyword and semantic hybrid retrieval scorer over a curated knowledge base — no API key, no server call, no cost.',
    keywords: ['this site', 'built', 'stack', 'portfolio', 'website', 'how does this work', 'tech', 'source'],
  },
]

/** Shown as starter chips in the assistant UI. */
export const SUGGESTED_QUESTIONS = [
  'What is your experience with AI and LLMs?',
  'Have you built CRM systems before?',
  'Are you available for hire?',
  'What e-commerce platforms do you work with?',
  'How do you approach a new project?',
  'What did you study?',
] as const
