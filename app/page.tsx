import { Metadata } from 'next';
import Link from 'next/link';
import { Fretboard, Pattern } from '@/components/FretboardChartLegacy';
import { ChordPreviewCard } from '@/components/ChordPreviewCard';
import { ScalePreviewCard } from '@/components/ScalePreviewCard';
import { ButtonLink } from '@/components/Button';
import { Panel } from '@/components/Panel';
import ChevronRightIcon from '@/svgs/chevron-right.svg';
import { ShowcaseSection } from '@/modules/home/ShowcaseSection';
import { getModeIntervals } from '@/modules/scale/utils/scaleUtils';
import {
  getShapesAtPosition,
  getAllQualities,
} from '@/modules/chordv2/db/queries';
import { transposeShape } from '@/modules/chordv2/utils/transposeShape';
import { parseNote } from '@/app/utils/noteSpelling';
import { ACCENT_HEX } from '@/app/utils/constants';
import { LESSON_PARTS, LESSONS } from '@/modules/lesson/lessons';

// Hero + the 3 showcase sections below it (Lessons/Chords/Scales) are a
// deliberate exception to the site's normal plain styling — see CLAUDE.md's
// Design Philosophy section. Went through 3 shapes: FEATURE_PLAN.md's plain
// text-only pillar cards, then real preview cards restored in plain style,
// then this — a bigger, tab-filtered showcase per subdirectory, modeled on
// a design mockup provided directly, because the plain-text pillars read as
// SEO filler with nothing a visitor actually clicks.
const description =
  'Guitar theory lessons for guitarists who know tab but not the fretboard. Interactive chord and scale diagrams for every key and position.';

export const metadata: Metadata = {
  description,
  alternates: { canonical: '/' },
  openGraph: { description },
};

const numFrets = 13;

const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const ROOT_PC = 9; // A

const MAJOR_SCALE_MODES = [
  { slug: 'ionian', displayName: 'Ionian', degree: 0 },
  { slug: 'dorian', displayName: 'Dorian', degree: 1 },
  { slug: 'phrygian', displayName: 'Phrygian', degree: 2 },
  { slug: 'lydian', displayName: 'Lydian', degree: 3 },
  { slug: 'mixolydian', displayName: 'Mixolydian', degree: 4 },
  { slug: 'aeolian', displayName: 'Aeolian', degree: 5 },
  { slug: 'locrian', displayName: 'Locrian', degree: 6 },
];

// Minor pentatonic is the mode of major pentatonic starting on its last
// degree (the relative-minor relationship), same rotation math as the
// major scale modes above.
const MAJOR_PENTATONIC_INTERVALS = [0, 2, 4, 7, 9];

const PENTATONIC_SCALES = [
  { slug: 'major', displayName: 'Major Pentatonic', degree: 0 },
  { slug: 'minor', displayName: 'Minor Pentatonic', degree: 4 },
];

// Hand-picked (quality, root, string, position) triples — same 6 roots
// across all three tabs, increasing harmonic complexity per tab. Popular
// picks the shape a guitarist actually recognizes as "the open chord" for
// that root; Sevenths deliberately shares one consistent string/position
// per string group (C/D/E on string 5, F/G/A on string 6) so the shapes read
// as one connected position, not unrelated voicings. Each spec resolves via
// getShapesAtPosition, the same exact-position lookup the chord detail page
// uses, so the diagram and href always match a real seeded shape instead of
// a hand-typed guess.
type CuratedChordSpec = {
  symbol: string;
  rootNote: string;
  rootString: number;
  rootFinger: number;
};

const POPULAR_CHORDS: CuratedChordSpec[] = [
  { symbol: 'maj', rootNote: 'C', rootString: 5, rootFinger: 3 },
  { symbol: 'm', rootNote: 'D', rootString: 4, rootFinger: 0 },
  { symbol: 'm', rootNote: 'E', rootString: 6, rootFinger: 0 },
  { symbol: 'maj', rootNote: 'F', rootString: 6, rootFinger: 1 },
  { symbol: 'maj', rootNote: 'G', rootString: 6, rootFinger: 3 },
  { symbol: 'm', rootNote: 'A', rootString: 5, rootFinger: 0 },
];

const OPEN_CHORDS: CuratedChordSpec[] = [
  { symbol: 'maj', rootNote: 'C', rootString: 5, rootFinger: 3 },
  { symbol: 'm', rootNote: 'D', rootString: 4, rootFinger: 0 },
  { symbol: 'm', rootNote: 'E', rootString: 6, rootFinger: 0 },
  { symbol: '7', rootNote: 'G', rootString: 6, rootFinger: 3 },
  { symbol: 'm7', rootNote: 'A', rootString: 5, rootFinger: 0 },
  { symbol: 'maj7', rootNote: 'F', rootString: 6, rootFinger: 1 },
];

const SEVENTH_CHORDS: CuratedChordSpec[] = [
  { symbol: 'maj7', rootNote: 'C', rootString: 5, rootFinger: 1 },
  { symbol: 'm7', rootNote: 'D', rootString: 5, rootFinger: 1 },
  { symbol: 'm7', rootNote: 'E', rootString: 5, rootFinger: 1 },
  { symbol: 'maj7', rootNote: 'F', rootString: 6, rootFinger: 2 },
  { symbol: '7', rootNote: 'G', rootString: 6, rootFinger: 1 },
  { symbol: 'm7', rootNote: 'A', rootString: 6, rootFinger: 1 },
];

// Major chords display as the bare root letter (C, not Cmaj) to match how
// guitarists actually read chord charts; every other quality suffixes its
// symbol onto the root note.
function chordLabel(rootNote: string, symbol: string): string {
  return symbol === 'maj' ? rootNote : `${rootNote}${symbol}`;
}

async function getCuratedChordCards(specs: CuratedChordSpec[]) {
  const results = await Promise.all(
    specs.map(async (spec) => {
      const rootPc = parseNote(spec.rootNote).pc;
      const shapes = await getShapesAtPosition(
        spec.rootString,
        spec.rootFinger,
        rootPc,
      );
      const shape = shapes.find((s) => s.quality_symbol === spec.symbol);
      return { spec, rootPc, shape };
    }),
  );

  return results.flatMap(({ spec, rootPc, shape }) => {
    if (!shape) return [];

    const transposed = transposeShape(
      shape.tab_relative,
      shape.root_string,
      spec.rootFinger,
      rootPc,
    );
    if (!transposed) return [];

    return [
      {
        label: chordLabel(spec.rootNote, spec.symbol),
        sublabel: shape.quality_full_name.toLowerCase(),
        href: `/chord/${spec.symbol}?root=${spec.rootNote}&string=${spec.rootString}&position=${spec.rootFinger}`,
        tab: transposed.tab,
        startFret: transposed.startFret,
        numFrets: transposed.numFrets,
      },
    ];
  });
}

function LessonPreviewCard({
  href,
  label,
  sublabel,
}: {
  href: string;
  label: string;
  sublabel?: string;
}) {
  return (
    <Link
      href={href}
      className="flex w-48 shrink-0 flex-col justify-center gap-1 rounded-xl bg-surface-raised px-4 py-6 hover:bg-surface-sunken"
    >
      <span className="text-base font-bold">{label}</span>
      {sublabel && (
        <span className="text-sm text-fg-secondary">{sublabel}</span>
      )}
    </Link>
  );
}

export default async function Home() {
  const [popularChordCards, openChordCards, seventhChordCards, qualities] =
    await Promise.all([
      getCuratedChordCards(POPULAR_CHORDS),
      getCuratedChordCards(OPEN_CHORDS),
      getCuratedChordCards(SEVENTH_CHORDS),
      getAllQualities(),
    ]);

  return (
    <>
      <header className="grid grid-cols-1 items-center gap-12 py-8 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:py-16">
        <div className="mx-auto max-w-md text-center lg:mx-0 lg:text-left">
          <h1 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">
            Guitar theory lessons taught through the fretboard diagram
          </h1>
          <p className="mt-5 max-w-sm text-base leading-relaxed text-fg-secondary lg:mx-0">
            Interactive chord and scale charts that update as you read, not a
            separate reference to look up.
          </p>
          <div className="mt-8 flex items-center justify-center gap-6 lg:justify-start">
            <ButtonLink href="/lesson" pill className="text-base">
              Start learning
              <ChevronRightIcon width={16} height={16} aria-hidden="true" />
            </ButtonLink>
            <Link href="/chord" className="font-semibold leading-6">
              Browse chords
            </Link>
          </div>
        </div>

        <Panel className="min-w-0 sm:p-8">
          <Fretboard
            numFrets={numFrets}
            showOpenNotes={false}
            title="Guitar fretboard diagram highlighting the minor pentatonic scale pattern"
          >
            <path
              d="M 52 380 C 500 380 500 20 1252 20"
              stroke={ACCENT_HEX}
              strokeOpacity="0.55"
              strokeWidth="40"
              strokeLinecap="round"
              fill="transparent"
            />
            <Pattern
              tab={[
                [0, 2, 4, 7, 9, 12],
                [2, 4, 7, 9, 11],
                [2, 4, 6, 9, 11],
                [1, 4, 6, 9, 11],
                [0, 2, 5, 7, 9, 12],
                [0, 2, 4, 7, 9, 12],
              ]}
              fillColor="#000"
            />
            <Pattern tab={[[0], [], [], [], [], [12]]} fillColor="#2563EB" />
          </Fretboard>
        </Panel>
      </header>

      <div className="divide-y divide-line">
        <ShowcaseSection
          sectionLabel="CHORDS"
          headline={['Every voicing,', 'every position.']}
          description={`${qualities.length} chord qualities across all 12 roots, each mapped to the shapes that actually fall under your hand.`}
          ctaLabel="Browse the chord database"
          ctaHref="/chord"
          tabs={[
            {
              label: 'Popular',
              content: popularChordCards.map((chord) => (
                <ChordPreviewCard
                  key={chord.label}
                  variant="raised"
                  href={chord.href}
                  label={chord.label}
                  sublabel={chord.sublabel}
                  tab={chord.tab}
                  startFret={chord.startFret}
                  numFrets={chord.numFrets}
                  className="w-36 shrink-0"
                />
              )),
            },
            {
              label: 'Open',
              content: openChordCards.map((chord) => (
                <ChordPreviewCard
                  key={chord.label}
                  variant="raised"
                  href={chord.href}
                  label={chord.label}
                  sublabel={chord.sublabel}
                  tab={chord.tab}
                  startFret={chord.startFret}
                  numFrets={chord.numFrets}
                  className="w-36 shrink-0"
                />
              )),
            },
            {
              label: 'Sevenths',
              content: seventhChordCards.map((chord) => (
                <ChordPreviewCard
                  key={chord.label}
                  variant="raised"
                  href={chord.href}
                  label={chord.label}
                  sublabel={chord.sublabel}
                  tab={chord.tab}
                  startFret={chord.startFret}
                  numFrets={chord.numFrets}
                  className="w-36 shrink-0"
                />
              )),
            },
          ]}
        />

        <ShowcaseSection
          mirror
          sectionLabel="SCALES"
          headline={['Every mode,', 'every key.']}
          description="All 7 modes of the major scale, plus major and minor pentatonic, mapped across the full neck in any key."
          ctaLabel="Explore the scale library"
          ctaHref="/scale"
          tabs={[
            {
              label: 'Major Scale Modes',
              content: MAJOR_SCALE_MODES.map((mode) => (
                <ScalePreviewCard
                  key={mode.slug}
                  variant="raised"
                  className="w-36 shrink-0"
                  href={`/scale/major-scale/${mode.slug}`}
                  label={mode.displayName}
                  sublabel="mode"
                  modeIntervals={getModeIntervals(
                    MAJOR_SCALE_INTERVALS,
                    mode.degree,
                  )}
                  rootPc={ROOT_PC}
                />
              )),
            },
            {
              label: 'Pentatonic',
              content: PENTATONIC_SCALES.map((scale) => (
                <ScalePreviewCard
                  key={scale.slug}
                  variant="raised"
                  className="w-36 shrink-0"
                  href={`/scale/pentatonic/${scale.slug}`}
                  label={scale.displayName}
                  sublabel="scale"
                  modeIntervals={getModeIntervals(
                    MAJOR_PENTATONIC_INTERVALS,
                    scale.degree,
                  )}
                  rootPc={ROOT_PC}
                />
              )),
            },
          ]}
        />

        <ShowcaseSection
          sectionLabel="LESSONS"
          headline={['Structured lessons,', 'taught on the fretboard.']}
          description={`${LESSONS.length} lessons across ${LESSON_PARTS.length} parts, from intervals and the root note to modes and voicings — each one taught through an interactive diagram.`}
          ctaLabel="Start learning"
          ctaHref="/lesson"
          tabs={LESSON_PARTS.map((part) => ({
            label: part.title,
            content: part.lessons.map((lesson) => (
              <LessonPreviewCard
                key={lesson.slug}
                href={`/lesson/${part.slug}/${lesson.slug}`}
                label={lesson.title}
              />
            )),
          }))}
        />
      </div>
    </>
  );
}
