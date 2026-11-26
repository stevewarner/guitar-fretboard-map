import { ShapeOptionCard } from '@/modules/chordv2/ShapeOptionCard';
import { transposeShape } from '@/modules/chordv2/utils/transposeShape';
import { STRING_LABELS, fingerLabel } from '@/app/utils/musicUtils';
import type { DbChordShape } from '@/modules/chordv2/db/queries';

interface Props {
  symbol: string;
  rootNote: string;
  rootPc: number;
  // Every root-position shape valid at this root, the one on screen
  // included — caller already has this (it's the same `shapes` +
  // `isShapeValidAtRoot` used to resolve the shape on screen and to grey out
  // PositionControls).
  shapes: DbChordShape[];
  // The root-position shape on screen, outlined. Null while an
  // inversion is on screen: that's marked in the Inversions row instead.
  currentShapeId: number | null;
}

// Other places to play this exact chord: same quality, same root, a
// different string/finger. Distinct from Inversions (same shape family,
// different bass note) and the Related chords section (different quality
// or root entirely) — this is purely "other fingerings of this one chord."
export function AdditionalChordShapes({
  symbol,
  rootNote,
  rootPc,
  shapes,
  currentShapeId,
}: Props) {
  // A fixed open-position shape and a moveable one can share a string and
  // finger at the same root. Both link to the same URL, which resolves to
  // the fixed one (app/chord/[quality]/page.tsx), so show only that one.
  const byPosition = new Map<string, DbChordShape>();
  for (const shape of shapes) {
    const key = `${shape.root_string}-${shape.root_finger ?? 0}`;
    const existing = byPosition.get(key);
    if (!existing || (existing.moveable && !shape.moveable)) {
      byPosition.set(key, shape);
    }
  }
  const ordered = [...byPosition.values()].sort(
    (a, b) =>
      b.root_string - a.root_string ||
      (a.root_finger ?? 0) - (b.root_finger ?? 0),
  );

  const cards = ordered.flatMap((shape) => {
    const rootFinger = shape.root_finger ?? 0;
    const transposed = transposeShape(
      shape.tab_relative,
      shape.root_string,
      rootFinger,
      rootPc,
    );
    if (!transposed) return [];

    return [
      <ShapeOptionCard
        key={shape.id}
        href={`/chord/${encodeURIComponent(symbol)}?root=${encodeURIComponent(rootNote)}&string=${shape.root_string}&position=${rootFinger}`}
        label={STRING_LABELS[shape.root_string]}
        sublabel={fingerLabel(
          rootFinger,
          shape.root_string,
          rootPc,
          rootFinger === 0 ? (shape.moveable ? 'stretch' : 'open') : undefined,
        )}
        tab={transposed.tab}
        startFret={transposed.startFret}
        numFrets={transposed.numFrets}
        current={shape.id === currentShapeId}
      />,
    ];
  });

  // Just the shape already on screen isn't "other ways to play" it.
  if (cards.length <= 1) return null;

  return (
    <div className="flex flex-col gap-2">
      {/* States explicitly that this is one of several ways to play the
          chord, not a generic "more shapes" label — helps match queries like
          "other ways to play Cmaj7". See docs/GEO_STRATEGY.md item 8. */}
      <h3 className="text-sm font-semibold">
        Other ways to play {rootNote}
        {symbol}
      </h3>
      <div className="flex flex-nowrap gap-2 overflow-x-auto p-0.5 pb-1.5">
        {cards}
      </div>
    </div>
  );
}
