'use client';

import { useId, useState } from 'react';
import { RootSelect } from '@/components/RootSelect';
import {
  ChordPositionsExplorer,
  type PositionSpec,
} from './ChordPositionsExplorer';
import { FullNeckOverlay } from './FullNeckOverlay';

interface ChordPositionsSectionProps {
  quality: string;
  defaultRoot: string;
  positions: PositionSpec[];
}

// One root picker for both views below — the diagram row and the merged
// full-neck overlay always show the same key, since they're two views of
// the same underlying set of positions, not two independent examples. Used
// by both learning-the-fretboard/chord-shapes and
// four-note-chord-shapes — the same "N positions of one chord, two ways
// of looking at them" shape, just a different quality per lesson.
export function ChordPositionsSection({
  quality,
  defaultRoot,
  positions,
}: ChordPositionsSectionProps) {
  const [root, setRoot] = useState(defaultRoot);
  const selectId = useId();

  return (
    <div className="mb-4">
      <RootSelect id={selectId} value={root} onChange={setRoot} />
      <ChordPositionsExplorer
        quality={quality}
        positions={positions}
        root={root}
      />
      <FullNeckOverlay quality={quality} root={root} positions={positions} />
    </div>
  );
}
