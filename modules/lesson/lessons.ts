export interface Lesson {
  slug: string;
  title: string;
  // Real, finished content vs. a header-only stub — read by
  // buildLessonMetadata (drives robots/noindex) and app/sitemap.ts (whether
  // the URL gets submitted at all). Defaults to false (stub) when omitted;
  // flip per-lesson as content lands rather than removing the default. See
  // docs/TODO.md's SEO section for why this stayed unwired for a while.
  indexed?: boolean;
}

export interface LessonPart {
  slug: string;
  title: string;
  lessons: Lesson[];
}

// Mirrors docs/LESSONS.md's sequencing — array order is the single source of
// truth for lesson order (prev/next pager, part grouping in the nav).
export const LESSON_PARTS: LessonPart[] = [
  {
    slug: 'foundations',
    title: 'Foundations',
    lessons: [
      {
        slug: 'intervals-and-root-note',
        title: 'Intervals and the Root Note',
        indexed: true,
      },
      { slug: 'triads', title: 'Triads', indexed: true },
      { slug: 'pentatonic', title: 'Pentatonic Scale', indexed: true },
      {
        slug: 'major-scale',
        title: 'Major Scale',
        indexed: true,
      },
      {
        slug: 'diatonic-harmony',
        title: 'Chords in a Key (Diatonic Harmony)',
        indexed: true,
      },
      {
        slug: 'relative-major-minor',
        title: 'Relative Major and Minor',
        indexed: true,
      },
      {
        slug: 'chord-progressions',
        title: 'Chord Progressions',
        indexed: true,
      },
      { slug: 'seventh-chords', title: '7th Chords', indexed: true },
    ],
  },
  {
    slug: 'learning-the-fretboard',
    title: 'Learning the Fretboard',
    lessons: [
      { slug: 'chord-shapes', title: 'Major Chord Shapes', indexed: true },
      {
        slug: 'minor-chord-shapes',
        title: 'Minor Chord Shapes',
        indexed: true,
      },
      {
        slug: 'four-note-chord-shapes',
        title: '4 Note Chord Shapes',
        indexed: true,
      },
      {
        slug: 'scale-positions-full-neck',
        title: 'Scale Positions Across the Neck',
        indexed: true,
      },
      { slug: 'hand-positions', title: 'Hand Positions', indexed: true },
      {
        slug: 'position-playing',
        title: 'Position Playing',
        indexed: true,
      },
    ],
  },
  {
    slug: 'more-chords',
    title: 'More Chords',
    lessons: [
      { slug: 'extended-chords', title: 'Extended Chords', indexed: true },
      {
        slug: 'secondary-dominants',
        title: 'Secondary Dominants',
        indexed: true,
      },
    ],
  },
  {
    slug: 'understanding-modes',
    title: 'Understanding Modes',
    lessons: [
      {
        slug: 'relative-vs-parallel-modes',
        title: 'Relative vs Parallel Modes',
        indexed: true,
      },
      {
        slug: 'comparing-modes',
        title: 'Comparing Modes',
        indexed: true,
      },
      {
        slug: 'primary-chords-in-every-mode',
        title: 'I, IV, and V in Every Mode',
        indexed: true,
      },
      { slug: 'mixing-modes', title: 'Mixing Modes', indexed: true },
    ],
  },
  {
    slug: 'chord-voicings',
    title: 'Chord Voicings',
    lessons: [
      {
        slug: 'four-note-voicings',
        title: '4 Note Voicings',
        indexed: true,
      },
      {
        slug: 'voicing-inversions',
        title: 'Voicing Inversions',
        indexed: true,
      },
      {
        slug: 'one-position-voicings',
        title: 'Voicings in One Position',
        indexed: true,
      },
    ],
  },
];

export interface FlatLesson extends Lesson {
  href: string;
  partSlug: string;
  partTitle: string;
}

// Flattened, ordered list — drives the prev/next pager and href lookups.
export const LESSONS: FlatLesson[] = LESSON_PARTS.flatMap((part) =>
  part.lessons.map((lesson) => ({
    ...lesson,
    href: `/lesson/${part.slug}/${lesson.slug}`,
    partSlug: part.slug,
    partTitle: part.title,
  })),
);

export function getLesson(
  partSlug: string,
  lessonSlug: string,
): FlatLesson | undefined {
  return LESSONS.find((l) => l.partSlug === partSlug && l.slug === lessonSlug);
}

export function getLessonPart(partSlug: string): LessonPart | undefined {
  return LESSON_PARTS.find((p) => p.slug === partSlug);
}
