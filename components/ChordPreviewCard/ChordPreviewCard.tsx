import Link from 'next/link';
import { Fretboard, Pattern } from '@/components/FretboardChart';
import type { FlatTabValue } from '@/types';

interface Props {
  href: string;
  label: string;
  sublabel?: string;
  note?: string;
  tab: FlatTabValue[];
  startFret: number;
  numFrets: number;
  showFretLabel?: boolean;
  className?: string;
}

export function ChordPreviewCard({
  href,
  label,
  sublabel,
  note,
  tab,
  startFret,
  numFrets,
  showFretLabel = true,
  className = '',
}: Props) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-1 rounded border border-current px-3 py-2 hover:bg-surface-sunken ${className}`}
    >
      <span className="text-center text-xs font-medium">{label}</span>
      {sublabel && (
        <span className="text-center text-xs text-fg-secondary">
          {sublabel}
        </span>
      )}
      {note && (
        <span className="text-center text-xs text-fg-secondary">{note}</span>
      )}
      <Fretboard
        numFrets={numFrets}
        startFret={startFret}
        title={label}
        showFretLabel={showFretLabel}
        className="mt-1 w-full"
        aria-hidden="true"
      >
        <Pattern tab={tab} startFret={startFret} fillColor="#000" />
      </Fretboard>
    </Link>
  );
}
