export type Role = {
  company: string
  title: string
  location: string
  start: string
  end: string
  /** Rendered on the timeline axis. */
  period: string
  current?: boolean
  summary: string
  highlights: string[]
  stack: string[]
}

export const EXPERIENCE: Role[] = [
  {
    company: 'EdTech Ventures',
    title: 'Senior Full Stack Engineer',
    location: 'Remote',
    start: '2023-08',
    end: 'present',
    period: 'Aug 2023 — Present',
    current: true,
    summary:
      'Leading AI-first product engineering — LLM features, retrieval systems and the full stack around them — while setting the standards the team builds to.',
    highlights: [
      'Design and ship LLM-backed features end to end: retrieval pipelines, prompt design, grounding checks and the evaluation harness that keeps them honest',
      'Own the full stack underneath — React and TypeScript on the front end, Node and Python services, PostgreSQL schema design and the APIs the product runs on',
      'Manage AI cost and latency in production: prompt caching on stable context, model routing by task difficulty, and streaming so responses feel immediate',
      'Designed Power BI reporting that improved business insight turnaround by around 30%',
      'Implemented security practices that cut application vulnerabilities by roughly 20%',
      'Mentor junior developers through code review and pairing, and lead architecture decisions across the team',
    ],
    stack: ['React', 'TypeScript', 'Node.js', 'Python', 'LLM APIs', 'PostgreSQL', 'AWS', 'Power BI'],
  },
  {
    company: 'Right Solution',
    title: 'Full Stack Developer',
    location: 'Remote',
    start: '2021-08',
    end: '2023-07',
    period: 'Aug 2021 — Jul 2023',
    summary:
      'Client delivery in a software house, across e-commerce, SaaS and content platforms — often brought onto the projects that had stalled.',
    highlights: [
      'Delivered Shopify and Magento builds for DTC and B2B merchants, from theme work through to ERP and payment integration',
      'Built custom CRM and internal tooling for clients who had outgrown spreadsheets',
      'Led headless CMS migrations that preserved the editorial workflows teams already relied on',
      'Worked directly with clients on scope, architecture and trade-offs rather than just picking up tickets',
      'Shipped to fixed deadlines across concurrent projects, and handed each one over documented',
    ],
    stack: ['React', 'Next.js', 'Shopify', 'Magento', 'WordPress', 'Node.js', 'TypeScript', 'MySQL'],
  },
  {
    company: 'Techsol IT',
    title: 'Software Engineer',
    location: 'Karachi, Pakistan',
    start: '2017-02',
    end: '2021-07',
    period: 'Feb 2017 — Jul 2021',
    summary:
      'Full stack delivery across client web applications, with a growing focus on performance and release quality.',
    highlights: [
      'Built responsive web applications in JavaScript, PHP and MySQL',
      'Optimised database queries and application code for a ~30% performance gain',
      'Introduced automated testing that reduced escaped bugs by around 25%',
      'Took features end to end: requirements, build, deployment and support',
      'Progressed from junior to owning full client projects',
    ],
    stack: ['JavaScript', 'PHP', 'MySQL', 'jQuery', 'Bootstrap', 'Laravel'],
  },
  {
    company: 'Freelance',
    title: 'Web Developer',
    location: 'Karachi, Pakistan',
    start: '2015-01',
    end: '2017-01',
    period: '2015 — 2017',
    summary:
      'Where it started: building sites and small applications for local businesses while finishing my degree.',
    highlights: [
      'Delivered WordPress and custom PHP sites for small and medium businesses',
      'Learned the parts of the job a degree does not teach — scoping, pricing, saying no',
      'Built the first e-commerce integrations that led to the Magento and Shopify work',
      'Self-taught the modern JavaScript ecosystem alongside client delivery',
    ],
    stack: ['PHP', 'WordPress', 'JavaScript', 'MySQL', 'HTML/CSS'],
  },
]

export type Education = {
  degree: string
  institution: string
  location: string
  note?: string
}

export const EDUCATION: Education[] = [
  {
    degree: 'Master of Science — Artificial Intelligence',
    institution: 'Iqra University',
    location: 'Karachi, Pakistan',
    note: 'Machine learning, natural language processing, computer vision and applied deep learning.',
  },
  {
    degree: 'Bachelor of Science — Computer Science',
    institution: 'DHA Suffa University',
    location: 'Karachi, Pakistan',
    note: 'Algorithms, data structures, databases, software engineering and distributed systems.',
  },
]

export const COURSES = [
  { name: 'CS101: Computer Science', institution: 'Stanford University' },
  { name: 'CS50: Understanding Technology', institution: 'Harvard University' },
]

export const LANGUAGES = [
  { name: 'English', level: 'Native / Professional' },
  { name: 'Urdu', level: 'Native' },
  { name: 'Hindi', level: 'Native' },
]

/** The numbers on the home-page bento grid. */
export const STATS = [
  { value: '10+', label: 'Years building', detail: 'Shipping since 2015' },
  { value: '120+', label: 'Projects delivered', detail: 'Across 4 continents' },
  { value: '45+', label: 'Clients served', detail: 'Startups to enterprise' },
  { value: '2', label: 'Degrees', detail: 'MSc AI · BSc CS' },
] as const

/** Values shown on /about. */
export const PRINCIPLES = [
  {
    title: 'Understand before building',
    detail:
      'The most expensive code is the code that solves the wrong problem perfectly. I spend the first week asking questions.',
  },
  {
    title: 'Migrate in slices',
    detail:
      'Big-bang rewrites of working systems fail. Strangler patterns, parallel running and staged cutover are slower on paper and faster in practice.',
  },
  {
    title: 'Measure, then optimise',
    detail:
      'Performance work without a profiler is guesswork. Every improvement I claim has a before and after number behind it.',
  },
  {
    title: 'Leave it maintainable',
    detail:
      'I write code the next person can read, document the decisions that were not obvious, and hand over properly. Consultants who create dependency are a liability.',
  },
] as const
