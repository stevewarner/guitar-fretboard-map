import {
  Fretboard,
  Pattern,
  scaleChartDefaultLayer,
} from '@/components/FretboardChart';
import { PositionControls } from '@/components/PositionControls';
import { Panel } from '@/components/Panel';
import {
  RootHighlightProvider,
  RootHighlightToggle,
  RootHighlightLayer,
} from '@/components/RootHighlightToggle';
import { ACCENT_HEX } from '@/app/utils/constants';
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
  // Library page — every note in the default color, root included, per
  // docs/STYLE_GUIDE.md — unless the reader opts into RootHighlightToggle,
  // which layers an accent-colored root overlay on top (always computed;
  // RootHighlightLayer decides whether to show it).
  const layer = scaleChartDefaultLayer(render);

  return (
    <RootHighlightProvider>
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <PositionControls
            rootNote={rootNote}
            rootPc={rootPc}
            position={position}
          />
          <RootHighlightToggle />
        </div>

        <p className="sr-only" aria-live="polite">
          {`Showing ${modeTitle} ${patternKind} in ${rootNote}, string ${position.rootString}, position ${position.rootFinger}`}
        </p>

        <div className="mt-4 w-64">
          <Fretboard
            numFrets={render.numFrets}
            startFret={render.startFret > 1 ? render.startFret : undefined}
            fingerLabels={render.fingerLabels}
            title={`${modeTitle} ${patternKind} in ${rootNote} — guitar fretboard diagram`}
          >
            <Pattern {...layer} />
            <RootHighlightLayer>
              <Pattern
                tab={render.rootTab}
                intervals={render.rootIntervalTab}
                fillColor={ACCENT_HEX}
                fillOpen
                startFret={render.patternStartFret}
              />
            </RootHighlightLayer>
          </Fretboard>
        </div>
      </Panel>
    </RootHighlightProvider>
  );
}
