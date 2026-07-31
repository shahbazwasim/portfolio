/**
 * Single source of truth for identity, contact routing and navigation.
 * Nothing else in the app should hard-code an email, handle or URL.
 */

export const SITE = {
  name: 'Shahbaz Wasim',
  firstName: 'Shahbaz',
  role: 'Full Stack & AI Engineer',
  roles: [
    'Full Stack Engineer',
    'AI & LLM Engineer',
    'CRM Architect',
    'E-Commerce Specialist',
    'Data & BI Developer',
  ],
  tagline: 'I build AI-powered products, CRMs and commerce platforms that ship.',
  bio: 'Full stack engineer with 10+ years building scalable web applications, AI-driven products and custom CRM platforms for teams across four continents.',

  location: 'Karachi, Pakistan',
  timezone: 'PKT (UTC+5)',
  yearsExperience: 10,
  projectsDelivered: 120,
  clientsServed: 45,
  startedYear: 2015,

  /** Publicly displayed address (matches the CV). */
  email: 'shahbaz.wasim01@gmail.com',
  /** Where Netlify form notifications are routed. Configured in the Netlify dashboard. */
  formNotificationEmail: 'shahbaz.wasim@hotmail.com',

  phone: '+92 334 3456735',
  phoneRaw: '923343456735',

  availability: {
    status: 'available' as 'available' | 'limited' | 'booked',
    label: 'Available for new projects',
    detail: 'Open to full-time roles, contracts and worldwide relocation.',
    responseTime: 'Usually replies within 24 hours',
  },

  /** Update after pointing a custom domain at the Netlify site. */
  url: 'https://shahbazwasim.netlify.app',
  domainSuggestion: 'shahbazwasim.com',
  ogImage: '/og/default.png',
  resumePath: '/Shahbaz-Wasim-Resume.pdf',
} as const

export const SOCIALS = [
  {
    label: 'LinkedIn',
    handle: 'in/shahbazwasim',
    href: 'https://www.linkedin.com/in/shahbazwasim/',
    icon: 'linkedin',
  },
  {
    label: 'GitHub',
    handle: 'Shahbazwasim',
    href: 'https://github.com/Shahbazwasim',
    icon: 'github',
  },
  {
    label: 'GitHub (work)',
    handle: 'shahbazedtechventures',
    href: 'https://github.com/shahbazedtechventures',
    icon: 'github',
  },
  {
    label: 'Behance',
    handle: 'shahbazwasim',
    href: 'https://www.behance.net/shahbazwasim',
    icon: 'behance',
  },
  {
    label: 'YouTube',
    handle: '@bingozee4132',
    href: 'https://www.youtube.com/@bingozee4132',
    icon: 'youtube',
  },
  {
    label: 'WhatsApp',
    handle: SITE.phone,
    href: `https://wa.me/${SITE.phoneRaw}`,
    icon: 'whatsapp',
  },
] as const

export type SocialLink = (typeof SOCIALS)[number]

export const NAV_LINKS = [
  { label: 'Work', href: '/work' },
  { label: 'AI', href: '/ai' },
  { label: 'Demos', href: '/demos' },
  { label: 'Skills', href: '/skills' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
] as const

export const FOOTER_LINKS = [
  {
    heading: 'Explore',
    links: [
      { label: 'Work', href: '/work' },
      { label: 'Live Demos', href: '/demos' },
      { label: 'AI Expertise', href: '/ai' },
      { label: 'Skills', href: '/skills' },
    ],
  },
  {
    heading: 'Engage',
    links: [
      { label: 'Services', href: '/services' },
      { label: 'About', href: '/about' },
      { label: 'Résumé', href: '/resume' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    heading: 'More',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'Privacy', href: '/privacy' },
    ],
  },
] as const

/** Routes fed to the sitemap generator and the SSG crawler. */
export const STATIC_ROUTES = [
  '/',
  '/about',
  '/work',
  '/ai',
  '/services',
  '/skills',
  '/demos',
  '/blog',
  '/resume',
  '/contact',
  '/privacy',
] as const
