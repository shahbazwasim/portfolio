/**
 * Content for the unlisted UEFN page (/uefn) — linked directly, never from
 * the header menu.
 *
 * Only add an island once it is published and live: the code must open in
 * Fortnite, and the image must be a real in-game screenshot saved under
 * public/images/uefn/. Anyone can check a code in seconds, so this list is
 * worth exactly as much as its accuracy.
 */

export type PublishedIsland = {
  title: string
  /** Island code as shown in the Creator Portal, e.g. 1234-5678-9012. */
  code: string
  genre: string
  summary: string
  /** Real in-game screenshot (16:9), e.g. /images/uefn/my-island.webp. */
  image: string
  /** ISO date the island went live. */
  published: string
}

/** Public creator page, e.g. https://www.fortnite.com/@yourname — null until it exists. */
export const CREATOR_PROFILE: string | null = null

export const PUBLISHED_ISLANDS: PublishedIsland[] = []

/**
 * Verse concept builds, shown below the published islands. Each borrows its
 * illustration and Verse excerpt from the matching case study; the copy here
 * describes them as what they are — concepts, not published islands.
 */
export const VERSE_CONCEPTS = [
  {
    slug: 'tidebreak-ranked-arena',
    title: 'Ranked box-fight round engine',
    note: 'Concept for a ranked 1v1–4v4 box-fight island: every way a live round can end — a team wipe, a leaver, the clock — is one branch of a Verse race, with a skill rating kept in Verse persistence.',
  },
  {
    slug: 'nightjar-ai-director',
    title: 'AI director for co-op survival',
    note: 'Concept for a co-op survival island where a Verse director paces spawns from squad stress through build-up, peak and relief, instead of fixed wave tables.',
  },
  {
    slug: 'pinegrove-tycoon',
    title: 'Tycoon save schema with migrations',
    note: 'Concept for a tycoon whose player saves are a versioned persistable class, so every update migrates progress forward instead of wiping it.',
  },
  {
    slug: 'orrery-learning-island',
    title: 'Physics puzzle-room controller',
    note: 'Concept for a physics-learning island: rooms run generated lesson data, and the hint ladder relies on Verse failure semantics instead of bounds checks.',
  },
] as const
