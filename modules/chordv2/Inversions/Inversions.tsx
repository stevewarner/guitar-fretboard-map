import { CardRow } from '@/components/CardRow';
import { ChordPreviewCard } from '@/components/ChordPreviewCard';
import { transposeShape } from '@/modules/chordv2/utils/transposeShape';
import { PC_TO_NOTE } from '@/app/utils/constants';
import type { ScalePosition } from '@/modules/scale/utils/scaleUtils';
import {
  getInversionShapes,
  getQualityBySymbol,
} from '@/modules/chordv2/db/queries';

interface Props {
  symbol: string;
  rootNote: string;
  rootPc: number;
  position: ScalePosition;
  currentInversion: number;
}

const ORDINAL: Record<number, string> = { 1: '1st', 2: '2nd', 3: '3rd' };

export async function Inversions({
  symbol,
  rootNote,
  rootPc,
  position,
  currentInversion,
}: Props) {
  const [quality, shapes] = await Promise.all([
    getQualityBySymbol(symbol),
    getInversionShapes(symbol, position.rootString),
  ]);

  if (!quality || shapes.length === 0) return null;

  const base = `/chord/${encodeURIComponent(symbol)}?root=${rootNote}&string=${position.rootString}&position=${position.rootFinger}`;

  const cards = shapes.flatMap((shape) => {
    // Show the whole voicing cycle except the one currently on screen.
    if (shape.inversion === currentInversion) return [];

    // Fixed (non-moveable) inversions — open-position slash chords like C/G —
    // only make sense at their own root. Without this guard a fixed shape
    // sharing this bass_string but belonging to a different root (e.g. G/B
    // also anchored on string 5) would get dynamically re-transposed here,
    // producing a diagram that doesn't match the shape at all.
    if (!shape.moveable && shape.root_pc !== rootPc) return [];

    // The bass note of an inversion is quality.intervals[inversion] semitones
    // above the root; transposition anchors on that bass note.
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
    if (!transposed) return [];

    const isBase = shape.inversion === 0;
    const bassNote = PC_TO_NOTE[bassPc];

    return [
      <ChordPreviewCard
        key={shape.id}
        href={isBase ? base : `${base}&inversion=${shape.inversion}`}
        label={
          isBase ? `${rootNote}${symbol}` : `${rootNote}${symbol}/${bassNote}`
        }
        sublabel={
          isBase
            ? 'Root position'
            : `${ORDINAL[shape.inversion] ?? `${shape.inversion}th`} inversion`
        }
        tab={transposed.tab}
        startFret={transposed.startFret}
        numFrets={transposed.numFrets}
        className="w-32 shrink-0"
      />,
    ];
  });

  if (cards.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">Inversions</p>
      <CardRow>{cards}</CardRow>
    </div>
  );
}
