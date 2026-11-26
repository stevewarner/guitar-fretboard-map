import Link from 'next/link';
import { Fretboard, Pattern } from '@/components/FretboardChart';
import type { FlatTabValue } from '@/types';

export type RelatedChordInterval = {
  label: string;
  // Not one of the current chord's intervals — drawn in the accent color so
  // the one note that changed stands out.
  changed: boolean;
};

interface Props {
  href: string;
  label: string;
  sublabel?: string;
  intervals?: RelatedChordInterval[];
  tab: FlatTabValue[];
  startFret: number;
  numFrets: number;
}

// A different chord, one change away from the one on screen (a different
// quality, the same notes under another name, the same shape in another
// key). Every card leaves for that chord's own page.
export function RelatedChordCard({
  href,
  label,
  sublabel,
  intervals,
  tab,
  startFret,
  numFrets,
}: Props) {
  return (
    <Link
      href={href}
      aria-label={`${label}${sublabel ? `, ${sublabel}` : ''}${intervals ? `: ${intervals.map((i) => i.label).join(' ')}` : ''}`}
      className="flex w-[132px] shrink-0 flex-col items-center gap-0.5 rounded-xl bg-surface-raised p-3 text-center hover:bg-surface-sunken hover:no-underline sm:w-36"
    >
      <span className="text-base font-bold">{label}</span>
      {sublabel && (
        <span className="text-xs text-fg-secondary">{sublabel}</span>
      )}
      {intervals && (
        <span className="mt-0.5 flex justify-center gap-1.5 font-mono text-xs">
          {intervals.map((interval, i) => (
            <span
              key={i}
              className={
                interval.changed ? 'font-bold text-accent' : 'text-fg-secondary'
              }
            >
              {interval.label}
            </span>
          ))}
        </span>
      )}
      <Fretboard
        numFrets={numFrets}
        startFret={startFret}
        title={label}
        className="mt-1.5 w-[88px]"
        aria-hidden="true"
      >
        <Pattern tab={tab} startFret={startFret} fillColor="#000" />
      </Fretboard>
    </Link>
  );
}
