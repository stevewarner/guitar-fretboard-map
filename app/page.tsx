import { Metadata } from 'next';
import Link from 'next/link';
import { Fretboard, Pattern } from '@/components/FretboardChartLegacy';
import { ChordPreviewCard } from '@/components/ChordPreviewCard';
import { ScalePreviewCard } from '@/components/ScalePreviewCard';
import { ButtonLink } from '@/components/Button';
import ChevronRightIcon from '@/svgs/chevron-right.svg';
import { HomeSection } from '@/modules/home/HomeSection';
import { PillTabs } from '@/modules/home/PillTabs';
import { getModeIntervals } from '@/modules/scale/utils/scaleUtils';
import { SCALE_SYSTEMS } from '@/modules/scale/data/systems';
import { SCALE_INTERVALS } from '@/modules/scale/data/scaleIntervals';
import { getShapesAtPosition } from '@/modules/chordv2/db/queries';
import { transposeShape } from '@/modules/chordv2/utils/transposeShape';
import { parseNote } from '@/app/utils/noteSpelling';
import { ACCENT_HEX } from '@/app/utils/constants';
import { LESSON_PARTS } from '@/modules/lesson/lessons';

// The Chords/Scales/Lessons sections below the hero follow the 2026-11
// homepage mockup (see CLAUDE.md's Design Philosophy section); the hero is
// kept from the previous design. Copy rule from that mockup: say what's on
// the site in plain words, no taglines.
const description =
  'Guitar theory lessons for guitarists who know tab but not the fretboard. Interactive chord and scale diagrams for every key and position.';

export const metadata: Metadata = {
  description,
  alternates: { canonical: '/' },
  openGraph: { description },
};

const numFrets = 13;

const ROOT_PC = 9; // A
const DEFAULT_SCALE_SYSTEM = 'major-scale';
const LESSONS_PER_CARD = 4;

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

type ChordCard = Awaited<ReturnType<typeof getCuratedChordCards>>[number];

function chordCards(cards: ChordCard[]) {
  return cards.map((chord) => (
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
  ));
}

// One tab per scale system, every mode in it at A, 6th string, 1st finger.
// Mode names only, and roots in the same black as every other note: these are
// previews of the scale shapes, not a lesson on where the root is.
const scaleTabs = SCALE_SYSTEMS.map((system) => ({
  slug: system.slug,
  label: system.displayName,
  content: system.modes.map((mode) => (
    <ScalePreviewCard
      key={mode.slug}
      variant="raised"
      className="w-36 shrink-0"
      href={`/scale/${system.slug}/${mode.slug}`}
      label={mode.pageTitle ?? mode.displayName}
      modeIntervals={getModeIntervals(
        SCALE_INTERVALS[mode.dbName ?? system.dbName],
        mode.degree,
      )}
      rootPc={ROOT_PC}
      rootColor="#000"
    />
  )),
}));

function LessonPartCard({
  partNumber,
  part,
}: {
  partNumber: number;
  part: (typeof LESSON_PARTS)[number];
}) {
  const shown = part.lessons.slice(0, LESSONS_PER_CARD);
  const hiddenCount = part.lessons.length - shown.length;
  return (
    <Link
      href={`/lesson/${part.slug}/${part.lessons[0].slug}`}
      className="flex w-60 shrink-0 flex-col gap-2.5 rounded-xl bg-surface-raised p-4 hover:bg-surface-sunken hover:no-underline sm:w-64"
    >
      <span className="text-xs font-semibold text-fg-secondary">
        Part {partNumber} · {part.lessons.length} lessons
      </span>
      <span className="text-lg font-bold leading-snug">{part.title}</span>
      <ol className="list-decimal pl-[18px] text-sm leading-relaxed text-fg-secondary">
        {shown.map((lesson) => (
          <li key={lesson.slug}>{lesson.title}</li>
        ))}
        {hiddenCount > 0 && (
          <li className="ml-[-18px] list-none">+ {hiddenCount} more</li>
        )}
      </ol>
    </Link>
  );
}

export default async function Home() {
  const [popularChordCards, openChordCards, seventhChordCards] =
    await Promise.all([
      getCuratedChordCards(POPULAR_CHORDS),
      getCuratedChordCards(OPEN_CHORDS),
      getCuratedChordCards(SEVENTH_CHORDS),
    ]);

  return (
    <div className="flex flex-col gap-14 pb-8 lg:gap-20">
      <header className="grid grid-cols-1 items-center gap-12 py-8 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:py-16">
        <div className="mx-auto max-w-md text-center lg:mx-0 lg:text-left">
          <h1 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">
            Guitar theory lessons taught through the fretboard diagram
          </h1>
          <p className="mt-5 max-w-sm text-base leading-relaxed text-fg-secondary lg:mx-0">
            Interactive chord and scale charts that update in place, not a
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

        <div className="min-w-0">
          <Fretboard
            numFrets={numFrets}
            showOpenNotes={false}
            aria-hidden="true"
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
        </div>
      </header>

      <HomeSection
        title="Chords"
        description="How to play a chord, the other places to play it on the neck, its inversions, and the scales it fits into."
        linkLabel="Browse chords"
        linkHref="/chord"
      >
        <PillTabs
          label="Chord group"
          tabs={[
            { label: 'Popular', content: chordCards(popularChordCards) },
            { label: 'Open', content: chordCards(openChordCards) },
            { label: 'Sevenths', content: chordCards(seventhChordCards) },
          ]}
        />
      </HomeSection>

      <HomeSection
        title="Scales"
        description="Scales and modes in any key and position, with the chords built from each one."
        linkLabel="Browse scales"
        linkHref="/scale"
      >
        <PillTabs
          label="Scale system"
          tabs={scaleTabs}
          defaultIndex={scaleTabs.findIndex(
            (tab) => tab.slug === DEFAULT_SCALE_SYSTEM,
          )}
        />
      </HomeSection>

      <HomeSection
        title="Lessons"
        description="Music theory for guitar, starting with intervals and working up to modes and chord voicings."
        linkLabel="Start with lesson 1"
        linkHref="/lesson"
      >
        <div className="flex flex-nowrap gap-3 overflow-x-auto p-0.5 pb-2">
          {LESSON_PARTS.map((part, i) => (
            <LessonPartCard key={part.slug} partNumber={i + 1} part={part} />
          ))}
        </div>
      </HomeSection>
    </div>
  );
}
