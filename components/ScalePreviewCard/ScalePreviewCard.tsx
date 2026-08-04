import Link from 'next/link';
import { Fretboard, Pattern } from '@/components/FretboardChart';
import {
  deriveScaleRender,
  DEFAULT_POSITION,
  type ScalePosition,
} from '@/modules/scale/utils/scaleUtils';

interface Props {
  href: string;
  label: string;
  modeIntervals: number[];
  rootPc: number;
  position?: ScalePosition;
  className?: string;
}

export function ScalePreviewCard({
  href,
  label,
  modeIntervals,
  rootPc,
  position = DEFAULT_POSITION,
  className = '',
}: Props) {
  const render = deriveScaleRender(modeIntervals, rootPc, position);

  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-1 rounded border border-current px-3 py-2 hover:bg-surface-sunken ${className}`}
    >
      <span className="text-center text-xs font-medium">{label}</span>
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
          fillColor="#fff"
          fillOpen
          startFret={render.patternStartFret}
        />
      </Fretboard>
    </Link>
  );
}
