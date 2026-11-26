import { RelatedChordCard } from '@/modules/chordv2/RelatedChordCard';
import { transposeShape } from '@/modules/chordv2/utils/transposeShape';
import { chordRootName } from '@/modules/chordv2/utils/chordRootName';
import { getQualityShapeCandidates } from '@/modules/chordv2/utils/actualQualityIntervals';
import { findSameNotesChords } from '@/modules/chordv2/utils/sameNotesChords';
import {
  ROOT_STRINGS,
  type ScalePosition,
} from '@/modules/scale/utils/scaleUtils';
import { getAllQualities } from '@/modules/chordv2/db/queries';

interface Props {
  symbol: string;
  rootPc: number;
  position: ScalePosition;
  // Same convention as RelatedChords - the currently-displayed shape's
  // actually-played intervals, may omit a note the quality formally defines.
  actualIntervals?: number[];
}

export async function SameNotesChords({
  symbol,
  rootPc,
  position,
  actualIntervals,
}: Props) {
  const allQualities = await getAllQualities();
  const current = allQualities.find((q) => q.symbol === symbol);
  if (!current) return null;

  // Candidates search every root string, not just the one currently on
  // screen - unlike RelatedChords, "same notes" isn't about a nearby hand
  // position, and a quality's shapes can drop different notes on different
  // strings (see getQualityShapeCandidates's own doc comment for why every
  // shape is checked, not just one representative per quality). The current
  // chord's own string is searched first so a matched card lands nearby
  // when a match happens to exist there too.
  const rootStringSearchOrder = [
    position.rootString,
    ...ROOT_STRINGS.filter((rs) => rs !== position.rootString),
  ];
  const shapeCandidates = await getQualityShapeCandidates(
    allQualities,
    rootStringSearchOrder,
    rootPc,
  );

  const currentEntry =
    shapeCandidates.find(
      (c) =>
        c.quality.id === current.id &&
        c.shape.root_finger === position.rootFinger,
    ) ?? shapeCandidates.find((c) => c.quality.id === current.id);
  const referenceIntervals =
    actualIntervals ?? currentEntry?.intervals ?? current.intervals;

  const matches = findSameNotesChords(
    referenceIntervals,
    symbol,
    rootPc,
    shapeCandidates,
  );

  if (matches.length === 0) return null;

  const cards = matches.flatMap((match) => {
    const transposed = transposeShape(
      match.shape.tab_relative as (number | 'x')[],
      match.shape.root_string,
      match.shape.root_finger ?? 0,
      match.rootPc,
    );

    if (!transposed) return [];

    const matchRootNote = chordRootName(
      match.rootPc,
      match.quality.intervals,
      match.quality.interval_overrides,
    );
    const href = `/chord/${encodeURIComponent(match.quality.symbol)}?root=${encodeURIComponent(matchRootNote)}&string=${match.shape.root_string}&position=${match.shape.root_finger ?? 0}`;

    return [
      <RelatedChordCard
        key={`${match.quality.symbol}-${match.rootPc}`}
        href={href}
        label={`${matchRootNote}${match.quality.symbol}`}
        sublabel={match.quality.full_name}
        tab={transposed.tab}
        startFret={transposed.startFret}
        numFrets={transposed.numFrets}
      />,
    ];
  });

  if (cards.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="text-sm font-semibold">Same notes, different chord</h3>
      <div className="flex flex-nowrap gap-3 overflow-x-auto p-0.5 pb-2">
        {cards}
      </div>
    </div>
  );
}
