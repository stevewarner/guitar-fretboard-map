'use client';

import { useMemo } from 'react';
import { NOTE_TO_PC } from '@/app/utils/constants';
import { transposeShape } from '@/modules/chordv2/utils/transposeShape';
import { SpotlightOverlay, type SpotlightShape } from './SpotlightOverlay';
import { buildSpotlightShape } from './buildSpotlightShape';
import type { PositionSpec } from './ChordPositionsExplorer';

interface FullNeckOverlayProps {
  quality: string;
  root: string;
  positions: PositionSpec[];
}

const FRETBOARD_NUM_FRETS = 15;

// One nested tab (array per string, each listing that shape's frets on that
// string) per position, plus the matching interval label for every one of
// those frets. Position 0 also carries its own notes repeated one octave up
// — shown so the reader can see the 1st position's shape reappear further up
// the neck, not just take it on faith.
function buildShapeLayer(
  position: PositionSpec,
  rootPc: number,
  includeRepeat: boolean,
): SpotlightShape | null {
  const transposed = transposeShape(
    position.tab,
    position.rootString,
    position.rootFinger,
    rootPc,
  );
  if (!transposed) return null;

  return buildSpotlightShape(
    transposed.tab,
    rootPc,
    position.label,
    includeRepeat,
  );
}

// Every position lands on one shared fretboard — the same shapes as
// ChordPositionsExplorer's row, now visibly connected across the neck
// instead of isolated in their own boxes. Root is controlled by the parent
// (no picker of its own) so both views stay in sync off one selection.
export function FullNeckOverlay({
  quality,
  root,
  positions,
}: FullNeckOverlayProps) {
  const rootPc = NOTE_TO_PC[root];

  const shapes = useMemo(
    () =>
      positions
        .map((position, i) => buildShapeLayer(position, rootPc, i === 0))
        .filter((shape): shape is SpotlightShape => shape !== null),
    [positions, rootPc],
  );

  return (
    <SpotlightOverlay
      shapes={shapes}
      caption={`All ${positions.length} positions of ${root}${quality}, on one fretboard.`}
      boardTitle={`${root}${quality} chord, all ${positions.length} positions — guitar fretboard diagram`}
      minNumFrets={FRETBOARD_NUM_FRETS}
      // Pattern leaves open-string (fret 0) dots unfilled by default
      // regardless of fillColor — fine for the default black rendering
      // (matches every other diagram's open-note convention), but it meant a
      // spotlighted shape's open notes stayed white instead of turning its
      // color. Only fill them in while a shape is the one spotlighted.
      fillOpen={(isSpotlit) => isSpotlit}
    />
  );
}
