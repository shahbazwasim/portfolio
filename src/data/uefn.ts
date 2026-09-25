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
 * Concept art, rendered from code by scripts/concept-art.mjs (procedural
 * three.js scenes). None of it is a game screenshot, and the page captions it
 * as concept art — screenshots belong to PUBLISHED_ISLANDS alone.
 */
export type ConceptArt = {
  /** File stem in public/images/uefn/concept-art/, published at 800w and 1600w. */
  name: string
  alt: string
  caption: string
}

export const HERO_ART: ConceptArt = {
  name: 'hero',
  alt: 'Concept art: four low-poly floating islands above the clouds — a box-fight arena, a tycoon village, a forest camp and a puzzle plaza',
  caption: 'The four concept builds, as islands',
}

/**
 * Verse concept builds, shown below the published islands. Each borrows its
 * illustrations and Verse excerpt from the matching case study; the copy here
 * describes them as what they are — concepts, not published islands.
 */
export const VERSE_CONCEPTS = [
  {
    slug: 'tidebreak-ranked-arena',
    title: 'Ranked box-fight round engine',
    note: 'Concept for a ranked 1v1–4v4 box-fight island: every way a live round can end — a team wipe, a leaver, the clock — is one branch of a Verse race, with a skill rating kept in Verse persistence.',
    art: {
      name: 'tidebreak',
      alt: 'Concept art: a floating island with a neon box-fight arena, team spawn pads, a scoreboard and the storm ring',
      caption: 'Ranked box-fight arena',
    },
    detail: {
      name: 'tidebreak-detail',
      alt: 'Concept art: close-up of the arena — build pieces in team colours under a floating scoreboard',
      caption: 'Arena close-up: builds, spawn beams and the scoreboard',
    },
  },
  {
    slug: 'nightjar-ai-director',
    title: 'AI director for co-op survival',
    note: 'Concept for a co-op survival island where a Verse director paces spawns from squad stress through build-up, peak and relief, instead of fixed wave tables.',
    art: {
      name: 'nightjar',
      alt: 'Concept art: a forest island at night — a camp under a watchtower searchlight, red spawn beacons in the trees and a lit trail',
      caption: 'Co-op survival camp at night',
    },
    detail: {
      name: 'nightjar-detail',
      alt: 'Concept art: close-up of the camp — campfire, tents and the searchlight sweeping the treeline',
      caption: 'The hold point under the searchlight',
    },
  },
  {
    slug: 'pinegrove-tycoon',
    title: 'Tycoon save schema with migrations',
    note: 'Concept for a tycoon whose player saves are a versioned persistable class, so every update migrates progress forward instead of wiping it.',
    art: {
      name: 'pinegrove',
      alt: 'Concept art: a tycoon island — six plots from an empty lot to a gold monument, linked by conveyors to a bank',
      caption: 'Tycoon plots, from empty lot to monument',
    },
    detail: {
      name: 'pinegrove-detail',
      alt: 'Concept art: close-up of the bank and its coins, the conveyors and a plot mid-upgrade',
      caption: 'Bank, conveyors and an upgrade in progress',
    },
  },
  {
    slug: 'orrery-learning-island',
    title: 'Physics puzzle-room controller',
    note: 'Concept for a physics-learning island: rooms run generated lesson data, and the hint ladder relies on Verse failure semantics instead of bounds checks.',
    art: {
      name: 'orrery',
      alt: 'Concept art: a twilight puzzle island — a brass orrery on a hex plaza, a laser bounced off mirrors and a launch arc',
      caption: 'Physics puzzle plaza',
    },
    detail: {
      name: 'orrery-detail',
      alt: 'Concept art: close-up of the orrery, the laser puzzle and the pressure plates',
      caption: 'The orrery and the laser puzzle',
    },
  },
] as const satisfies readonly { slug: string; title: string; note: string; art: ConceptArt; detail: ConceptArt }[]
