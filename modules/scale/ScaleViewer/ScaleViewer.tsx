import { Fretboard, Pattern } from '@/components/FretboardChart';
import { ScaleControls } from '@/modules/scale/ScaleControls';
import {
  deriveScaleRender,
  type ScalePosition,
} from '@/modules/scale/utils/scaleUtils';

interface ScaleViewerProps {
  modeIntervals: number[];
  rootNote: string;
  rootPc: number;
  position: ScalePosition;
}

export function ScaleViewer({ modeIntervals, rootNote, rootPc, position }: ScaleViewerProps) {
  const render = deriveScaleRender(modeIntervals, rootPc, position);

  return (
    <div>
      <ScaleControls rootNote={rootNote} rootPc={rootPc} position={position} />

      <div className="w-64">
        <Fretboard
          numFrets={render.numFrets}
          startFret={render.startFret > 1 ? render.startFret : undefined}
          fingerLabels={render.fingerLabels}
        >
          <Pattern
            tab={render.scaleTab}
            fillColor="#000"
            fillOpen
            intervals={render.scaleIntervalTab}
            startFret={render.patternStartFret}
          />
          <Pattern
            tab={render.rootTab}
            fillColor="#cc2200"
            fillOpen
            intervals={render.rootIntervalTab}
            startFret={render.patternStartFret}
          />
        </Fretboard>
      </div>
    </div>
  );
}
