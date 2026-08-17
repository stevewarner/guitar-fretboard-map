import Link from 'next/link';
import { Fretboard, Pattern } from '@/components/FretboardChart';
import { previewCardClassName } from '@/components/PreviewCard';
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
  // See previewCardClassName — 'plain' (default) is the border-only style
  // pages still on the old plain style must keep; 'raised' is the
  // redesigned pages' card treatment.
  variant?: 'plain' | 'raised';
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
  variant = 'plain',
}: Props) {
  const styles = previewCardClassName({ variant, className });
  return (
    <Link href={href} className={styles.link}>
      <span className={styles.label}>{label}</span>
      {sublabel && <span className={styles.sublabel}>{sublabel}</span>}
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
