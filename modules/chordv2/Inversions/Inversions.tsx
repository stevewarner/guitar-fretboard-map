import { CardRow } from '@/components/CardRow';
import { ChordPreviewCard } from '@/components/ChordPreviewCard';
import { SectionLabel } from '@/components/SectionLabel';
import { transposeShape } from '@/modules/chordv2/utils/transposeShape';
import { PC_TO_NOTE } from '@/app/utils/constants';
import type { ScalePosition } from '@/modules/scale/utils/scaleUtils';
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
}

const ORDINAL: Record<number, string> = { 1: '1st', 2: '2nd', 3: '3rd' };

// One "Inversions" row combining both pools the app tracks separately:
//   - fixed (open-position) inversions, discoverable purely by root — a
//     curated slash-chord shape like C/G.
//   - moveable multi-string-set inversions (e.g. maj7's drop-2 cycle),
//     scoped to the current string.
// These used to render as two different UI patterns (a dropdown for fixed,
// this card row for moveable) depending on which pool had data for the
// current quality/root/string — confusing, since which one showed up looked
// arbitrary. Now every available inversion, from either pool, is one card
// in one row. app/chord/[quality]/page.tsx resolves `?inversion=N` by
// checking the fixed pool first, moveable second — deduped the same way
// here, so a card never links to a shape other than the one it previews.
export function Inversions({
  symbol,
  quality,
  fixedShapes,
  moveableShapes,
  rootNote,
  rootPc,
  position,
  currentInversion,
}: Props) {
  const base = `/chord/${encodeURIComponent(symbol)}?root=${rootNote}&string=${position.rootString}&position=${position.rootFinger}`;

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

    const isBase = shape.inversion === 0;
    const bassNote = PC_TO_NOTE[bassPc];

    return (
      <ChordPreviewCard
        key={shape.id}
        variant="raised"
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
        className="w-36 shrink-0"
      />
    );
  };

  const fixedInversionNumbers = new Set(fixedShapes.map((s) => s.inversion));

  const candidateShapes = [
    ...fixedShapes.filter((s) => s.inversion !== currentInversion),
    ...moveableShapes.filter((shape) => {
      if (shape.inversion === currentInversion) return false;
      // Ceded to the fixed pool above (see this file's top comment) —
      // otherwise the same inversion number would show twice, and the
      // moveable card's link would silently resolve to the fixed shape
      // instead of the one it previews.
      if (shape.inversion > 0 && fixedInversionNumbers.has(shape.inversion))
        return false;
      // Fixed (non-moveable) shapes sharing this bass_string but belonging
      // to a different root (e.g. G/B also anchored on string 5) would
      // otherwise get dynamically re-transposed here, producing a diagram
      // that doesn't match the shape at all.
      if (!shape.moveable && shape.root_pc !== rootPc) return false;
      return true;
    }),
  ].sort((a, b) => a.inversion - b.inversion);

  const cards = candidateShapes.flatMap((shape) => {
    const card = buildCard(shape);
    return card ? [card] : [];
  });

  if (cards.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <SectionLabel as="h2">Inversions</SectionLabel>
      <CardRow>{cards}</CardRow>
    </div>
  );
}
