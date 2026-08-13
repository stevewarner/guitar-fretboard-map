'use client';

import { useId, useMemo, useState } from 'react';
import { RootSelect } from '@/components/RootSelect';
import { NOTE_TO_PC } from '@/app/utils/constants';
import {
  ScalePositionsExplorer,
  pickPositions,
} from './ScalePositionsExplorer';
import { FullNeckScaleOverlay } from './FullNeckScaleOverlay';

// One root picker for both views below — the 5-diagram row and the merged
// full-neck overlay always show the same key and the exact same 5 picked
// positions (pickPositions runs once here, not separately in each child),
// same "two views of one underlying set" shape as the chord-shapes
// lessons' ChordPositionsSection.
export function ScalePositionsSection() {
  const [root, setRoot] = useState('C');
  const selectId = useId();
  const rootPc = NOTE_TO_PC[root];
  const positions = useMemo(() => pickPositions(rootPc), [rootPc]);

  return (
    <div className="mb-4">
      <RootSelect id={selectId} value={root} onChange={setRoot} />
      <ScalePositionsExplorer root={root} positions={positions} />
      <FullNeckScaleOverlay root={root} positions={positions} />
    </div>
  );
}
