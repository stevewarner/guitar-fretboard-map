import { CardRow } from '@/components/CardRow';
import { ChordPreviewCard } from '@/components/ChordPreviewCard';
import { SectionLabel } from '@/components/SectionLabel';
import { transposeShape } from '@/modules/chordv2/utils/transposeShape';
import { getMissingIntervalPcs } from '@/modules/chordv2/utils/droppedIntervals';
import {
  findQualitiesWithinNoteDifference,
  type QualityMeta,
} from '@/modules/chordv2/utils/relatedChords';
import type { ScalePosition } from '@/modules/scale/utils/scaleUtils';
import {
  getAllQualities,
  getShapesForRelated,
} from '@/modules/chordv2/db/queries';

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

  // One representative shape per quality on this string — the same shape a
  // card would preview — used both to render the card and to determine what
  // each quality actually plays. A curated voicing can omit a chord tone its
  // quality formally requires (e.g. a maj9#11 shape that drops the 3rd);
  // comparing raw quality.intervals on either side would overstate how
  // different two chords really are. This has to apply to every candidate,
  // not just the chord currently on screen, or relatedness stops being
  // symmetric — a candidate that drops a note would show up as related FROM
  // its own page but not TO it.
  const shapesOnString = await getShapesForRelated(
    allQualities.map((q) => q.id),
    position.rootString,
  );
  const shapeFor = (qualityId: number) =>
    shapesOnString.find(
      (s) =>
        s.quality_id === qualityId && s.root_finger === position.rootFinger,
    ) ?? shapesOnString.find((s) => s.quality_id === qualityId);

  const actualIntervalsFor = (quality: QualityMeta): number[] => {
    const shape = shapeFor(quality.id);
    if (!shape) return quality.intervals;
    const missing = getMissingIntervalPcs(
      shape.tab_relative,
      shape.root_string,
      shape.root_finger ?? 0,
      rootPc,
      quality.intervals,
    );
    return quality.intervals.filter((i) => !missing.has(i % 12));
  };

  const candidatesWithActualIntervals = allQualities.map((q) => ({
    ...q,
    intervals: actualIntervalsFor(q),
  }));
  const referenceIntervals = actualIntervals ?? actualIntervalsFor(current);
  const oneAway = findQualitiesWithinNoteDifference(
    referenceIntervals,
    candidatesWithActualIntervals,
    symbol,
    1,
  );

  if (oneAway.length === 0) return null;

  const cards = oneAway.flatMap((quality) => {
    const shape = shapeFor(quality.id);
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
