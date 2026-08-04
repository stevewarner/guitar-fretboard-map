import { Metadata } from 'next';
import Link from 'next/link';
import { Fretboard, Pattern } from '@/components/FretboardChartLegacy';
import { CardRow } from '@/components/CardRow';
import { ChordPreviewCard } from '@/components/ChordPreviewCard';
import { ScalePreviewCard } from '@/components/ScalePreviewCard';
import { getModeIntervals } from '@/modules/scale/utils/scaleUtils';
import { getShapesAtPosition } from '@/modules/chordv2/db/queries';
import { transposeShape } from '@/modules/chordv2/utils/transposeShape';
import { parseNote } from '@/app/utils/noteSpelling';
import ChevronRightIcon from '@/svgs/chevron-right.svg';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
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
// across all three rows, increasing harmonic complexity per row. Open picks
// the shape a guitarist actually recognizes as "the open chord" for that
// root; Triad and Seventh deliberately share one consistent string/position
// per string group (C/D/E on string 5, F/G/A on string 6) so the shapes read
// as one connected position across the row, not unrelated voicings. Each
// spec resolves via getShapesAtPosition, the same exact-position lookup the
// chord detail page uses, so the diagram and href always match a real seeded
// shape instead of a hand-typed guess.
type CuratedChordSpec = {
  symbol: string;
  rootNote: string;
  rootString: number;
  rootFinger: number;
};

const OPEN_CHORDS: CuratedChordSpec[] = [
  { symbol: 'maj', rootNote: 'C', rootString: 5, rootFinger: 3 },
  { symbol: 'm', rootNote: 'D', rootString: 4, rootFinger: 0 },
  { symbol: 'm', rootNote: 'E', rootString: 6, rootFinger: 0 },
  { symbol: 'maj', rootNote: 'F', rootString: 6, rootFinger: 1 },
  { symbol: 'maj', rootNote: 'G', rootString: 6, rootFinger: 3 },
  { symbol: 'm', rootNote: 'A', rootString: 5, rootFinger: 0 },
];

const TRIAD_CHORDS: CuratedChordSpec[] = [
  { symbol: 'maj', rootNote: 'C', rootString: 5, rootFinger: 1 },
  { symbol: 'm', rootNote: 'D', rootString: 5, rootFinger: 1 },
  { symbol: 'm', rootNote: 'E', rootString: 5, rootFinger: 1 },
  { symbol: 'maj', rootNote: 'F', rootString: 6, rootFinger: 1 },
  { symbol: 'maj', rootNote: 'G', rootString: 6, rootFinger: 1 },
  { symbol: 'm', rootNote: 'A', rootString: 6, rootFinger: 1 },
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
        href: `/chord/${spec.symbol}?root=${spec.rootNote}&string=${spec.rootString}&position=${spec.rootFinger}`,
        tab: transposed.tab,
        startFret: transposed.startFret,
        numFrets: transposed.numFrets,
      },
    ];
  });
}

export default async function Home() {
  const [openChordCards, triadChordCards, seventhChordCards] =
    await Promise.all([
      getCuratedChordCards(OPEN_CHORDS),
      getCuratedChordCards(TRIAD_CHORDS),
      getCuratedChordCards(SEVENTH_CHORDS),
    ]);

  return (
    <>
      <header className="flex flex-row flex-wrap items-center justify-between md:flex-nowrap">
        <div className="mx-auto mb-8 min-w-[45%] max-w-md text-center md:my-0 lg:mx-0 lg:flex-auto lg:px-4 lg:py-32 lg:text-left">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Learn chords and scales across the fretboard
          </h1>
          <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
            <Link
              href="/chord"
              className="rounded-md bg-accent px-6 py-3 text-lg font-semibold text-accent-fg shadow-sm hover:bg-accent-hover"
            >
              See all chords
            </Link>
            <Link href="/about" className="font-semibold leading-6">
              <span className="flex items-center gap-1">
                Learn more
                <ChevronRightIcon height={16} width={16} aria-hidden="true" />
              </span>
            </Link>
          </div>
        </div>

        <Fretboard
          numFrets={numFrets}
          showOpenNotes={false}
          styles="m-4 md:mx-0"
          title="Guitar fretboard diagram highlighting the minor pentatonic scale pattern"
        >
          <path
            d="M 52 380 C 500 380 500 20 1252 20"
            stroke="#FF0000"
            strokeOpacity="0.7"
            strokeWidth="40"
            strokeLinecap="round"
            fill="transparent"
          />
          {/* <Pattern
            // nested array for scales
            // full major scale
            tab={[
              [0, 2, 4, 5, 7, 9, 11, 12],
              [0, 2, 4, 6, 7, 9, 11, 12],
              [1, 2, 4, 6, 7, 9, 11],
              [1, 2, 4, 6, 8, 9, 11],
              [0, 2, 4, 5, 7, 9, 10, 12],
              [0, 2, 4, 5, 7, 9, 11, 12],
            ]}
            // tab={[0, 2, 2, 1, 0, 12]}
            fillColor="#000"
          /> */}
          <Pattern
            // pentatonic
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
          {/* <Pattern
            // chord tones 1 - 3 - 5
            tab={[
              [0, 4, 7, 12],
              [2, 6, 7, 11],
              [2, 6, 9],
              [1, 4, 9],
              [0, 5, 9, 12],
              [0, 4, 7, 12],
            ]}
            fillColor="#2200ff"
          /> */}
          {/* <Pattern
            // root
            tab={[[0, 12], [7], [2], [9], [5], [0, 12]]}
            fillColor="#ff0000"
          /> */}
        </Fretboard>
      </header>
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2>
            <Link href="/chord">Chord Library</Link>
          </h2>
          <p className="text-sm text-fg-secondary">
            Browse chord shapes by quality and voicing in any key.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <h3>Open Chords</h3>
          <CardRow label="Open Chords">
            {openChordCards.map((chord) => (
              <ChordPreviewCard
                key={chord.label}
                href={chord.href}
                label={chord.label}
                tab={chord.tab}
                startFret={chord.startFret}
                numFrets={chord.numFrets}
                className="w-32 shrink-0"
              />
            ))}
          </CardRow>
        </div>
        <div className="flex flex-col gap-4">
          <h3>Triad Chords</h3>
          <CardRow label="Triad Chords">
            {triadChordCards.map((chord) => (
              <ChordPreviewCard
                key={chord.label}
                href={chord.href}
                label={chord.label}
                tab={chord.tab}
                startFret={chord.startFret}
                numFrets={chord.numFrets}
                className="w-32 shrink-0"
              />
            ))}
          </CardRow>
        </div>
        <div className="flex flex-col gap-4">
          <h3>Seventh Chords</h3>
          <CardRow label="Seventh Chords">
            {seventhChordCards.map((chord) => (
              <ChordPreviewCard
                key={chord.label}
                href={chord.href}
                label={chord.label}
                tab={chord.tab}
                startFret={chord.startFret}
                numFrets={chord.numFrets}
                className="w-32 shrink-0"
              />
            ))}
          </CardRow>
        </div>
      </section>
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2>
            <Link href="/scale/major-scale/ionian">Scale Explorer</Link>
          </h2>
          <p className="text-sm text-fg-secondary">
            See any mode or scale across the full neck in your chosen key.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <h3>Modes of the Major Scale</h3>
          <CardRow label="Modes of the Major Scale">
            {MAJOR_SCALE_MODES.map((mode) => (
              <ScalePreviewCard
                key={mode.slug}
                className="w-32 shrink-0"
                href={`/scale/major-scale/${mode.slug}`}
                label={mode.displayName}
                modeIntervals={getModeIntervals(
                  MAJOR_SCALE_INTERVALS,
                  mode.degree,
                )}
                rootPc={ROOT_PC}
              />
            ))}
          </CardRow>
        </div>
        <div className="flex flex-col gap-4">
          <h3>Pentatonic Scale</h3>
          <CardRow label="Pentatonic Scale">
            {PENTATONIC_SCALES.map((scale) => (
              <ScalePreviewCard
                key={scale.slug}
                className="w-32 shrink-0"
                href={`/scale/pentatonic/${scale.slug}`}
                label={scale.displayName}
                modeIntervals={getModeIntervals(
                  MAJOR_PENTATONIC_INTERVALS,
                  scale.degree,
                )}
                rootPc={ROOT_PC}
              />
            ))}
          </CardRow>
        </div>
      </section>
    </>
  );
}
