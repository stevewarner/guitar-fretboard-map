import { STANDARD_TUNING_PC, INTERVAL_LABELS } from '@/app/utils/constants';
import type { FlatTabValue } from '@/types';

export function intervalLabels(
  tab: FlatTabValue[],
  rootPc: number,
): (string | undefined)[] {
  return tab.map((fret, si) => {
    if (fret === 'x' || fret === undefined) return undefined;
    return INTERVAL_LABELS[
      (STANDARD_TUNING_PC[si] + (fret as number) - rootPc + 120) % 12
    ];
  });
}

export function computeFingerLabels(
  startFret: number,
  numFrets: number,
  rootFret: number,
  rootFinger: number,
): string[] {
  return Array.from({ length: numFrets }, (_, i) => {
    const finger = rootFinger + (startFret + i - rootFret);
    return finger >= 1 && finger <= 4 ? String(finger) : '';
  });
}

export function computeRootFret(
  rootString: number,
  rootFinger: number,
  rootPc: number,
): number {
  const si = 6 - rootString;
  const openPc = STANDARD_TUNING_PC[si];
  const rawRootFret = (rootPc - openPc + 12) % 12;
  // Only bump when the root itself is an open string on a fingered position.
  // Window-start bumping is intentionally omitted here — shapes like [1,x,2,2,1,x]
  // are valid at their natural fret even when rootFinger > rootFret.
  return rawRootFret === 0 && rootFinger !== 0 ? 12 : rawRootFret;
}
