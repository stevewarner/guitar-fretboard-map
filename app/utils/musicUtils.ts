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

export const STRING_LABELS: Record<number, string> = {
  6: '6th string',
  5: '5th string',
  4: '4th string',
};

const FINGER_LABELS: Record<number, string> = {
  0: 'stretch 1st finger',
  1: '1st finger',
  2: '2nd finger',
  3: '3rd finger',
  4: '4th finger',
};

export function fingerLabel(
  finger: number,
  rootString: number,
  rootPc: number,
  zeroOverride?: 'open' | 'stretch',
): string {
  if (finger === 0) {
    if (zeroOverride)
      return zeroOverride === 'open' ? 'open' : FINGER_LABELS[0];
    const openPc = STANDARD_TUNING_PC[6 - rootString];
    if ((rootPc - openPc + 12) % 12 === 0) return 'open';
  }
  return FINGER_LABELS[finger];
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
