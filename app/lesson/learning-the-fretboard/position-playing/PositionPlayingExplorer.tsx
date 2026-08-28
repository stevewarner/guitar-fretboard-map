'use client';

import { useId, useState } from 'react';
import {
  Fretboard,
  Pattern,
  scaleChartLayersWithHighlight,
  describeChartForScreenReaders,
} from '@/components/FretboardChart';
import { PositionPicker, usePositionPicker } from '@/components/PositionPicker';
import {
  MAJOR_SCALE_INTERVALS,
  deriveScaleRender,
} from '@/modules/scale/utils/scaleUtils';

type ChordType = 'triad' | '7th';

const CHORD_TONES: Record<ChordType, (string | number)[]> = {
  triad: ['1', '3', '5'],
  '7th': ['1', '3', '5', '7'],
};

const CHORD_TYPE_LABELS: Record<ChordType, string> = {
  triad: 'Triad (1, 3, 5)',
  '7th': '7th chord (1, 3, 5, 7)',
};

// Same position system as Hand Positions, one layer richer: instead of
// coloring the root alone, this pulls the whole chord (triad or 7th chord)
// out of the scale shape in the lesson's one highlight color, so the reader
// sees exactly which of the scale's dots are also the chord — not a
// separate shape to learn, the same notes seen two ways.
export function PositionPlayingExplorer() {
  const {
    root,
    setRoot,
    rootPc,
    rootString,
    setRootString,
    rootFinger: finger,
    setRootFinger,
  } = usePositionPicker('A', 6, 1);
  const [chordType, setChordType] = useState<ChordType>('triad');
  const chordTypeSelectId = useId();

  const render = deriveScaleRender(MAJOR_SCALE_INTERVALS, rootPc, {
    rootString,
    rootFinger: finger,
  });
  const layers = scaleChartLayersWithHighlight(render, CHORD_TONES[chordType]);

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
      <div className="mb-4 flex items-center gap-2">
        <label className="text-sm font-medium" htmlFor={chordTypeSelectId}>
          Chord tones
        </label>
        <select
          id={chordTypeSelectId}
          className="text-sm"
          value={chordType}
          onChange={(e) => setChordType(e.target.value as ChordType)}
        >
          {(Object.keys(CHORD_TYPE_LABELS) as ChordType[]).map((type) => (
            <option key={type} value={type}>
              {CHORD_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>

      <div className="w-64">
        <Fretboard
          numFrets={render.numFrets}
          startFret={render.startFret > 1 ? render.startFret : undefined}
          fingerLabels={render.fingerLabels}
          title={`${root} major scale, root string ${rootString}, finger ${finger}, ${chordType} highlighted — guitar fretboard diagram`}
        >
          {layers.map((layer, i) => (
            <Pattern key={i} {...layer} />
          ))}
        </Fretboard>
        <p className="sr-only">{describeChartForScreenReaders(layers)}</p>
      </div>
    </div>
  );
}
