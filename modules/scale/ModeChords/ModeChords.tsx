import Link from 'next/link';
import { Fretboard, Pattern } from '@/components/FretboardChart';
import {
  DiatonicChord,
  computePositionWindow,
} from '@/modules/scale/utils/scaleUtils';
import { transposeShape } from '@/modules/chordv2/utils/transposeShape';
import { STANDARD_TUNING_PC } from '@/app/utils/constants';
import { parseNote } from '@/app/utils/noteSpelling';
import {
  getShapesBySymbols,
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
        s.root_finger === finger,
    );
    if (shape) return shape;
  }
  return null;
}

function findDefaultShape(
  shapes: DbChordShape[],
  symbol: string,
): DbChordShape | undefined {
  const finger = getPreferredFinger(symbol, 6);
  return (
    shapes.find(
      (s) =>
        s.quality_symbol === symbol &&
        s.root_string === 6 &&
        s.root_finger === finger,
    ) ?? shapes.find((s) => s.quality_symbol === symbol)
  );
}

function ChordGrid({
  chords,
  scaleStartFret,
  shapes,
}: {
  chords: DiatonicChord[];
  scaleStartFret: number;
  shapes: DbChordShape[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {chords.map((chord) => {
        const symbol = QUALITY_SYMBOL_MAP[chord.quality] ?? chord.quality;
        const rootPc = parseNote(chord.rootNote).pc;
        const shape =
          rootPc !== undefined
            ? (findShapeForPosition(shapes, symbol, rootPc, scaleStartFret) ??
              findDefaultShape(shapes, symbol))
            : findDefaultShape(shapes, symbol);
        const transposed =
          shape && rootPc !== undefined
            ? transposeShape(
                shape.tab_relative as (number | 'x')[],
                shape.root_string,
                shape.root_finger ?? 1,
                rootPc,
              )
            : null;

        return (
          <Link
            key={chord.degree}
            href={`/chord/${encodeURIComponent(symbol)}?root=${chord.rootNote}${shape ? `&string=${shape.root_string}&position=${shape.root_finger ?? 1}` : ''}`}
            className="flex flex-col items-center gap-1 rounded border border-current px-3 py-2 hover:bg-surface-sunken"
          >
            <span className="font-mono text-xs text-fg-secondary">
              {chord.romanNumeral}
              {chord.quality}
            </span>
            <span className="text-sm font-medium">{chord.name}</span>
            {transposed && (
              <Fretboard
                numFrets={transposed.numFrets}
                startFret={transposed.startFret}
                height={110}
                width={110}
                title={`${chord.name} chord diagram`}
              >
                <Pattern
                  tab={transposed.tab}
                  startFret={transposed.startFret}
                  fillColor="#000"
                />
              </Fretboard>
            )}
          </Link>
        );
      })}
    </div>
  );
}

interface ModeChordsProps {
  triads: DiatonicChord[];
  sevenths: DiatonicChord[];
  rootPc: number;
}

export async function ModeChords({
  triads,
  sevenths,
  rootPc,
}: ModeChordsProps) {
  const { startFret: scaleStartFret } = computePositionWindow(
    { rootString: 6, rootFinger: 1 },
    rootPc,
  ) ?? { startFret: 0 };

  const allChords = [...triads, ...sevenths];
  const symbols = Array.from(
    new Set(allChords.map((c) => QUALITY_SYMBOL_MAP[c.quality] ?? c.quality)),
  );
  const shapes = await getShapesBySymbols(symbols, [5, 6]);

  return (
    <section className="mt-12">
      <h2 className="mb-6">Chords</h2>
      <p className="mb-3 text-sm font-medium">Triads</p>
      <ChordGrid
        chords={triads}
        scaleStartFret={scaleStartFret}
        shapes={shapes}
      />
      <p className="mb-3 mt-8 text-sm font-medium">7th Chords</p>
      <ChordGrid
        chords={sevenths}
        scaleStartFret={scaleStartFret}
        shapes={shapes}
      />
    </section>
  );
}
