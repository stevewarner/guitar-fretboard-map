export type ChordFamily =
  | 'Major'
  | 'Minor'
  | 'Dominant'
  | 'Diminished'
  | 'Augmented'
  | 'Suspended';

export const CHORD_FAMILIES: ChordFamily[] = [
  'Major',
  'Minor',
  'Dominant',
  'Diminished',
  'Augmented',
  'Suspended',
];

const has = (intervals: number[], semitone: number) =>
  intervals.some((i) => i % 12 === semitone);

/**
 * Derive a chord's quality family from its interval set — no stored category needed.
 *
 * The third is read from `intervals[1]` (the sorted array's second element) rather
 * than `has(3)`/`has(4)`, so a #9 (15 ≡ 3) can't masquerade as a minor third.
 * The perfect 5th is checked first, so a #11 (18 ≡ 6) or b13 (20 ≡ 8) can't
 * masquerade as an altered fifth.
 */
export function classifyFamily(intervals: number[]): ChordFamily {
  const third = intervals[1];
  const perfectFifth = has(intervals, 7);
  const augmentedFifth = has(intervals, 8) && !perfectFifth;
  const diminishedFifth = has(intervals, 6) && !perfectFifth;
  const minorSeventh = has(intervals, 10);

  if (third !== 3 && third !== 4) return 'Suspended';
  if (third === 3) return diminishedFifth ? 'Diminished' : 'Minor';
  // Major third
  if (augmentedFifth) return 'Augmented';
  if (minorSeventh) return 'Dominant';
  return 'Major';
}
