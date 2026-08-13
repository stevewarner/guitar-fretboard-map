'use client';

import { useMemo } from 'react';
import {
  SpotlightOverlay,
  buildSpotlightShape,
  type SpotlightShape,
} from '@/components/FretboardChart';
import { transposeShape } from '@/modules/chordv2/utils/transposeShape';
import type { DbChordShape } from '@/modules/chordv2/db/queries';

const INVERSION_LABEL: Record<number, string> = {
  0: 'Root position',
  1: '1st inversion',
  2: '2nd inversion',
  3: '3rd inversion',
};

// A floor, not a cap — SpotlightOverlay widens past this automatically if
// this key's actual fret range needs more room.
const FRETBOARD_NUM_FRETS = 16;

interface VoicingInversionsOverlayProps {
  root: string;
  rootPc: number;
  quality: string;
  qualityIntervals: number[];
  shapes: DbChordShape[];
}

// Same merged-fretboard-plus-spotlight-legend pattern as four-note-voicings'
// own overlay, but every shape here is the same chord (same rootPc): only
// which chord tone is in the bass changes, so each shape is anchored by its
// own bass pc (rootPc + qualityIntervals[inversion]) rather than a shared
// one. Interval labels still read relative to the chord's real root, not
// the bass note, same reason ChordCard needs a separate labelRootPc for
// this lesson's individual cards.
function buildShapeLayer(
  shape: DbChordShape,
  rootPc: number,
  qualityIntervals: number[],
): SpotlightShape | null {
  const bassPc = (rootPc + (qualityIntervals[shape.inversion] ?? 0)) % 12;
  const transposed = transposeShape(
    shape.tab_relative,
    shape.bass_string ?? shape.root_string,
    shape.bass_finger ?? shape.root_finger ?? 1,
    bassPc,
  );
  if (!transposed) return null;

  // Root position and the 3rd inversion, each repeated an octave higher, so
  // the reader can trace the full climb: root, up through 1st/2nd/3rd
  // inversion, into the octave-up copy of the 3rd inversion (the 7th sitting
  // right below the octave root), and finally the octave-up root itself.
  // Same idea as four-note-voicings' own overlay showing I and vii twice,
  // the two shapes that bracket one full octave.
  const includeRepeat = shape.inversion === 0 || shape.inversion === 3;
  return buildSpotlightShape(
    transposed.tab,
    rootPc,
    INVERSION_LABEL[shape.inversion] ?? `${shape.inversion}th inversion`,
    includeRepeat,
  );
}

export function VoicingInversionsOverlay({
  root,
  rootPc,
  quality,
  qualityIntervals,
  shapes,
}: VoicingInversionsOverlayProps) {
  const shapeLayers = useMemo(
    () =>
      shapes
        .map((shape) => buildShapeLayer(shape, rootPc, qualityIntervals))
        .filter((shape): shape is SpotlightShape => shape !== null),
    [shapes, rootPc, qualityIntervals],
  );

  return (
    <SpotlightOverlay
      className="mb-4 mt-8"
      shapes={shapeLayers}
      caption={`All 4 inversions of ${root}${quality}, same chord, on one fretboard.`}
      boardTitle={`${root}${quality} chord, all 4 inversions, guitar fretboard diagram`}
      minNumFrets={FRETBOARD_NUM_FRETS}
      showIntervals={(isSpotlit) => isSpotlit}
    />
  );
}
