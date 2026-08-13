'use client';

import { useId, useState } from 'react';
import { RootSelect } from '@/components/RootSelect';
import { ChordCard } from '@/components/FretboardChart';
import { NOTE_TO_PC } from '@/app/utils/constants';
import type { DbChordShape } from '@/modules/chordv2/db/queries';
import { VoicingInversionsOverlay } from './VoicingInversionsOverlay';

const INVERSION_LABEL: Record<number, string> = {
  0: 'Root position',
  1: '1st inversion',
  2: '2nd inversion',
  3: '3rd inversion',
};

interface VoicingInversionsExplorerProps {
  defaultRoot: string;
  quality: string;
  // Semitone offsets of the chord's own tones (1, 3, 5, 7) above its root,
  // e.g. [0, 4, 7, 11] for maj7 — the same field the /chord page itself
  // reads to work out which pitch class is in the bass for a given
  // inversion (bass pc = root pc + qualityIntervals[inversion]).
  qualityIntervals: number[];
  shapes: DbChordShape[];
}

export function VoicingInversionsExplorer({
  defaultRoot,
  quality,
  qualityIntervals,
  shapes,
}: VoicingInversionsExplorerProps) {
  const [root, setRoot] = useState(defaultRoot);
  const selectId = useId();
  const rootPc = NOTE_TO_PC[root];

  return (
    <div className="mb-4">
      <RootSelect id={selectId} value={root} onChange={setRoot} />
      <div className="mt-4 flex flex-wrap gap-6">
        {shapes.map((shape) => {
          // The shape is fretted around its bass note, not necessarily the
          // chord's root, so it has to be positioned (and its own numbers,
          // 0/1/2/3, aren't semitones) by looking up how many semitones
          // that bass note sits above the root and transposing from there.
          const bassPc =
            (rootPc + (qualityIntervals[shape.inversion] ?? 0)) % 12;
          return (
            <ChordCard
              key={shape.id}
              quality={quality}
              rootNote={root}
              rootPc={bassPc}
              labelRootPc={rootPc}
              rootString={shape.bass_string ?? shape.root_string}
              rootFinger={shape.bass_finger ?? shape.root_finger ?? 1}
              tab={shape.tab_relative}
              label={
                INVERSION_LABEL[shape.inversion] ??
                `${shape.inversion}th inversion`
              }
              inversion={shape.inversion}
              showIntervals
            />
          );
        })}
      </div>
      <VoicingInversionsOverlay
        root={root}
        rootPc={rootPc}
        quality={quality}
        qualityIntervals={qualityIntervals}
        shapes={shapes}
      />
    </div>
  );
}
