export interface Lesson {
  slug: string;
  title: string;
  // Real, finished content vs. a header-only stub — read by
  // buildLessonMetadata (drives robots/noindex) and app/sitemap.ts (whether
  // the URL gets submitted at all). Defaults to false (stub) when omitted;
  // flip per-lesson as content lands rather than removing the default. See
  // docs/TODO.md's SEO section for why this stayed unwired for a while.
  indexed?: boolean;
  // One sentence, same voice as the lesson prose itself (docs/STYLE_GUIDE.md).
  // Single source of truth for the meta description (buildLessonMetadata)
  // and the LearningResource JSON-LD description (LessonHeader) — same
  // pattern as modules/scale/data/systems.ts's per-mode `description`. Only
  // set on indexed (real-content) lessons; a stub has nothing accurate to
  // describe yet.
  description?: string;
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
        description:
          'Introduces interval numbers 1 through 7 and the root note, the two ideas every other lesson in this course builds on.',
      },
      {
        slug: 'triads',
        title: 'Triads',
        indexed: true,
        description:
          'Builds major and minor triads from intervals 1, 3, 5 and 1, b3, 5, and shows why a single half step separates the two sounds.',
      },
      {
        slug: 'pentatonic',
        title: 'Pentatonic Scale',
        indexed: true,
        description:
          'Shows the major and minor pentatonic scales as 5 of the 7 scale tones, and connects all 5 fretboard positions into one continuous map.',
      },
      {
        slug: 'major-scale',
        title: 'Major Scale',
        indexed: true,
        description:
          'Adds the 2 notes pentatonic leaves out to build the full 7-note major and minor scale.',
      },
      {
        slug: 'diatonic-harmony',
        title: 'Chords in a Key (Diatonic Harmony)',
        indexed: true,
        description:
          'Builds a triad on every degree of the major scale and names the resulting I ii iii IV V vi vii° chord sequence.',
      },
      {
        slug: 'relative-major-minor',
        title: 'Relative Major and Minor',
        indexed: true,
        description:
          'Shows that a major key and its relative minor share the same 7 notes, just starting from a different degree.',
      },
      {
        slug: 'chord-progressions',
        title: 'Chord Progressions',
        indexed: true,
        description:
          'Writes chord progressions by Roman numeral instead of letter name, so the same progression works in any key.',
      },
      {
        slug: 'seventh-chords',
        title: '7th Chords',
        indexed: true,
        description:
          'Stacks a 4th note onto a triad to build maj7, m7, dominant 7, and m7b5 chords, one for each scale degree.',
      },
    ],
  },
  {
    slug: 'learning-the-fretboard',
    title: 'Learning the Fretboard',
    lessons: [
      {
        slug: 'chord-shapes',
        title: 'Major Chord Shapes',
        indexed: true,
        description:
          'Plays the same major chord in multiple positions across the neck, anchored by root string and root finger.',
      },
      {
        slug: 'minor-chord-shapes',
        title: 'Minor Chord Shapes',
        indexed: true,
        description:
          'Applies the same root-string, root-finger position system to minor chord shapes.',
      },
      {
        slug: 'four-note-chord-shapes',
        title: '4 Note Chord Shapes',
        indexed: true,
        description:
          'Extends the root-string, root-finger position system from triads to 4-note 7th chord voicings.',
      },
      {
        slug: 'scale-positions-full-neck',
        title: 'Scale Positions Across the Neck',
        indexed: true,
        description:
          'Connects all 5 major scale positions into one continuous pattern across the entire fretboard.',
      },
      {
        slug: 'hand-positions',
        title: 'Hand Positions',
        indexed: true,
        description:
          'Defines a fretboard position by root string and root finger, a more complete alternative to the CAGED system.',
      },
      {
        slug: 'position-playing',
        title: 'Position Playing',
        indexed: true,
        description:
          'Shows the chord shape already embedded inside each scale position, connecting melody and harmony in the same area of the neck.',
      },
    ],
  },
  {
    slug: 'more-chords',
    title: 'More Chords',
    lessons: [
      {
        slug: 'extended-chords',
        title: 'Extended Chords',
        indexed: true,
        description:
          'Stacks 9ths, 11ths, and 13ths beyond the 7th chord, and covers when each extension is worth reaching for.',
      },
      {
        slug: 'secondary-dominants',
        title: 'Secondary Dominants',
        indexed: true,
        description:
          "Uses a chord's own V7 to create motion toward it, borrowed briefly from outside the current key.",
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
        description:
          'Separates relative modes, which share notes from different starting points, from parallel modes, which share a root with a different formula.',
      },
      {
        slug: 'comparing-modes',
        title: 'Comparing Modes',
        indexed: true,
        description:
          'Orders the 7 modes from brightest to darkest by which scale degrees are raised or lowered.',
      },
      {
        slug: 'primary-chords-in-every-mode',
        title: 'I, IV, and V in Every Mode',
        indexed: true,
        description:
          "Plays each mode's I, IV, and V chords, covering all 7 scale tones and showing how their qualities shift mode to mode.",
      },
      {
        slug: 'mixing-modes',
        title: 'Mixing Modes',
        indexed: true,
        description:
          'Borrows chords from parallel modes, using a 12-bar blues progression to show how modal mixing creates tension.',
      },
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
        description:
          "Arranges a 7th chord's 4 notes as root, 5th, 7th, 3rd across 4 strings, the same movable shape reaching every root.",
      },
      {
        slug: 'voicing-inversions',
        title: 'Voicing Inversions',
        indexed: true,
        description:
          'Inverts the same 1-5-7-3 voicing so each chord tone takes a turn in the bass, without leaving the same 4 strings.',
      },
      {
        slug: 'one-position-voicings',
        title: 'Voicings in One Position',
        indexed: true,
        description:
          'Uses the 4 inversions of a voicing to play a full chord progression without shifting hand position.',
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
