import Link from 'next/link';
import { LessonHeader } from '@/modules/lesson/LessonHeader';
import { buildLessonMetadata } from '@/modules/lesson/buildLessonMetadata';
import {
  Fretboard,
  Pattern,
  describeChartForScreenReaders,
} from '@/components/FretboardChart';
import { NOTE_TO_PC } from '@/app/utils/constants';
import {
  MAJOR_SCALE_INTERVALS,
  getDiatonicChords,
} from '@/modules/scale/utils/scaleUtils';
import {
  getShapesBySymbols,
  type DbChordShape,
} from '@/modules/chordv2/db/queries';
import { transposeShape } from '@/modules/chordv2/utils/transposeShape';

export const metadata = buildLessonMetadata('more-chords', 'extended-chords');

const KEY_OF_C = 'C';

interface Extension {
  symbol: string;
  rootString: number;
  rootFinger: number;
}

// Beyond the plain diatonic 7th, the qualities this lesson calls out per
// degree — curated, not exhaustive (every degree can theoretically extend
// well past this; these are the ones worth naming individually without
// overwhelming a reader still on the "beyond the 7th" idea itself). Some are
// unique to one degree in the major scale: dominant 7 only occurs at V,
// m7b5 only at vii, maj#11 only at IV. Kept deliberately short — there's a
// real appetite for going further (6/9/11/13 chords, altered dominants),
// but that's a follow-up lesson's job, not this one's.
//
// Root on the 5th string throughout, except maj#11, which uses its
// well-known, easy-to-remember string-6 voicing (a shape specifically
// pinned to F, this lesson's IV chord — see ChordCard's root_pc-matching
// lookup below) over the generic moveable string-5 shape.
const DEGREE_EXTENSIONS: Record<number, Extension[]> = {
  1: [
    { symbol: 'sus4', rootString: 5, rootFinger: 1 },
    { symbol: 'maj7', rootString: 5, rootFinger: 1 },
  ],
  2: [
    { symbol: 'm6', rootString: 5, rootFinger: 2 },
    { symbol: 'm7', rootString: 5, rootFinger: 1 },
    { symbol: 'm9', rootString: 5, rootFinger: 3 },
  ],
  3: [{ symbol: 'm7', rootString: 5, rootFinger: 1 }],
  4: [
    { symbol: 'maj#11', rootString: 6, rootFinger: 1 },
    { symbol: 'maj7', rootString: 5, rootFinger: 1 },
  ],
  5: [
    { symbol: 'sus4', rootString: 5, rootFinger: 1 },
    { symbol: '7', rootString: 5, rootFinger: 1 },
  ],
  6: [
    { symbol: 'm7', rootString: 5, rootFinger: 1 },
    { symbol: 'm9', rootString: 5, rootFinger: 3 },
  ],
  7: [{ symbol: 'm7b5', rootString: 5, rootFinger: 1 }],
};

const ALL_EXTENSION_SYMBOLS = Array.from(
  new Set(
    Object.values(DEGREE_EXTENSIONS).flatMap((exts) =>
      exts.map((e) => e.symbol),
    ),
  ),
);

function ChordCard({
  symbol,
  rootNote,
  rootString,
  rootFinger,
  label,
  shapes,
}: {
  symbol: string;
  rootNote: string;
  rootString: number;
  rootFinger: number;
  label: string;
  shapes: DbChordShape[];
}) {
  const rootPc = NOTE_TO_PC[rootNote];
  // A shape pinned to this exact root (moveable: false, root_pc set) is a
  // specifically curated voicing for that root — e.g. maj#11's well-known,
  // easy-to-remember open-ish F shape — so prefer it over the generic
  // moveable shape at the same string/finger when one exists.
  const shape =
    shapes.find(
      (s) =>
        s.quality_symbol === symbol &&
        s.root_string === rootString &&
        s.root_finger === rootFinger &&
        s.root_pc === rootPc,
    ) ??
    shapes.find(
      (s) =>
        s.quality_symbol === symbol &&
        s.root_string === rootString &&
        s.root_finger === rootFinger &&
        s.moveable,
    );
  if (!shape) return null;
  const transposed = transposeShape(
    shape.tab_relative,
    rootString,
    rootFinger,
    rootPc,
  );
  if (!transposed) return null;
  return (
    <div>
      <Link
        href={`/chord/${encodeURIComponent(symbol)}?root=${encodeURIComponent(rootNote)}&string=${rootString}&position=${rootFinger}`}
        className="hover:opacity-80"
      >
        <p className="mb-1 text-xs font-semibold tracking-widest text-fg-secondary">
          {label}
        </p>
        <div className="w-40">
          <Fretboard
            numFrets={transposed.numFrets}
            startFret={transposed.startFret}
            title={`${rootNote}${symbol} chord, root on the ${rootString}th string — guitar fretboard diagram`}
          >
            <Pattern
              tab={transposed.tab}
              startFret={transposed.startFret}
              fillColor="#000"
            />
          </Fretboard>
        </div>
      </Link>
      <p className="sr-only">
        {describeChartForScreenReaders([{ tab: transposed.tab }])}
      </p>
    </div>
  );
}

export default async function ExtendedChordsLesson() {
  const diatonicSevenths =
    getDiatonicChords(MAJOR_SCALE_INTERVALS, KEY_OF_C) ?? [];
  // The qualities getDiatonicChords produces (maj7, m7, 7, m7b5) are already
  // real chord_qualities symbols, same as seventh-chords — no remapping
  // needed to look them up or link to their /chord page.
  const shapes = await getShapesBySymbols(
    [...new Set(['maj7', 'm7', '7', 'm7b5', ...ALL_EXTENSION_SYMBOLS])],
    [5, 6],
  );

  return (
    <>
      <LessonHeader partSlug="more-chords" lessonSlug="extended-chords" />

      <p>Every example below is in the key of C, root on the 5th string.</p>

      <h2>The diatonic 7th, again</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          7th Chords covered one quality per scale degree: I and IV become maj7,
          ii/iii/vi become m7, V becomes dominant 7, vii becomes m7b5
        </li>
        <li>
          That&apos;s not the only chord each degree can hold, though. The scale
          still provides a 6th, 9th, 11th, or 13th above any of them
        </li>
      </ul>
      <div className="mt-4 flex flex-wrap gap-6">
        {diatonicSevenths.map((chord) => (
          <ChordCard
            key={chord.degree}
            symbol={chord.quality}
            rootNote={chord.rootNote}
            rootString={5}
            rootFinger={1}
            label={`${chord.romanNumeral} – ${chord.name}`}
            shapes={shapes}
          />
        ))}
      </div>

      <h2>What else fits at each degree</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          A few of these are unique to one degree in the major scale: plain
          dominant 7 only ever shows up at V, m7b5 only at vii, and the sharp-11
          sound only at IV
        </li>
        <li>
          Not every degree can extend the same way, though. iii and vii stop at
          the plain 7th, because their 9th lands a half step above the root and
          clashes rather than colors
        </li>
      </ul>
      {diatonicSevenths.map((chord) => {
        const extensions = DEGREE_EXTENSIONS[chord.degree] ?? [];
        return (
          <div key={chord.degree} className="mt-6">
            <p className="mb-2 text-sm text-fg-secondary">
              {chord.romanNumeral} &ndash; {chord.rootNote}
            </p>
            <div className="flex flex-wrap gap-6">
              {extensions.map((ext) => (
                <ChordCard
                  key={ext.symbol}
                  symbol={ext.symbol}
                  rootNote={chord.rootNote}
                  rootString={ext.rootString}
                  rootFinger={ext.rootFinger}
                  label={`${chord.rootNote}${ext.symbol}`}
                  shapes={shapes}
                />
              ))}
            </div>
          </div>
        );
      })}

      <h2>Notes</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Any of these still functions as its scale degree: a ii chord is a ii
          chord whether it&apos;s played as Dm, Dm7, Dm6, or Dm9, just with more
          color added on top
        </li>
        <li>
          Knowing which extensions actually belong to a degree (and which ones
          clash) is what separates &ldquo;adding a fancy chord&rdquo; from
          adding a note that fights the scale
        </li>
      </ul>
    </>
  );
}
