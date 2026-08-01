import { INTERVAL_LABELS } from '@/app/utils/constants';

const EXTENDED: Record<number, string> = {
  13: 'b9',
  14: '9',
  15: '#9',
  16: 'b11',
  17: '11',
  18: '#11',
  20: 'b13',
  21: '13',
};

export function intervalsToDegrees(
  intervals: number[],
  overrides: Record<number, string> = {},
): string[] {
  return intervals.map(
    (i) => overrides[i] ?? EXTENDED[i] ?? INTERVAL_LABELS[i % 12] ?? String(i),
  );
}

// Build a pitch-class (0–11) → label map from a chord's interval list.
// Extended intervals (≥13) produce their extended name (9, #11, 13…) rather than
// the basic mod-12 name (2, b5, 6…), preserving the convention that intervals
// above a 7th are named in their extended form.
// interval_overrides take highest priority (e.g. {"8": "#5"} for maj7#5).
export function buildDotLabelMap(
  intervals: number[],
  overrides: Record<string, string> = {},
): Record<number, string> {
  const map: Record<number, string> = {};
  for (const interval of intervals) {
    const pc = interval % 12;
    map[pc] =
      overrides[String(interval)] ??
      overrides[String(pc)] ??
      EXTENDED[interval] ??
      INTERVAL_LABELS[pc];
  }
  return map;
}
