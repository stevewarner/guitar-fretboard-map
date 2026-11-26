import { ShapeOptionCard } from '@/modules/chordv2/ShapeOptionCard';
import { transposeShape } from '@/modules/chordv2/utils/transposeShape';
import { chordNoteNames } from '@/modules/chordv2/utils/chordRootName';
import type { ScalePosition } from '@/modules/scale/utils/scaleUtils';
import type { FlatTabValue } from '@/types';
import type {
  DbChordQuality,
  DbChordShape,
} from '@/modules/chordv2/db/queries';

interface Props {
  symbol: string;
  // Caller already has all of these (resolving `?inversion=` needs the same
  // data) — passed down rather than re-fetched here, which used to make
  // every /chord/[quality] render issue 3 duplicate DB round-trips.
  quality: DbChordQuality;
  fixedShapes: DbChordShape[];
  moveableShapes: DbChordShape[];
  rootNote: string;
  rootPc: number;
  position: ScalePosition;
  currentInversion: number;
  // The root-position shape at the current position, transposed: the row's
  // first card. Its inversions only make sense next to the shape they're
  // inversions of, so this is whichever position was picked last, not a
  // fixed cycle base.
  rootPosition: {
    tab: FlatTabValue[];
    startFret: number;
    numFrets: number;
  } | null;
}

const ORDINAL: Record<number, string> = { 1: '1st', 2: '2nd', 3: '3rd' };

// One "Inversions" row combining both pools the app tracks separately:
//   - fixed (open-position) inversions, a curated slash-chord shape like
//     C/G, shown at their own parent position.
//   - moveable multi-string-set inversions (e.g. maj7's drop-2 cycle),
//     scoped to the current string.
// Every available inversion, from either pool, is one card in one row, led
// by the root position, with the one on screen marked. The caller has
// already narrowed both pools to one shape per inversion for the current
// position, the same lists it resolves `?inversion=N` against, so a card
// never links to a shape other than the one it previews.
export function Inversions({
  symbol,
  quality,
  fixedShapes,
  moveableShapes,
  rootNote,
  rootPc,
  position,
  currentInversion,
  rootPosition,
}: Props) {
  const base = `/chord/${encodeURIComponent(symbol)}?root=${encodeURIComponent(rootNote)}&string=${position.rootString}&position=${position.rootFinger}`;
  const chordName = `${rootNote}${symbol}`;
  const noteNames = chordNoteNames(
    rootNote,
    quality.intervals,
    quality.interval_overrides,
  );

  const buildCard = (shape: DbChordShape) => {
    const bassSemitone = quality.intervals[shape.inversion] % 12;
    const bassPc = (rootPc + bassSemitone) % 12;
    const anchorString = shape.bass_string ?? shape.root_string;
    const anchorFinger = shape.bass_finger ?? shape.root_finger ?? 0;
    const transposed = transposeShape(
      shape.tab_relative,
      anchorString,
      anchorFinger,
      bassPc,
    );
    if (!transposed) return null;

    return (
      <ShapeOptionCard
        key={shape.id}
        href={`${base}&inversion=${shape.inversion}`}
        label={`${chordName}/${noteNames[shape.inversion]}`}
        sublabel={`${ORDINAL[shape.inversion] ?? `${shape.inversion}th`} inversion`}
        tab={transposed.tab}
        startFret={transposed.startFret}
        numFrets={transposed.numFrets}
        current={shape.inversion === currentInversion}
      />
    );
  };

  const inversionShapes = [...fixedShapes, ...moveableShapes]
    .filter((shape) => shape.inversion > 0)
    .sort((a, b) => a.inversion - b.inversion);

  const inversionCards = inversionShapes.flatMap((shape) => {
    const card = buildCard(shape);
    return card ? [card] : [];
  });

  if (inversionCards.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold">Inversions</h3>
      <div className="flex flex-nowrap gap-2 overflow-x-auto p-0.5 pb-1.5">
        {rootPosition && (
          <ShapeOptionCard
            href={base}
            label={chordName}
            sublabel="Root position"
            tab={rootPosition.tab}
            startFret={rootPosition.startFret}
            numFrets={rootPosition.numFrets}
            current={currentInversion === 0}
          />
        )}
        {inversionCards}
      </div>
    </div>
  );
}
