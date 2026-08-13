'use client';

import {
  Fretboard,
  Pattern,
  scaleChartLayers,
} from '@/components/FretboardChart';
import { PositionPicker, usePositionPicker } from '@/components/PositionPicker';
import {
  MAJOR_SCALE_INTERVALS,
  deriveScaleRender,
} from '@/modules/scale/utils/scaleUtils';

// The full 3-string × 5-finger matrix, live — unlike the earlier lessons
// (which each pick 5 representative positions for one particular chord or
// scale), this is the one page that lets a reader dial in any of the 15
// combinations directly and see exactly what "root string" and "finger on
// the root" mean as two independent choices.
export function HandPositionExplorer() {
  const {
    root,
    setRoot,
    rootPc,
    rootString,
    setRootString,
    rootFinger: finger,
    setRootFinger,
  } = usePositionPicker('A', 6, 1);

  const render = deriveScaleRender(MAJOR_SCALE_INTERVALS, rootPc, {
    rootString,
    rootFinger: finger,
  });
  const layers = scaleChartLayers(render);

  return (
    <div className="mb-4">
      <PositionPicker
        root={root}
        onRootChange={setRoot}
        rootPc={rootPc}
        rootString={rootString}
        onRootStringChange={setRootString}
        rootFinger={finger}
        onRootFingerChange={setRootFinger}
      />

      <div className="w-64">
        <Fretboard
          numFrets={render.numFrets}
          startFret={render.startFret > 1 ? render.startFret : undefined}
          fingerLabels={render.fingerLabels}
          title={`${root} major scale, root string ${rootString}, finger ${finger} — guitar fretboard diagram`}
        >
          {layers.map((layer, i) => (
            <Pattern key={i} {...layer} />
          ))}
        </Fretboard>
      </div>
    </div>
  );
}
