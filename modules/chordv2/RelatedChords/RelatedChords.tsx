import { RelatedChordCard } from '@/modules/chordv2/RelatedChordCard';
import { transposeShape } from '@/modules/chordv2/utils/transposeShape';
import { findQualitiesWithinNoteDifference } from '@/modules/chordv2/utils/relatedChords';
import { getQualitiesWithActualIntervals } from '@/modules/chordv2/utils/actualQualityIntervals';
import { intervalsToDegrees } from '@/modules/chordv2/utils/intervalDegrees';
import { chordRootName } from '@/modules/chordv2/utils/chordRootName';
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

  const referencePcs = new Set(referenceIntervals.map((i) => i % 12));

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

    const overrides =
      allQualities.find((q) => q.id === quality.id)?.interval_overrides ?? {};
    const qualityRootNote = chordRootName(rootPc, quality.intervals, overrides);
    const href = `/chord/${encodeURIComponent(quality.symbol)}?root=${encodeURIComponent(qualityRootNote)}&string=${shape.root_string}&position=${shape.root_finger ?? 0}`;

    // Spelled from what the card's shape actually plays, the same intervals
    // relatedness was judged on, so the accent marks exactly the one change.
    const degrees = intervalsToDegrees(quality.intervals, overrides);

    return [
      <RelatedChordCard
        key={quality.symbol}
        href={href}
        label={`${qualityRootNote}${quality.symbol}`}
        sublabel={quality.full_name}
        intervals={quality.intervals.map((interval, i) => ({
          label: degrees[i],
          changed: !referencePcs.has(interval % 12),
        }))}
        tab={transposed.tab}
        startFret={transposed.startFret}
        numFrets={transposed.numFrets}
      />,
    ];
  });

  if (cards.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="text-sm font-semibold">Same root, different quality</h3>
      <div className="flex flex-nowrap gap-3 overflow-x-auto p-0.5 pb-2">
        {cards}
      </div>
    </div>
  );
}
