'use client';

import { useId, useMemo, useState } from 'react';
import { RootSelect } from '@/components/RootSelect';
import { ChordCard } from '@/components/FretboardChart';
import { NOTE_TO_PC } from '@/app/utils/constants';
import {
  MAJOR_SCALE_INTERVALS,
  getDiatonicChords,
} from '@/modules/scale/utils/scaleUtils';
import { FourNoteVoicingsOverlay } from './FourNoteVoicingsOverlay';

// Every voicing here is anchored to the 4th string, 1st finger — the same
// real chord_shapes rows, one per quality, that make up the 1-5-7-3
// arrangement (verified low to high: 1 on string 4, 5 on string 3, 7 on
// string 2, 3 on string 1, for all four qualities).
const CHORD_ROOT_STRING = 4;
const CHORD_ROOT_FINGER = 1;

interface FourNoteVoicingsExplorerProps {
  defaultRoot: string;
  shapes: Record<'maj7' | 'm7' | '7' | 'm7b5', (number | 'x')[]>;
}

export function FourNoteVoicingsExplorer({
  defaultRoot,
  shapes,
}: FourNoteVoicingsExplorerProps) {
  const [root, setRoot] = useState(defaultRoot);
  const selectId = useId();
  const chords = useMemo(
    () => getDiatonicChords(MAJOR_SCALE_INTERVALS, root) ?? [],
    [root],
  );

  return (
    <div className="mb-4">
      <RootSelect id={selectId} value={root} onChange={setRoot} label="Key" />
      <div className="mt-4 flex flex-wrap gap-6">
        {chords.map((chord) => {
          const quality = chord.quality as keyof typeof shapes;
          const tab = shapes[quality];
          if (!tab || tab.length === 0) return null;
          return (
            <ChordCard
              key={chord.degree}
              quality={quality}
              rootNote={chord.rootNote}
              rootPc={NOTE_TO_PC[chord.rootNote]}
              rootString={CHORD_ROOT_STRING}
              rootFinger={CHORD_ROOT_FINGER}
              tab={tab}
              label={`${chord.romanNumeral} – ${chord.name}`}
              showIntervals
            />
          );
        })}
      </div>
      <FourNoteVoicingsOverlay root={root} chords={chords} shapes={shapes} />
    </div>
  );
}
