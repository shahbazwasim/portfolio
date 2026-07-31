import { Seo, personJsonLd } from '@/lib/seo'
import { SITE } from '@/data/site'
import { Hero } from '@/components/sections/Hero'
import { BentoStats } from '@/components/sections/BentoStats'
import { FeaturedWork } from '@/components/sections/FeaturedWork'
import { AITeaser } from '@/components/sections/AITeaser'
import { DemosPreview } from '@/components/sections/DemosPreview'
import { SkillsMarquee } from '@/components/sections/SkillsMarquee'
import { ServicesPreview } from '@/components/sections/ServicesPreview'
import { Testimonials } from '@/components/sections/Testimonials'

export default function Home() {
  return (
    <>
      <Seo
        description={`${SITE.name} — ${SITE.role} working remotely with clients worldwide. ${SITE.yearsExperience}+ years building AI systems, custom CRMs, e-commerce platforms and data pipelines. Available for hire.`}
        path="/"
        keywords={[
          'full stack developer',
          'AI engineer',
          'LLM engineer',
          'CRM developer',
          'React developer',
          'Node.js developer',
          'Shopify developer',
          'Magento developer',
          'WordPress developer',
          'Power BI developer',
          'hire full stack developer',
          'remote full stack developer',
          'freelance AI developer',
        ]}
        jsonLd={personJsonLd()}
      />

      <Hero />
      <FeaturedWork />
      <BentoStats />
      <AITeaser />
      <DemosPreview />
      <SkillsMarquee />
      <ServicesPreview />
      <Testimonials />
    </>
  )
}
