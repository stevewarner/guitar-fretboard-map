// Mirrors tailwind.config.js's `accent.DEFAULT` — kept as a literal there too
// since Tailwind's config is plain CommonJS. Needed here for the handful of
// spots that set an SVG color via a raw prop/style rather than a class (chart
// highlight colors), where a Tailwind class can't reach.
export const ACCENT_HEX = '#2563EB';

export const STANDARD_TUNING_PC = [4, 9, 2, 7, 11, 4]; // E A D G B e

export const NOTE_TO_PC: Record<string, number> = {
  C: 0,
  'C#': 1,
  D: 2,
  'D#': 3,
  E: 4,
  F: 5,
  'F#': 6,
  G: 7,
  'G#': 8,
  A: 9,
  'A#': 10,
  B: 11,
};

export const PC_TO_NOTE = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
];

export const NOTE_OPTIONS: { value: string; label: string }[] = [
  { value: 'C', label: 'C' },
  { value: 'C#', label: 'C#/Db' },
  { value: 'D', label: 'D' },
  { value: 'D#', label: 'D#/Eb' },
  { value: 'E', label: 'E' },
  { value: 'F', label: 'F' },
  { value: 'F#', label: 'F#/Gb' },
  { value: 'G', label: 'G' },
  { value: 'G#', label: 'G#/Ab' },
  { value: 'A', label: 'A' },
  { value: 'A#', label: 'A#/Bb' },
  { value: 'B', label: 'B' },
];

export const INTERVAL_LABELS = [
  '1',
  'b2',
  '2',
  'b3',
  '3',
  '4',
  'b5',
  '5',
  'b6',
  '6',
  'b7',
  '7',
];

// Spelled-out names for the shorthand degree strings intervalsToDegrees/
// buildDotLabelMap produce (basic 1-7, extended 9-13, and the interval_overrides
// values documented in docs/MUSIC_THEORY.md, e.g. #5 for maj7#5, bb7 for dim7).
// Lowercase throughout — callers capitalize when a sentence starts with one.
export const DEGREE_FULL_NAMES: Record<string, string> = {
  '1': 'root',
  b2: 'minor 2nd',
  '2': 'major 2nd',
  b3: 'minor 3rd',
  '3': 'major 3rd',
  '4': 'perfect 4th',
  b5: 'diminished 5th',
  '5': 'perfect 5th',
  '#5': 'augmented 5th',
  b6: 'minor 6th',
  '6': 'major 6th',
  b7: 'minor 7th',
  bb7: 'diminished 7th',
  '7': 'major 7th',
  b9: 'flat 9th',
  '9': '9th',
  '#9': 'sharp 9th',
  b11: 'flat 11th',
  '11': '11th',
  '#11': 'sharp 11th',
  b13: 'flat 13th',
  '13': '13th',
};
