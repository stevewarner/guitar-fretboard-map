import { RelatedChordCard } from '@/modules/chordv2/RelatedChordCard';
import { transposeShape } from '@/modules/chordv2/utils/transposeShape';
import {
  chordNoteNames,
  chordRootName,
} from '@/modules/chordv2/utils/chordRootName';

interface Props {
  symbol: string;
  rootPc: number;
  // Position-family identifiers for the href — the string/finger the URL's
  // ?string=&position= params expect. For an inversion these are the parent
  // shape's own position, not the bass note's string/finger (see
  // app/chord/[quality]/page.tsx's displayPosition for why the two differ).
  rootString: number;
  rootFinger: number;
  inversion: number;
  // The real transposition inputs: this shape's raw offsets (same type as
  // DbChordShape['tab_relative']), and the string/finger they're actually
  // anchored to (bass_string/bass_finger for an inversion, root_string/
  // root_finger otherwise).
  tabRelative: (number | 'x')[];
  anchorString: number;
  anchorFinger: number;
  qualityIntervals: number[];
  qualityOverrides: Record<string, string> | null;
}

// Same shape, transposed to every other key — a real crawlable link graph
// between roots of the same chord shape. RootSelect (the Root dropdown) is
// a client-side <select onChange>, so without this, nothing on the page
// links a root's chord page to any other root's. See docs/SEO_IMPROVEMENTS.md's
// 2026-08-06 check-in.
//
// Only ever rendered by the caller for a moveable shape — a fixed shape
// (e.g. a curated open-position voicing) relies on specific open strings
// ringing at specific pitches and genuinely has no equivalent in other
// keys, so there's nothing accurate to show here.
export function OtherKeys({
  symbol,
  rootPc,
  rootString,
  rootFinger,
  inversion,
  tabRelative,
  anchorString,
  anchorFinger,
  qualityIntervals,
  qualityOverrides,
}: Props) {
  // Semitones from the root to whatever's anchored at anchorString/
  // anchorFinger — 0 for a root-position shape, or the interval the
  // inverted bass note sits at (e.g. 7 for a 2nd inversion with the 5th in
  // the bass). Mirrors the bassPc math in app/chord/[quality]/page.tsx.
  const intervalOffset = (qualityIntervals[inversion] ?? 0) % 12;

  const cards = Array.from({ length: 12 }, (_, pc) => pc)
    .filter((pc) => pc !== rootPc)
    .flatMap((pc) => {
      const note = chordRootName(pc, qualityIntervals, qualityOverrides);
      const targetPc = (pc + intervalOffset) % 12;
      const transposed = transposeShape(
        tabRelative,
        anchorString,
        anchorFinger,
        targetPc,
      );
      if (!transposed) return [];

      const bassNote =
        intervalOffset > 0
          ? chordNoteNames(note, qualityIntervals, qualityOverrides)[inversion]
          : null;
      const label = bassNote
        ? `${note}${symbol}/${bassNote}`
        : `${note}${symbol}`;

      const params = new URLSearchParams({
        root: note,
        string: String(rootString),
        position: String(rootFinger),
      });
      if (inversion) params.set('inversion', String(inversion));

      return [
        <RelatedChordCard
          key={note}
          href={`/chord/${encodeURIComponent(symbol)}?${params.toString()}`}
          label={label}
          tab={transposed.tab}
          startFret={transposed.startFret}
          numFrets={transposed.numFrets}
        />,
      ];
    });

  if (cards.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="text-sm font-semibold">Same shape, different key</h3>
      <div className="flex flex-nowrap gap-3 overflow-x-auto p-0.5 pb-2">
        {cards}
      </div>
    </div>
  );
}
