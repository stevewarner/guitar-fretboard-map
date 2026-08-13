'use client';

import Link from 'next/link';
import { NOTE_TO_PC } from '@/app/utils/constants';
import { transposeShape } from '@/modules/chordv2/utils/transposeShape';
import { Fretboard } from './Fretboard';
import { Pattern } from './Pattern';

export interface PositionSpec {
  label: string;
  rootString: number;
  rootFinger: number;
  tab: (number | 'x')[];
}

interface ChordPositionsExplorerProps {
  quality: string;
  positions: PositionSpec[];
  // Controlled by the parent (e.g. ChordPositionsSection) so a second view
  // (FullNeckOverlay) can stay in sync off the same root.
  root: string;
}

// One root picker drives every position — same chord, same key, several
// different places on the neck. Each position keeps its own real
// chord_shapes tab (fetched server-side), so this is exactly what re-picking
// string+position on a /chord page would show, not an approximation. Used by
// learning-the-fretboard/chord-shapes — shared here (rather than
// colocated with that one lesson) since it's the kind of thing a future
// lesson could reuse too.
export function ChordPositionsExplorer({
  quality,
  positions,
  root,
}: ChordPositionsExplorerProps) {
  const rootPc = NOTE_TO_PC[root];

  return (
    <div className="mb-4">
      <div className="mt-4 flex flex-wrap gap-6">
        {positions.map((position) => {
          const transposed = transposeShape(
            position.tab,
            position.rootString,
            position.rootFinger,
            rootPc,
          );
          if (!transposed) return null;
          return (
            <Link
              key={position.label}
              href={`/chord/${encodeURIComponent(quality)}?root=${encodeURIComponent(root)}&string=${position.rootString}&position=${position.rootFinger}`}
              className="hover:opacity-80"
            >
              <p className="mb-1 text-xs font-semibold tracking-widest text-fg-secondary">
                {position.label}
              </p>
              <div className="w-40">
                <Fretboard
                  numFrets={transposed.numFrets}
                  startFret={transposed.startFret}
                  title={`${root}${quality} chord, ${position.label} — guitar fretboard diagram`}
                >
                  <Pattern
                    tab={transposed.tab}
                    startFret={transposed.startFret}
                    fillColor="#000"
                  />
                </Fretboard>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
