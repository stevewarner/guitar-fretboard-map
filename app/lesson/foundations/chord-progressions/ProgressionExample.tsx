'use client';

import { useId, useState } from 'react';
import { RootSelect } from '@/components/RootSelect';
import { ChordCard } from '@/components/FretboardChart';
import { NOTE_TO_PC } from '@/app/utils/constants';
import {
  MAJOR_SCALE_INTERVALS,
  getDiatonicTriads,
} from '@/modules/scale/utils/scaleUtils';

// Root on 5th string, 1st finger — the same real chord_shapes rows the
// diatonic-harmony lesson's chord grid uses (ids 7 and 22).
const CHORD_ROOT_STRING = 5;
const CHORD_ROOT_FINGER = 1;

interface ProgressionExampleProps {
  // Display string for the header, e.g. "I – IV – V".
  numeralsLabel: string;
  // Scale degrees (1–7) in progression order — not necessarily ascending,
  // and may repeat. e.g. [1, 4, 5] for I–IV–V, [2, 5, 1, 6] for ii–V–I–vi.
  degrees: number[];
  defaultRoot: string;
  description: string;
  // Only 'maj' and 'm' shapes are needed — I, ii, IV, V, vi never resolve to
  // the vii°/mb5 quality within a plain major-key progression.
  shapes: { maj: (number | 'x')[]; m: (number | 'x')[] };
}

export function ProgressionExample({
  numeralsLabel,
  degrees,
  defaultRoot,
  description,
  shapes,
}: ProgressionExampleProps) {
  const [root, setRoot] = useState(defaultRoot);
  const selectId = useId();
  const triads = getDiatonicTriads(MAJOR_SCALE_INTERVALS, root) ?? [];

  return (
    <div className="mb-8">
      <p className="font-mono text-lg font-semibold">{numeralsLabel}</p>
      <p className="mb-3 text-sm text-fg-secondary">{description}</p>
      <RootSelect id={selectId} value={root} onChange={setRoot} />
      <div className="mt-4 flex flex-wrap gap-6">
        {degrees.map((degree, i) => {
          const chord = triads[degree - 1];
          if (!chord) return null;
          const tab = chord.quality === 'm' ? shapes.m : shapes.maj;
          return (
            <ChordCard
              // Position in the progression, not the scale degree — the same
              // degree can repeat within one progression (not here, but the
              // component supports it), so degree alone isn't a unique key.
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
