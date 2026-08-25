import { CardRow } from '@/components/CardRow';
import { ChordPreviewCard } from '@/components/ChordPreviewCard';
import { SectionLabel } from '@/components/SectionLabel';
import { transposeShape } from '@/modules/chordv2/utils/transposeShape';
import { findQualitiesWithinNoteDifference } from '@/modules/chordv2/utils/relatedChords';
import { getQualitiesWithActualIntervals } from '@/modules/chordv2/utils/actualQualityIntervals';
import type { ScalePosition } from '@/modules/scale/utils/scaleUtils';
import { getAllQualities } from '@/modules/chordv2/db/queries';

interface Props {
  symbol: string;
  rootNote: string;
  rootPc: number;
  position: ScalePosition;
  // The currently-displayed shape's actually-played intervals — may omit a
  // note the quality formally defines (e.g. a dropped 3rd). Falls back to a
  // representative shape's actual intervals when not supplied.
  actualIntervals?: number[];
}

export async function RelatedChords({
  symbol,
  rootNote,
  rootPc,
  position,
  actualIntervals,
}: Props) {
  const allQualities = await getAllQualities();
  const current = allQualities.find((q) => q.symbol === symbol);
  if (!current) return null;

  // One representative shape per quality on this string - the same shape a
  // card would preview - used both to render the card and to determine what
  // each quality actually plays. Has to apply to every candidate, not just
  // the chord currently on screen, or relatedness stops being symmetric - a
  // candidate that drops a note would show up as related FROM its own page
  // but not TO it. See getQualitiesWithActualIntervals's own doc comment.
  const withActualIntervals = await getQualitiesWithActualIntervals(
    allQualities,
    position.rootString,
    position.rootFinger,
    rootPc,
  );
  const shapeByQualityId = new Map(
    withActualIntervals.map((c) => [c.quality.id, c.shape]),
  );

  const candidatesWithActualIntervals = withActualIntervals.map((c) => ({
    ...c.quality,
    intervals: c.intervals,
  }));
  const currentEntry = withActualIntervals.find(
    (c) => c.quality.id === current.id,
  );
  const referenceIntervals =
    actualIntervals ?? currentEntry?.intervals ?? current.intervals;
  const oneAway = findQualitiesWithinNoteDifference(
    referenceIntervals,
    candidatesWithActualIntervals,
    symbol,
    1,
  );

  if (oneAway.length === 0) return null;

  const cards = oneAway.flatMap((quality) => {
    const shape = shapeByQualityId.get(quality.id);
    if (!shape) return [];

    const transposed = transposeShape(
      shape.tab_relative as (number | 'x')[],
      shape.root_string,
      shape.root_finger ?? 0,
      rootPc,
    );

    if (!transposed) return [];

    const href = `/chord/${encodeURIComponent(quality.symbol)}?root=${rootNote}&string=${shape.root_string}&position=${shape.root_finger ?? 0}`;

    return [
      <ChordPreviewCard
        key={quality.symbol}
        variant="raised"
        href={href}
        label={`${rootNote}${quality.symbol}`}
        sublabel={quality.full_name}
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
      <SectionLabel as="h2">Related chords</SectionLabel>
      <CardRow>{cards}</CardRow>
    </div>
  );
}
