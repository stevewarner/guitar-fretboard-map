'use client';

import { useMemo } from 'react';
import {
  SpotlightOverlay,
  type SpotlightShape,
} from '@/components/FretboardChart';
import { NOTE_TO_PC } from '@/app/utils/constants';
import {
  MAJOR_SCALE_INTERVALS,
  deriveScaleRender,
  mergeScaleRenderShape,
} from '@/modules/scale/utils/scaleUtils';
import { FINGER_ORDINAL, type Candidate } from './ScalePositionsExplorer';

interface FullNeckScaleOverlayProps {
  root: string;
  positions: Candidate[];
}

// Same fixed fret count as the chord-shapes lessons' FullNeckOverlay, so
// the 1st position's octave-up repeat (below) has room to show.
const FRETBOARD_NUM_FRETS = 15;

// Scale positions (unlike chord shapes) can have 2–3 notes on the same
// string within one window, split across deriveScaleRender's separate
// scaleTab/rootTab (so the root can be colored red on the individual
// per-position diagrams above). For this merged view every note in a
// position renders as one color regardless of scale-degree-vs-root, so the
// two are combined back into a single per-string tab — plus an octave-up
// repeat for the 1st position, so the reader can see its shape reappear
// further up the neck, not just take it on faith.
function buildShapeLayer(
  rootString: number,
  rootFinger: number,
  rootPc: number,
  includeRepeat: boolean,
  label: string,
): SpotlightShape {
  const rendered = deriveScaleRender(MAJOR_SCALE_INTERVALS, rootPc, {
    rootString: rootString as 6 | 5 | 4,
    rootFinger: rootFinger as 0 | 1 | 2 | 3 | 4,
  });
  return mergeScaleRenderShape(rendered, label, includeRepeat);
}

// Same merged-fretboard-plus-spotlight-legend pattern as the chord-shapes
// lessons' FullNeckOverlay (both now built on the shared SpotlightOverlay) —
// all 5 positions on one shared fretboard instead of isolated boxes, root
// controlled by the parent so both views stay in sync.
export function FullNeckScaleOverlay({
  root,
  positions,
}: FullNeckScaleOverlayProps) {
  const rootPc = NOTE_TO_PC[root];

  const shapes = useMemo(
    () =>
      positions.map(({ rootString, rootFinger }, i) =>
        buildShapeLayer(
          rootString,
          rootFinger,
          rootPc,
          i === 0,
          `${rootString}th String, ${FINGER_ORDINAL[rootFinger]} Finger`,
        ),
      ),
    [positions, rootPc],
  );

  return (
    <SpotlightOverlay
      className="mb-4 mt-8"
      shapes={shapes}
      caption={`All ${positions.length} positions of the ${root} major scale, on one fretboard.`}
      boardTitle={`${root} major scale, all ${positions.length} positions — guitar fretboard diagram`}
      minNumFrets={FRETBOARD_NUM_FRETS}
    />
  );
}
