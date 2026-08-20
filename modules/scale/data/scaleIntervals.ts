// Mirrors the `scales` table (see docs/CHORDS_V2.md) — pitch-class interval
// sets never change at runtime, so this replaces a per-request DB read
// entirely rather than caching it. If a new scale is ever added to the
// table, add its row here too.
export const SCALE_INTERVALS: Record<string, number[]> = {
  blues: [0, 3, 5, 6, 7, 10],
  harmonic_minor: [0, 2, 3, 5, 7, 8, 11],
  major: [0, 2, 4, 5, 7, 9, 11],
  melodic_minor: [0, 2, 3, 5, 7, 9, 11],
  natural_minor: [0, 2, 3, 5, 7, 8, 10],
  pentatonic_major: [0, 2, 4, 7, 9],
  pentatonic_minor: [0, 3, 5, 7, 10],
};
