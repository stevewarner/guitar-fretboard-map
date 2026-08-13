'use client';

import { useMemo } from 'react';
import {
  SpotlightOverlay,
  buildSpotlightShape,
  type SpotlightShape,
} from '@/components/FretboardChart';
import { NOTE_TO_PC } from '@/app/utils/constants';
import { transposeShape } from '@/modules/chordv2/utils/transposeShape';
import type { DiatonicChord } from '@/modules/scale/utils/scaleUtils';

const CHORD_ROOT_STRING = 4;
const CHORD_ROOT_FINGER = 1;
// A floor, not a cap — SpotlightOverlay widens past this automatically if a
// key's actual fret range needs more room (see the octave-repeat below).
const FRETBOARD_NUM_FRETS = 16;

interface FourNoteVoicingsOverlayProps {
  root: string;
  chords: DiatonicChord[];
  shapes: Record<'maj7' | 'm7' | '7' | 'm7b5', (number | 'x')[]>;
}

// Same merged-fretboard-plus-spotlight-legend pattern as the chord-shapes
// lessons' FullNeckOverlay, but the 7 shapes here differ by root *and*
// quality instead of just root string/finger — each diatonic chord gets its
// own transposition of its own quality's tab_relative, all at the same
// (string 4, finger 1) position.
function buildShapeLayer(
  tabRelative: (number | 'x')[],
  rootPc: number,
  label: string,
  includeRepeat: boolean,
): SpotlightShape | null {
  const transposed = transposeShape(
    tabRelative,
    CHORD_ROOT_STRING,
    CHORD_ROOT_FINGER,
    rootPc,
  );
  if (!transposed) return null;

  return buildSpotlightShape(transposed.tab, rootPc, label, includeRepeat);
}

export function FourNoteVoicingsOverlay({
  root,
  chords,
  shapes,
}: FourNoteVoicingsOverlayProps) {
  const shapeLayers = useMemo(
    () =>
      chords
        .map((chord, i) => {
          const quality = chord.quality as keyof typeof shapes;
          const tab = shapes[quality];
          if (!tab || tab.length === 0) return null;
          // I and vii only, each repeated an octave higher, so the reader
          // can see those two voicings reappear further up the neck instead
          // of taking the "shapes repeat every 12 frets" claim on faith. I
          // and vii specifically because they're adjacent scale degrees (the
          // leading tone sits right below the root), so their two octave-up
          // repeats land close together and read as one clear example
          // instead of two unrelated ones.
          return buildShapeLayer(
            tab,
            NOTE_TO_PC[chord.rootNote],
            `${chord.romanNumeral} – ${chord.name}`,
            i === 0 || i === chords.length - 1,
          );
        })
        .filter((shape): shape is SpotlightShape => shape !== null),
    [chords, shapes],
  );

  return (
    <SpotlightOverlay
      className="mb-4 mt-8"
      shapes={shapeLayers}
      caption={`All 7 diatonic chords of ${root} major, same 1-5-7-3 shape, on one fretboard.`}
      boardTitle={`${root} major diatonic 7th chords, 1-5-7-3 voicing, guitar fretboard diagram`}
      minNumFrets={FRETBOARD_NUM_FRETS}
      showIntervals={(isSpotlit) => isSpotlit}
    />
  );
}
