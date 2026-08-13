'use client';

import { useMemo } from 'react';
import {
  SpotlightOverlay,
  buildSpotlightShape,
  type SpotlightShape,
} from '@/components/FretboardChart';
import { NOTE_TO_PC, PC_TO_NOTE } from '@/app/utils/constants';
import { transposeShape } from '@/modules/chordv2/utils/transposeShape';
import type { DiatonicChord } from '@/modules/scale/utils/scaleUtils';
import type { DegreeVoicing } from './OnePositionVoicingsExplorer';

// Same merged-fretboard-plus-spotlight-legend pattern as four-note-voicings'
// and voicing-inversions' own overlays, but each shape here differs by root,
// quality, *and* inversion, all anchored by their own bass pc — the whole
// point of this lesson is that they land close together without any help,
// so unlike those 2 overlays, no minNumFrets floor or octave repeat is
// added here: the diagram's natural width is the evidence.
function buildShapeLayer(
  chord: DiatonicChord,
  voicing: DegreeVoicing,
  qualityIntervals: Record<string, number[]>,
): SpotlightShape | null {
  const chordRootPc = NOTE_TO_PC[chord.rootNote];
  const intervals = qualityIntervals[voicing.quality] ?? [0];
  const bassPc = (chordRootPc + (intervals[voicing.inversion] ?? 0)) % 12;
  const transposed = transposeShape(
    voicing.tab,
    voicing.bassString,
    voicing.bassFinger,
    bassPc,
  );
  if (!transposed) return null;

  const label =
    voicing.inversion > 0
      ? `${chord.romanNumeral} – ${chord.name}/${PC_TO_NOTE[bassPc]}`
      : `${chord.romanNumeral} – ${chord.name}`;

  return buildSpotlightShape(transposed.tab, chordRootPc, label);
}

interface OnePositionVoicingsOverlayProps {
  root: string;
  chords: DiatonicChord[];
  voicings: Record<number, DegreeVoicing>;
  qualityIntervals: Record<string, number[]>;
}

export function OnePositionVoicingsOverlay({
  root,
  chords,
  voicings,
  qualityIntervals,
}: OnePositionVoicingsOverlayProps) {
  const shapeLayers = useMemo(
    () =>
      chords
        .map((chord) => {
          const voicing = voicings[chord.degree];
          if (!voicing || !voicing.tab.length) return null;
          return buildShapeLayer(chord, voicing, qualityIntervals);
        })
        .filter((shape): shape is SpotlightShape => shape !== null),
    [chords, voicings, qualityIntervals],
  );

  return (
    <SpotlightOverlay
      className="mb-4 mt-8"
      shapes={shapeLayers}
      caption={`Every chord above, merged onto one fretboard. Press a chord to spotlight its shape in ${root} major.`}
      boardTitle={`${root} major diatonic chords, one hand position, guitar fretboard diagram`}
      showIntervals={(isSpotlit) => isSpotlit}
    />
  );
}
