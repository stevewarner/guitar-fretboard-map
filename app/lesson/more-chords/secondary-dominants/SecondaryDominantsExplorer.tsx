'use client';

import { useId, useState } from 'react';
import { RootSelect } from '@/components/RootSelect';
import { ChordCard } from '@/components/FretboardChart';
import { NOTE_TO_PC } from '@/app/utils/constants';
import {
  MAJOR_SCALE_INTERVALS,
  getDiatonicChords,
} from '@/modules/scale/utils/scaleUtils';

// Root on the 5th string throughout — same convention as every other chord
// grid on this site.
const CHORD_ROOT_STRING = 5;
const CHORD_ROOT_FINGER = 1;
// V/I would just be the key's own diatonic V — not "secondary" to anything.
// V/vii targets a diminished chord and isn't a standard secondary dominant
// in practice, so it's left out too.
const TARGET_DEGREES = [2, 3, 4, 5, 6];

interface SecondaryDominantsExplorerProps {
  defaultRoot: string;
  shapes: Record<'7' | 'm7' | 'maj7', (number | 'x')[]>;
}

// A secondary dominant's root is always a perfect 5th above its target —
// which, for every target but I and vii (both excluded above), lands
// exactly on another degree already in the diatonic set. Rather than
// re-deriving note spelling, reuse that degree's own already-correctly
// spelled rootNote from getDiatonicChords instead of computing a new one.
function findRootNoteForPc(
  chords: ReturnType<typeof getDiatonicChords>,
  pc: number,
): string | undefined {
  return chords?.find((c) => NOTE_TO_PC[c.rootNote] === pc)?.rootNote;
}

export function SecondaryDominantsExplorer({
  defaultRoot,
  shapes,
}: SecondaryDominantsExplorerProps) {
  const [root, setRoot] = useState(defaultRoot);
  const selectId = useId();
  const chords = getDiatonicChords(MAJOR_SCALE_INTERVALS, root) ?? [];

  return (
    <div className="mb-4">
      <RootSelect id={selectId} value={root} onChange={setRoot} />
      <div className="mt-4 flex flex-col gap-6">
        {TARGET_DEGREES.map((degree) => {
          const target = chords[degree - 1];
          if (!target) return null;
          const targetPc = NOTE_TO_PC[target.rootNote];
          const secondaryPc = (targetPc + 7) % 12;
          const secondaryRootNote = findRootNoteForPc(chords, secondaryPc);
          if (!secondaryRootNote) return null;
          const targetQuality = target.quality as '7' | 'm7' | 'maj7';

          return (
            <div key={degree}>
              <p className="font-mono text-sm font-semibold">
                V/{target.romanNumeral}
              </p>
              <p className="mb-2 text-sm text-fg-secondary">
                resolves to {target.romanNumeral}
              </p>
              <div className="flex flex-wrap items-start gap-6">
                <ChordCard
                  quality="7"
                  rootNote={secondaryRootNote}
                  rootPc={NOTE_TO_PC[secondaryRootNote]}
                  rootString={CHORD_ROOT_STRING}
                  rootFinger={CHORD_ROOT_FINGER}
                  tab={shapes['7']}
                  label={`${secondaryRootNote}7`}
                />
                <ChordCard
                  quality={targetQuality}
                  rootNote={target.rootNote}
                  rootPc={NOTE_TO_PC[target.rootNote]}
                  rootString={CHORD_ROOT_STRING}
                  rootFinger={CHORD_ROOT_FINGER}
                  tab={shapes[targetQuality]}
                  label={target.name}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
