import { CardRow } from '@/components/CardRow';
import { ChordPreviewCard } from '@/components/ChordPreviewCard';
import { SectionLabel } from '@/components/SectionLabel';
import { PC_TO_NOTE } from '@/app/utils/constants';
import { transposeShape } from '@/modules/chordv2/utils/transposeShape';
import { getQualitiesWithCleanestShape } from '@/modules/chordv2/utils/actualQualityIntervals';
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
  // position, and a quality's only shape on the current string can happen
  // to drop a note even when a complete voicing exists elsewhere (see
  // getQualitiesWithCleanestShape's own doc comment). The current chord's
  // own string is searched first so a matched card lands nearby when a
  // complete voicing happens to exist there too.
  const rootStringSearchOrder = [
    position.rootString,
    ...ROOT_STRINGS.filter((rs) => rs !== position.rootString),
  ];
  const withActualIntervals = await getQualitiesWithCleanestShape(
    allQualities,
    rootStringSearchOrder,
    position.rootFinger,
    rootPc,
  );

  const currentEntry = withActualIntervals.find(
    (c) => c.quality.id === current.id,
  );
  const referenceIntervals =
    actualIntervals ?? currentEntry?.intervals ?? current.intervals;

  const matches = findSameNotesChords(
    referenceIntervals,
    symbol,
    rootPc,
    withActualIntervals,
  );

  if (matches.length === 0) return null;

  const cards = matches.flatMap((match) => {
    if (!match.shape) return [];

    const transposed = transposeShape(
      match.shape.tab_relative as (number | 'x')[],
      match.shape.root_string,
      match.shape.root_finger ?? 0,
      match.rootPc,
    );

    if (!transposed) return [];

    const matchRootNote = PC_TO_NOTE[match.rootPc];
    const href = `/chord/${encodeURIComponent(match.quality.symbol)}?root=${encodeURIComponent(matchRootNote)}&string=${match.shape.root_string}&position=${match.shape.root_finger ?? 0}`;

    return [
      <ChordPreviewCard
        key={`${match.quality.symbol}-${match.rootPc}`}
        variant="raised"
        href={href}
        label={`${matchRootNote}${match.quality.symbol}`}
        sublabel={match.quality.full_name}
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
      <SectionLabel as="h2">Same notes, different chord</SectionLabel>
      <CardRow>{cards}</CardRow>
    </div>
  );
}
