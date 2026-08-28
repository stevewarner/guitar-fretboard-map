import Link from 'next/link';
import { Fretboard } from './Fretboard';
import { Pattern } from './Pattern';
import { describeChartForScreenReaders } from './describeChartForScreenReaders';
import { transposeShape } from '@/modules/chordv2/utils/transposeShape';
import { intervalLabels } from '@/app/utils/musicUtils';

interface ChordCardProps {
  quality: string;
  rootNote: string;
  // The pitch class the shape is anchored to on the neck. For a plain
  // (root-position) voicing this is the chord's own root; for an inversion
  // it's the bass note instead, since that's what's actually fretted at
  // rootString/rootFinger.
  rootPc: number;
  rootString: number;
  rootFinger: number;
  tab: (number | 'x')[];
  label: string;
  // Off by default, matching the plain black dots every other chord card on
  // the site uses. Turn on for a lesson where which interval lands on which
  // string is the actual point (e.g. the 1-5-7-3 voicing lessons), not just
  // an incidental chord diagram.
  showIntervals?: boolean;
  // The pc interval labels are computed relative to, when it's different
  // from rootPc. Only needed for an inversion: the shape is positioned by
  // its bass note, but a label should still read relative to the chord's
  // actual root, so the bass note shows "3", "5", or "7" instead of always
  // "1". Defaults to rootPc.
  labelRootPc?: number;
  // Appends &inversion=N to the link when set and greater than 0. Root
  // position (0, or omitted) keeps the plain, paramless URL.
  inversion?: number;
}

// A single linked, black chord-diagram box — root note, string, and finger
// determine the transposition; label is the caller's own display text (e.g.
// a Roman numeral or a chord symbol). Shared by every lesson that lays out a
// row of chord diagrams next to a related scale diagram (secondary
// dominants, mixing modes, voicing inversions).
export function ChordCard({
  quality,
  rootNote,
  rootPc,
  rootString,
  rootFinger,
  tab,
  label,
  showIntervals = false,
  labelRootPc,
  inversion,
}: ChordCardProps) {
  const transposed = transposeShape(tab, rootString, rootFinger, rootPc);
  if (!transposed) return null;
  const inversionParam = inversion ? `&inversion=${inversion}` : '';
  const intervals = showIntervals
    ? intervalLabels(transposed.tab, labelRootPc ?? rootPc)
    : undefined;
  return (
    <div>
      <Link
        href={`/chord/${encodeURIComponent(quality)}?root=${encodeURIComponent(rootNote)}&string=${rootString}&position=${rootFinger}${inversionParam}`}
        className="hover:opacity-80"
      >
        <p className="mb-1 text-xs font-semibold tracking-widest text-fg-secondary">
          {label}
        </p>
        <div className="w-40">
          <Fretboard
            numFrets={transposed.numFrets}
            startFret={transposed.startFret}
            title={`${rootNote}${quality} chord, root on the ${rootString}th string — guitar fretboard diagram`}
          >
            <Pattern
              tab={transposed.tab}
              intervals={intervals}
              startFret={transposed.startFret}
              fillColor="#000"
            />
          </Fretboard>
        </div>
      </Link>
      {/* Outside the Link so this doesn't get folded into its accessible
          name — see describeChartForScreenReaders' own doc comment. */}
      <p className="sr-only">
        {describeChartForScreenReaders([{ tab: transposed.tab, intervals }])}
      </p>
    </div>
  );
}
