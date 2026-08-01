import { computeRootFret } from '@/app/utils/musicUtils';
import type { FlatTabValue } from '@/types';

export type TransposedShape = {
  tab: FlatTabValue[];
  startFret: number;
  numFrets: number;
};

/**
 * Convert a root-agnostic tab_relative into absolute fret numbers for a given key.
 *
 * tab_relative offsets are from the root fret (0 = root fret, positive = above).
 * rootFret is derived from root_string + root_finger + rootPc using the same
 * logic as computePositionWindow in scaleUtils.
 */
export function transposeShape(
  tabRelative: (number | 'x')[],
  rootString: number,
  rootFinger: number,
  rootPc: number,
): TransposedShape | null {
  let rootFret = computeRootFret(rootString, rootFinger, rootPc);
  // Only bump up an octave if the tab itself would produce negative fret numbers.
  // Window-start < 0 is not sufficient — a shape like [0,x,1,1,0,x] at rootFret=1
  // with rootFinger=2 produces valid frets [1,x,2,2,1,x] and must not be pushed to fret 13.
  const numericValues = tabRelative.filter(
    (v): v is number => typeof v === 'number',
  );
  const minAbsolute = numericValues.length
    ? Math.min(...numericValues) + rootFret
    : rootFret;
  if (minAbsolute < 0) rootFret += 12;

  const tab: FlatTabValue[] = tabRelative.map((v) =>
    v === 'x' ? 'x' : (v as number) + rootFret,
  );

  const hasOpenStrings = tab.some((v) => v === 0);
  const frettedValues = tab.filter(
    (v): v is number => typeof v === 'number' && v > 0,
  );

  if (!frettedValues.length && !hasOpenStrings) return null;

  if (hasOpenStrings) {
    const maxFret = frettedValues.length ? Math.max(...frettedValues) : 0;
    const numFrets = Math.max(4, maxFret);
    if (numFrets > 22) return null;
    return { tab, startFret: 1, numFrets };
  }

  const minFret = Math.min(...frettedValues);
  const maxFret = Math.max(...frettedValues);
  const numFrets = Math.max(4, maxFret - minFret + 1);

  // Cap at a 22-fret neck
  if (minFret + numFrets - 1 > 22) return null;

  return { tab, startFret: minFret, numFrets };
}
