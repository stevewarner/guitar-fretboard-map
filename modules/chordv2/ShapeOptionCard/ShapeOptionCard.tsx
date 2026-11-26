import Link from 'next/link';
import { Fretboard, Pattern } from '@/components/FretboardChart';
import type { FlatTabValue } from '@/types';

interface Props {
  href: string;
  label: string;
  sublabel: string;
  tab: FlatTabValue[];
  startFret: number;
  numFrets: number;
  current: boolean;
}

// One shape of the chord already on screen (another position, an
// inversion), shown inside the chord panel. Picking one swaps the diagram
// above rather than leaving for a different chord, so these are white
// option cards with the current one outlined in ink, not the raised link
// cards used for other chords.
export function ShapeOptionCard({
  href,
  label,
  sublabel,
  tab,
  startFret,
  numFrets,
  current,
}: Props) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={current ? 'true' : undefined}
      className={`flex w-[100px] shrink-0 flex-col items-center gap-0.5 rounded-xl bg-surface px-2 py-2.5 hover:no-underline ${
        current
          ? 'border-2 border-fg'
          : 'm-px border border-line hover:border-line-strong'
      }`}
    >
      <span className="text-center text-[13px] font-semibold">{label}</span>
      <span className="text-center text-xs text-fg-secondary">{sublabel}</span>
      <Fretboard
        numFrets={numFrets}
        startFret={startFret}
        title={label}
        className="mt-1 w-[72px]"
        aria-hidden="true"
      >
        <Pattern tab={tab} startFret={startFret} fillColor="#000" />
      </Fretboard>
    </Link>
  );
}
