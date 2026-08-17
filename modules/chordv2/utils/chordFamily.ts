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

// Plain-language construction of the family's base triad/chord — generic to
// the family, not the specific quality (e.g. maj7's own 7th is described
// separately, alongside its own interval list). Targets searches phrased
// around the family name itself ("C major guitar chord", "what is a
// diminished chord") rather than a specific quality symbol.
export const FAMILY_DESCRIPTIONS: Record<ChordFamily, string> = {
  Major: 'The major triad is constructed from the 1, 3, and 5 intervals.',
  Minor: 'The minor triad is constructed from the 1, b3, and 5 intervals.',
  Dominant: 'A dominant chord is a major triad (1, 3, 5) with an added b7.',
  Diminished:
    'The diminished triad is constructed from the 1, b3, and b5 intervals.',
  Augmented:
    'The augmented triad is constructed from the 1, 3, and #5 intervals.',
  Suspended:
    'A suspended chord replaces the 3rd with the 2nd (sus2) or the 4th (sus4).',
};

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
