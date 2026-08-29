import { CardRow } from '@/components/CardRow';
import { ChordPreviewCard } from '@/components/ChordPreviewCard';
import { SectionLabel } from '@/components/SectionLabel';
import { transposeShape } from '@/modules/chordv2/utils/transposeShape';
import { STRING_LABELS, fingerLabel } from '@/app/utils/musicUtils';
import type { DbChordShape } from '@/modules/chordv2/db/queries';

interface Props {
  symbol: string;
  rootNote: string;
  rootPc: number;
  // Every other root-position shape valid at this root — caller already has
  // this (it's the same `shapes` + `isShapeValidAtRoot` used to resolve the
  // shape on screen and to grey out PositionControls), filtered down to
  // exclude the one currently displayed.
  shapes: DbChordShape[];
}

// Other places to play this exact chord: same quality, same root, a
// different string/finger. Distinct from Inversions (same shape family,
// different bass note) and RelatedChords/SameNotesChords (different quality
// or root entirely) — this is purely "other fingerings of this one chord."
export function AdditionalChordShapes({
  symbol,
  rootNote,
  rootPc,
  shapes,
}: Props) {
  const cards = shapes.flatMap((shape) => {
    const rootFinger = shape.root_finger ?? 0;
    const transposed = transposeShape(
      shape.tab_relative,
      shape.root_string,
      rootFinger,
      rootPc,
    );
    if (!transposed) return [];

    return [
      <ChordPreviewCard
        key={shape.id}
        variant="raised"
        href={`/chord/${encodeURIComponent(symbol)}?root=${encodeURIComponent(rootNote)}&string=${shape.root_string}&position=${rootFinger}`}
        label={`${rootNote}${symbol}`}
        sublabel={`${STRING_LABELS[shape.root_string]}, ${fingerLabel(rootFinger, shape.root_string, rootPc)}`}
        tab={transposed.tab}
        startFret={transposed.startFret}
        numFrets={transposed.numFrets}
        className="w-36 shrink-0"
      />,
    ];
  });

  if (cards.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* States explicitly that this is one of several ways to play the
          chord, not a generic "more shapes" label — helps match queries like
          "other ways to play Cmaj7". See docs/GEO_STRATEGY.md item 8. */}
      <SectionLabel as="h2">
        Other ways to play {rootNote}
        {symbol}
      </SectionLabel>
      <CardRow>{cards}</CardRow>
    </div>
  );
}
