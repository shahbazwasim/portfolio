import { Head } from 'vite-react-ssg'
import { SITE } from '@/data/site'

type SeoProps = {
  title?: string
  description?: string
  /** Path only, e.g. `/work/nexus-crm`. Combined with SITE.url for the canonical. */
  path?: string
  image?: string
  type?: 'website' | 'article' | 'profile'
  publishedAt?: string
  keywords?: string[]
  noIndex?: boolean
  /** Extra JSON-LD graph nodes for this page. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

const DEFAULT_DESCRIPTION = SITE.bio

export function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  image = SITE.ogImage,
  type = 'website',
  publishedAt,
  keywords,
  noIndex,
  jsonLd,
}: SeoProps) {
  const fullTitle = title ? `${title} · ${SITE.name}` : `${SITE.name} — ${SITE.role}`
  const url = `${SITE.url}${path === '/' ? '' : path}`
  const imageUrl = image.startsWith('http') ? image : `${SITE.url}${image}`

  const graph = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords?.length ? <meta name="keywords" content={keywords.join(', ')} /> : null}
      <link rel="canonical" href={url} />
      {noIndex ? <meta name="robots" content="noindex, nofollow" /> : (
        <meta name="robots" content="index, follow, max-image-preview:large" />
      )}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_US" />
      {publishedAt ? <meta property="article:published_time" content={publishedAt} /> : null}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {graph.map((node, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(node)}
        </script>
      ))}
    </Head>
  )
}

/** Person + WebSite graph. Rendered once, on the home page. */
export function personJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${SITE.url}/#person`,
        name: SITE.name,
        jobTitle: SITE.role,
        description: SITE.bio,
        url: SITE.url,
        image: `${SITE.url}/images/profile-hero.png`,
        email: `mailto:${SITE.email}`,
        telephone: SITE.phone,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Karachi',
          addressCountry: 'PK',
        },
        alumniOf: [
          { '@type': 'CollegeOrUniversity', name: 'Iqra University' },
          { '@type': 'CollegeOrUniversity', name: 'DHA Suffa University' },
        ],
        knowsAbout: [
          'Full Stack Development',
          'Artificial Intelligence',
          'Large Language Models',
          'React',
          'Node.js',
          'CRM Development',
          'Shopify',
          'WordPress',
          'Magento',
          'Power BI',
          'Data Science',
        ],
        sameAs: [
          'https://www.linkedin.com/in/shahbazwasim/',
          'https://github.com/Shahbazwasim',
          'https://www.behance.net/shahbazwasim',
          'https://www.youtube.com/@bingozee4132',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE.url}/#website`,
        url: SITE.url,
        name: `${SITE.name} — ${SITE.role}`,
        description: SITE.bio,
        publisher: { '@id': `${SITE.url}/#person` },
        inLanguage: 'en',
      },
    ],
  }
}

/** Breadcrumb graph for detail pages. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE.url}${item.path}`,
    })),
  }
}
