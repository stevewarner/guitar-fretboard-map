export interface Lesson {
  slug: string;
  title: string;
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
      },
      { slug: 'triads', title: 'Triads' },
      { slug: 'pentatonic', title: 'Pentatonic Scale' },
      {
        slug: 'major-scale',
        title: 'Major Scale',
      },
      {
        slug: 'diatonic-harmony',
        title: 'Chords in a Key (Diatonic Harmony)',
      },
      { slug: 'relative-major-minor', title: 'Relative Major and Minor' },
      { slug: 'chord-progressions', title: 'Chord Progressions' },
      { slug: 'seventh-chords', title: '7th Chords' },
    ],
  },
  {
    slug: 'learning-the-fretboard',
    title: 'Learning the Fretboard',
    lessons: [
      { slug: 'chord-shapes', title: 'Major Chord Shapes' },
      { slug: 'minor-chord-shapes', title: 'Minor Chord Shapes' },
      {
        slug: 'four-note-chord-shapes',
        title: '4 Note Chord Shapes',
      },
      {
        slug: 'scale-positions-full-neck',
        title: 'Scale Positions Across the Neck',
      },
      { slug: 'hand-positions', title: 'Hand Positions' },
      {
        slug: 'position-playing',
        title: 'Position Playing',
      },
    ],
  },
  {
    slug: 'more-chords',
    title: 'More Chords',
    lessons: [
      { slug: 'extended-chords', title: 'Extended Chords' },
      { slug: 'secondary-dominants', title: 'Secondary Dominants' },
    ],
  },
  {
    slug: 'understanding-modes',
    title: 'Understanding Modes',
    lessons: [
      {
        slug: 'relative-vs-parallel-modes',
        title: 'Relative vs Parallel Modes',
      },
      {
        slug: 'comparing-modes',
        title: 'Comparing Modes',
      },
      {
        slug: 'primary-chords-in-every-mode',
        title: 'I, IV, and V in Every Mode',
      },
      { slug: 'mixing-modes', title: 'Mixing Modes' },
    ],
  },
  {
    slug: 'chord-voicings',
    title: 'Chord Voicings',
    lessons: [
      { slug: 'four-note-voicings', title: '4 Note Voicings' },
      { slug: 'voicing-inversions', title: 'Voicing Inversions' },
      { slug: 'one-position-voicings', title: 'Voicings in One Position' },
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
