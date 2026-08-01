import { STANDARD_TUNING_PC } from '@/app/utils/constants';
import { computeRootFret } from '@/app/utils/musicUtils';

function presentIntervals(
  tabRelative: (number | 'x')[],
  rootString: number,
  rootFinger: number,
  rootPc: number,
): Set<number> {
  const rootFret = computeRootFret(rootString, rootFinger, rootPc);
  const present = new Set<number>();
  tabRelative.forEach((v, i) => {
    if (v === 'x') return;
    present.add(
      (STANDARD_TUNING_PC[i] + (v as number) + rootFret - rootPc + 120) % 12,
    );
  });
  return present;
}

export function getMissingIntervalPcs(
  tabRelative: (number | 'x')[],
  rootString: number,
  rootFinger: number,
  rootPc: number,
  requiredIntervals: number[],
): Set<number> {
  const present = presentIntervals(tabRelative, rootString, rootFinger, rootPc);
  const missing = requiredIntervals
    .map((i) => i % 12)
    .filter((i) => !present.has(i));
  return new Set(missing);
}
