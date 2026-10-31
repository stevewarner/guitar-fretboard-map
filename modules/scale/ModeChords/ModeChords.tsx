import Link from 'next/link';
import { Fretboard, Pattern } from '@/components/FretboardChart';
import { SectionLabel } from '@/components/SectionLabel';
import {
  DiatonicChord,
  computePositionWindow,
  getDiatonicExtendedChords,
  getDiatonicSixthChords,
  getDiatonicSusChords,
} from '@/modules/scale/utils/scaleUtils';
import { transposeShape } from '@/modules/chordv2/utils/transposeShape';
import { isShapeValidForRoot } from '@/modules/chordv2/utils/shapeValidity';
import { STANDARD_TUNING_PC } from '@/app/utils/constants';
import { parseNote } from '@/app/utils/noteSpelling';
import {
  getShapesBySymbols,
  getAllQualities,
  type DbChordShape,
} from '@/modules/chordv2/db/queries';

// scaleUtils' diatonic-chord classifier produces quality strings independently
// of chord_qualities, so any symbol it invents that isn't the DB's canonical
// spelling needs a remap here — otherwise the generated /chord link 404s.
// maj7#5 -> augmaj7 and 7#5 -> aug7 were consolidated as enharmonic duplicates
// (see TODO.md's Chords v2 cleanup); the DB kept the symbols with real shape data.
const QUALITY_SYMBOL_MAP: Record<string, string> = {
  dim7: 'dim',
  'maj7#5': 'augmaj7',
  '7#5': 'aug7',
};

// Finger overrides keyed by [qualitySymbol][rootString].
// e.g. maj7 on string 6 uses finger 2; on string 5 it uses the default (1).
const PREFERRED_FINGER: Partial<
  Record<string, Partial<Record<number, number>>>
> = {
  maj7: { 6: 2 },
  m7b5: { 6: 2 },
};

function getPreferredFinger(qualitySymbol: string, rootString: number): number {
  return PREFERRED_FINGER[qualitySymbol]?.[rootString] ?? 1;
}

// Walk strings 6→5 and return the first shape whose root falls within the
// fixed reference window (string 6, finger 1 for the scale tonic).
// Uses PREFERRED_FINGER to pick the right voicing per quality.
function findShapeForPosition(
  shapes: DbChordShape[],
  qualitySymbol: string,
  chordRootPc: number,
  scaleStartFret: number,
): DbChordShape | null {
  for (const rootString of [6, 5] as const) {
    const openPc = STANDARD_TUNING_PC[6 - rootString];
    let chordRootFret = (chordRootPc - openPc + 12) % 12;
    if (chordRootFret === 0 && scaleStartFret > 0) chordRootFret = 12;

    if (chordRootFret < scaleStartFret || chordRootFret > scaleStartFret + 4)
      continue;

    const finger = getPreferredFinger(qualitySymbol, rootString);
    const shape = shapes.find(
      (s) =>
        s.quality_symbol === qualitySymbol &&
        s.root_string === rootString &&
        s.root_finger === finger &&
        isShapeValidForRoot(s, chordRootPc),
    );
    if (shape) return shape;
  }
  return null;
}

function findDefaultShape(
  shapes: DbChordShape[],
  symbol: string,
  chordRootPc: number,
): DbChordShape | undefined {
  const finger = getPreferredFinger(symbol, 6);
  return (
    shapes.find(
      (s) =>
        s.quality_symbol === symbol &&
        s.root_string === 6 &&
        s.root_finger === finger &&
        isShapeValidForRoot(s, chordRootPc),
    ) ??
    shapes.find(
      (s) => s.quality_symbol === symbol && isShapeValidForRoot(s, chordRootPc),
    )
  );
}

// The one shape lookup every chord needs - resolved once per chord in
// ModeChords below, then threaded through to ChordGrid/ChordCard, rather
// than each of "should this chord be shown" and "what does its card render"
// repeating the same search independently.
function findShapeForChord(
  chord: DiatonicChord,
  shapes: DbChordShape[],
  scaleStartFret: number,
): DbChordShape | null {
  const symbol = QUALITY_SYMBOL_MAP[chord.quality] ?? chord.quality;
  const rootPc = parseNote(chord.rootNote).pc;
  return (
    findShapeForPosition(shapes, symbol, rootPc, scaleStartFret) ??
    findDefaultShape(shapes, symbol, rootPc) ??
    null
  );
}

interface ChordWithShape {
  chord: DiatonicChord;
  shape: DbChordShape;
}

function ChordCard({ chord, shape }: ChordWithShape) {
  const symbol = QUALITY_SYMBOL_MAP[chord.quality] ?? chord.quality;
  const rootPc = parseNote(chord.rootNote).pc;
  const transposed = transposeShape(
    shape.tab_relative as (number | 'x')[],
    shape.root_string,
    shape.root_finger ?? 1,
    rootPc,
  );

  return (
    <Link
      href={`/chord/${encodeURIComponent(symbol)}?root=${encodeURIComponent(chord.rootNote)}&string=${shape.root_string}&position=${shape.root_finger ?? 1}`}
      className="flex flex-col items-center gap-1 rounded-xl bg-surface-raised p-3 hover:bg-surface-sunken"
    >
      <span className="font-mono text-xs text-fg-secondary">
        {chord.romanNumeral}
        {chord.quality}
      </span>
      <span className="text-sm font-semibold">{chord.name}</span>
      {transposed && (
        <Fretboard
          numFrets={transposed.numFrets}
          startFret={transposed.startFret}
          height={110}
          width={110}
          title={`${chord.name} chord diagram`}
          aria-hidden="true"
        >
          <Pattern
            tab={transposed.tab}
            startFret={transposed.startFret}
            fillColor="#000"
          />
        </Fretboard>
      )}
      <span className="font-mono text-xs text-fg-secondary">
        {chord.scaleDegrees.join(' ')}
      </span>
      <span className="font-mono text-xs text-fg-secondary">
        {chord.chordIntervals.join(' ')}
      </span>
    </Link>
  );
}

// Groups chords into one column per scale degree (1-7) so that, when a
// degree has more than one chord (e.g. an extended-chords row with both a
// 9th and an 11th voicing for the same degree), they stack within that
// degree's column instead of sliding into whichever column the flat list
// order happens to land on — keeping every section's columns aligned by
// scale degree, triads/sevenths included (which just get one card per
// column).
function groupByDegree(chords: ChordWithShape[]): ChordWithShape[][] {
  const columns: ChordWithShape[][] = Array.from({ length: 7 }, () => []);
  for (const entry of chords) columns[entry.chord.degree - 1].push(entry);
  return columns;
}

function ChordGrid({ chords }: { chords: ChordWithShape[] }) {
  const columns = groupByDegree(chords);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {columns.map((columnChords, i) => (
        <div key={i} className="flex flex-col gap-3">
          {columnChords.map(({ chord, shape }) => (
            <ChordCard key={chord.name} chord={chord} shape={shape} />
          ))}
        </div>
      ))}
    </div>
  );
}

interface ModeChordsProps {
  triads: DiatonicChord[];
  sevenths: DiatonicChord[];
  rootPc: number;
  modeIntervals: number[];
  tonicNote: string;
}

export async function ModeChords({
  triads,
  sevenths,
  rootPc,
  modeIntervals,
  tonicNote,
}: ModeChordsProps) {
  const { startFret: scaleStartFret } = computePositionWindow(
    { rootString: 6, rootFinger: 1 },
    rootPc,
  ) ?? { startFret: 0 };

  const qualities = await getAllQualities();
  // Sus chords (the 3rd replaced by the 2nd/4th degree, including 7sus4
  // which keeps the b7) are a different category from the stacked-thirds
  // extensions below - they're not built by extending a 7th chord with
  // 9/11/13, so they all get their own section. Ordered simplest to most
  // complex within each degree's column (6 -> 9/11/13 stacked extensions)
  // in the Extended Chords section below - groupByDegree preserves this
  // relative order when it buckets chords by degree.
  const sus = getDiatonicSusChords(modeIntervals, tonicNote, qualities) ?? [];
  const extended = [
    ...(getDiatonicSixthChords(modeIntervals, tonicNote, qualities) ?? []),
    ...(getDiatonicExtendedChords(modeIntervals, tonicNote, qualities) ?? []),
  ];

  const allChords = [...triads, ...sevenths, ...sus, ...extended];
  const symbols = Array.from(
    new Set(allChords.map((c) => QUALITY_SYMBOL_MAP[c.quality] ?? c.quality)),
  );
  const shapes = await getShapesBySymbols(symbols, [5, 6]);

  // Only show chords with an actual playable shape - a quality with no
  // shape data at all (or none valid at this root) would otherwise render
  // as a card with no diagram, name and degrees only. Resolving the shape
  // here (once) also means ChordCard never has to look it up again.
  const withShape = (chords: DiatonicChord[]): ChordWithShape[] =>
    chords.flatMap((chord) => {
      const shape = findShapeForChord(chord, shapes, scaleStartFret);
      return shape ? [{ chord, shape }] : [];
    });
  const triadsWithShape = withShape(triads);
  const seventhsWithShape = withShape(sevenths);
  const susWithShape = withShape(sus);
  const extendedWithShape = withShape(extended);

  return (
    <section className="mt-12">
      <SectionLabel as="h2" className="mb-6">
        Chords
      </SectionLabel>
      <h3 className="mb-3 text-sm font-medium">Triads</h3>
      <ChordGrid chords={triadsWithShape} />
      <h3 className="mb-3 mt-8 text-sm font-medium">7th Chords</h3>
      <ChordGrid chords={seventhsWithShape} />
      {susWithShape.length > 0 && (
        <>
          <h3 className="mb-3 mt-8 text-sm font-medium">Suspended Chords</h3>
          <ChordGrid chords={susWithShape} />
        </>
      )}
      {extendedWithShape.length > 0 && (
        <>
          <h3 className="mb-3 mt-8 text-sm font-medium">Extended Chords</h3>
          <ChordGrid chords={extendedWithShape} />
        </>
      )}
    </section>
  );
}
