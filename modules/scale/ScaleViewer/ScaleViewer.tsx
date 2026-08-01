import { Fretboard, Pattern } from '@/components/FretboardChart';
import { PositionControls } from '@/components/PositionControls';
import {
  deriveScaleRender,
  type ScalePosition,
} from '@/modules/scale/utils/scaleUtils';

interface ScaleViewerProps {
  modeIntervals: number[];
  modeTitle: string;
  // Pentatonic entries are genuinely scales, not modes of one another —
  // "pentatonic mode" isn't a term anyone uses. Everything else here (Lydian,
  // Phrygian Dominant, even the tonic Harmonic/Melodic Minor entries) is
  // conventionally called a mode. Passed in rather than hardcoded so this
  // stays correct as systems are added.
  patternKind: 'scale' | 'mode';
  rootNote: string;
  rootPc: number;
  position: ScalePosition;
}

export function ScaleViewer({
  modeIntervals,
  modeTitle,
  patternKind,
  rootNote,
  rootPc,
  position,
}: ScaleViewerProps) {
  const render = deriveScaleRender(modeIntervals, rootPc, position);

  return (
    <div>
      <PositionControls
        rootNote={rootNote}
        rootPc={rootPc}
        position={position}
      />

      <div className="w-64">
        <Fretboard
          numFrets={render.numFrets}
          startFret={render.startFret > 1 ? render.startFret : undefined}
          fingerLabels={render.fingerLabels}
          title={`${modeTitle} ${patternKind} in ${rootNote} — guitar fretboard diagram`}
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
