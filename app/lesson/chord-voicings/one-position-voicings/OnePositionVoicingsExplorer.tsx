'use client';

import { useId, useMemo, useState } from 'react';
import { RootSelect } from '@/components/RootSelect';
import { ChordCard } from '@/components/FretboardChart';
import { NOTE_TO_PC, PC_TO_NOTE } from '@/app/utils/constants';
import {
  MAJOR_SCALE_INTERVALS,
  getDiatonicChords,
  type DiatonicChord,
} from '@/modules/scale/utils/scaleUtils';
import { OnePositionVoicingsOverlay } from './OnePositionVoicingsOverlay';

export interface DegreeVoicing {
  quality: string;
  // 0 = root position, otherwise which chord tone is in the bass (1st,
  // 2nd, 3rd inversion), same numbering as chord_shapes.inversion.
  inversion: number;
  bassString: number;
  bassFinger: number;
  tab: (number | 'x')[];
}

// Bass pc and card label share the same "which chord tone is in the bass"
// math as VoicingInversionsExplorer: root position (inversion 0) always
// resolves to the chord's own root, no branching needed.
function describeVoicing(
  chord: DiatonicChord,
  voicing: DegreeVoicing,
  qualityIntervals: Record<string, number[]>,
) {
  const chordRootPc = NOTE_TO_PC[chord.rootNote];
  const intervals = qualityIntervals[voicing.quality] ?? [0];
  const bassPc = (chordRootPc + (intervals[voicing.inversion] ?? 0)) % 12;
  const label =
    voicing.inversion > 0
      ? `${chord.romanNumeral} – ${chord.name}/${PC_TO_NOTE[bassPc]}`
      : `${chord.romanNumeral} – ${chord.name}`;
  return { chordRootPc, bassPc, label };
}

interface OnePositionVoicingsExplorerProps {
  defaultRoot: string;
  // The individual chord-card grid's voicings.
  cardVoicings: Record<number, DegreeVoicing>;
  // The merged, one-fretboard example's voicings below the cards. Kept
  // separate from cardVoicings since vi intentionally differs between the
  // 2: the card grid uses vi's 3rd inversion (same string 4, 1st finger
  // position as ii/iii/IV), the merged example keeps vi's plain
  // root-position shape on the 6th string, a genuinely different position.
  overlayVoicings: Record<number, DegreeVoicing>;
  // Semitone offsets of each quality's own chord tones above its root, e.g.
  // maj7 -> [0, 4, 7, 11] — same field the /chord page itself reads to work
  // out which pitch class is in the bass for a given inversion.
  qualityIntervals: Record<string, number[]>;
}

export function OnePositionVoicingsExplorer({
  defaultRoot,
  cardVoicings,
  overlayVoicings,
  qualityIntervals,
}: OnePositionVoicingsExplorerProps) {
  const [root, setRoot] = useState(defaultRoot);
  const selectId = useId();
  const chords = useMemo(
    () => getDiatonicChords(MAJOR_SCALE_INTERVALS, root) ?? [],
    [root],
  );
  const progressionChords = useMemo(
    () => chords.filter((chord) => cardVoicings[chord.degree]?.tab.length),
    [chords, cardVoicings],
  );

  return (
    <div className="mb-4">
      <RootSelect id={selectId} value={root} onChange={setRoot} label="Key" />
      <div className="mt-4 flex flex-wrap gap-6">
        {progressionChords.map((chord) => {
          const voicing = cardVoicings[chord.degree];
          const { bassPc, chordRootPc, label } = describeVoicing(
            chord,
            voicing,
            qualityIntervals,
          );
          return (
            <ChordCard
              key={chord.degree}
              quality={voicing.quality}
              rootNote={chord.rootNote}
              rootPc={bassPc}
              labelRootPc={chordRootPc}
              rootString={voicing.bassString}
              rootFinger={voicing.bassFinger}
              tab={voicing.tab}
              label={label}
              inversion={voicing.inversion}
              showIntervals
            />
          );
        })}
      </div>
      <OnePositionVoicingsOverlay
        root={root}
        chords={progressionChords}
        voicings={overlayVoicings}
        qualityIntervals={qualityIntervals}
      />
    </div>
  );
}
