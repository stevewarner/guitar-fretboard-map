'use client';

import { useId, useState } from 'react';
import { RootSelect } from '@/components/RootSelect';
import { ChordCard } from '@/components/FretboardChart';
import { NOTE_TO_PC } from '@/app/utils/constants';
import {
  MAJOR_SCALE_INTERVALS,
  getDiatonicChords,
} from '@/modules/scale/utils/scaleUtils';

// Root on 5th string, 1st finger — same position the diatonic-sevenths grid
// above uses, so this example's shapes look like the same family.
const CHORD_ROOT_STRING = 5;
const CHORD_ROOT_FINGER = 1;

type SeventhQuality = 'maj7' | 'm7' | '7' | 'm7b5';

interface SeventhChordExampleProps {
  numeralsLabel: string;
  // Scale degrees (1–7) in progression order.
  degrees: number[];
  defaultRoot: string;
  description: string;
  shapes: Record<SeventhQuality, (number | 'x')[]>;
}

export function SeventhChordExample({
  numeralsLabel,
  degrees,
  defaultRoot,
  description,
  shapes,
}: SeventhChordExampleProps) {
  const [root, setRoot] = useState(defaultRoot);
  const selectId = useId();
  const chords = getDiatonicChords(MAJOR_SCALE_INTERVALS, root) ?? [];

  return (
    <div className="mb-4">
      <p className="font-mono text-lg font-semibold">{numeralsLabel}</p>
      <p className="mb-3 text-sm text-fg-secondary">{description}</p>
      <RootSelect id={selectId} value={root} onChange={setRoot} />
      <div className="mt-4 flex flex-wrap gap-6">
        {degrees.map((degree, i) => {
          const chord = chords[degree - 1];
          if (!chord) return null;
          const tab = shapes[chord.quality as SeventhQuality];
          if (!tab) return null;
          return (
            <ChordCard
              key={i}
              quality={chord.quality}
              rootNote={chord.rootNote}
              rootPc={NOTE_TO_PC[chord.rootNote]}
              rootString={CHORD_ROOT_STRING}
              rootFinger={CHORD_ROOT_FINGER}
              tab={tab}
              label={`${chord.romanNumeral} – ${chord.name}`}
            />
          );
        })}
      </div>
    </div>
  );
}
