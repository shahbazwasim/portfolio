/**
 * ── ACTION REQUIRED ─────────────────────────────────────────────────────────
 * These are PLACEHOLDERS, not real quotes, and the section is hidden until you
 * replace them.
 *
 * Fill this file with your genuine LinkedIn recommendations:
 *   1. linkedin.com/in/shahbazwasim → "Recommendations" → "Received"
 *   2. Copy each recommendation's text, and the author's name, title and company
 *   3. Replace the entries below and set `published: true`
 *
 * Real recommendations from named people carry weight precisely because they can
 * be verified — a reader can click through to the profile. Invented ones can't,
 * and a hiring manager who checks will notice. Leave the section hidden rather
 * than shipping quotes nobody said.
 * ───────────────────────────────────────────────────────────────────────────
 */

export type Testimonial = {
  quote: string
  author: string
  title: string
  company: string
  /** Link to the recommender's LinkedIn profile so the quote is verifiable. */
  profileUrl?: string
  avatarUrl?: string
}

/** Flip to true once real recommendations are in place. */
export const TESTIMONIALS_PUBLISHED = false

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'Paste a real LinkedIn recommendation here.',
    author: 'Recommender name',
    title: 'Their job title',
    company: 'Their company',
    profileUrl: '',
  },
  {
    quote: 'Paste a second real LinkedIn recommendation here.',
    author: 'Recommender name',
    title: 'Their job title',
    company: 'Their company',
    profileUrl: '',
  },
  {
    quote: 'Paste a third real LinkedIn recommendation here.',
    author: 'Recommender name',
    title: 'Their job title',
    company: 'Their company',
    profileUrl: '',
  },
]

/** The home page renders the testimonials band only when this returns true. */
export function hasPublishedTestimonials() {
  return TESTIMONIALS_PUBLISHED && TESTIMONIALS.length > 0
}
