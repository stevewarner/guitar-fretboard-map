import Link from 'next/link';
import { Fretboard, Pattern } from '@/components/FretboardChart';
import { previewCardClassName } from '@/components/PreviewCard';
import { ACCENT_HEX } from '@/app/utils/constants';
import {
  deriveScaleRender,
  DEFAULT_POSITION,
  type ScalePosition,
} from '@/modules/scale/utils/scaleUtils';

interface Props {
  href: string;
  label: string;
  sublabel?: string;
  modeIntervals: number[];
  rootPc: number;
  position?: ScalePosition;
  className?: string;
  // See previewCardClassName — same 'plain'/'raised' contract as
  // ChordPreviewCard.
  variant?: 'plain' | 'raised';
  // Fill color for the root-note dots layered on top of the scale tones.
  // Defaults to the accent color — this card is homepage-only (see below),
  // where root highlighting is part of the design; the plain library pages
  // (ScaleViewer) intentionally don't highlight roots, per STYLE_GUIDE.md.
  rootColor?: string;
}

export function ScalePreviewCard({
  href,
  label,
  sublabel,
  modeIntervals,
  rootPc,
  position = DEFAULT_POSITION,
  className = '',
  variant = 'plain',
  rootColor = ACCENT_HEX,
}: Props) {
  const render = deriveScaleRender(modeIntervals, rootPc, position);
  const styles = previewCardClassName({ variant, className });

  return (
    <Link href={href} className={styles.link}>
      <span className={styles.label}>{label}</span>
      {sublabel && <span className={styles.sublabel}>{sublabel}</span>}
      <Fretboard
        numFrets={render.numFrets}
        title={label}
        className="mt-1 w-full"
        aria-hidden="true"
      >
        <Pattern
          tab={render.scaleTab}
          fillColor="#000"
          fillOpen
          startFret={render.patternStartFret}
        />
        <Pattern
          tab={render.rootTab}
          fillColor={rootColor}
          fillOpen
          startFret={render.patternStartFret}
        />
      </Fretboard>
    </Link>
  );
}
