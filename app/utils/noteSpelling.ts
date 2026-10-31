const LETTER_ORDER = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
type Letter = (typeof LETTER_ORDER)[number];

const NATURAL_PC: Record<Letter, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

const SHARP_FALLBACK = [
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

interface ParsedNote {
  letter: Letter;
  accidental: number;
  pc: number;
}

export function parseNote(note: string): ParsedNote {
  const letter = note[0]?.toUpperCase() as Letter;
  if (!(letter in NATURAL_PC)) throw new Error(`Invalid note letter: ${note}`);
  let accidental = 0;
  for (const c of note.slice(1)) {
    if (c === '#') accidental++;
    else if (c === 'b') accidental--;
  }
  const pc = (NATURAL_PC[letter] + accidental + 144) % 12;
  return { letter, accidental, pc };
}

function accidentalString(semitones: number): string {
  if (semitones === 0) return '';
  return semitones > 0 ? '#'.repeat(semitones) : 'b'.repeat(-semitones);
}

// Shared by spellScale and spellChordNotes: given which letter (by index
// into LETTER_ORDER, wrapping mod 7) a note should use, compute the
// accidental needed to actually reach `interval` semitones above the tonic.
// The two callers only differ in how they pick `letterIndex` - a sequential
// scale-degree position for spellScale, a degree label's numeral for
// spellChordNotes - everything after that (the diff-and-wraparound math) is
// identical, so it lives here once instead of twice.
function spellNote(
  tonic: ParsedNote,
  letterIndex: number,
  interval: number,
): string {
  const letter = LETTER_ORDER[((letterIndex % 7) + 7) % 7];
  const targetPc = (tonic.pc + interval) % 12;
  let diff = (targetPc - NATURAL_PC[letter] + 12) % 12;
  if (diff > 6) diff -= 12;
  return letter + accidentalString(diff);
}

// Spell each scale degree so every letter A–G appears exactly once (for 7-note
// scales). `tonicNote` is the spelled tonic (e.g. 'C', 'F#', 'Bb'); `intervals`
// are semitone offsets from the tonic, sorted ascending.
//
// Non-7-note inputs fall back to sharp-only spelling — pentatonic doesn't have
// a unique letter-per-degree rule.
export function spellScale(tonicNote: string, intervals: number[]): string[] {
  const tonic = parseNote(tonicNote);

  if (intervals.length !== 7) {
    return intervals.map((i) => SHARP_FALLBACK[(tonic.pc + i + 144) % 12]);
  }

  const startIdx = LETTER_ORDER.indexOf(tonic.letter);
  return intervals.map((interval, i) =>
    spellNote(tonic, startIdx + i, interval),
  );
}

// Spell each chord tone using its degree label's numeral (e.g. 'b7' -> 7,
// '#11' -> 11) to pick the letter, keyed by the degree's numeral (mod 7)
// instead of a sequential 1-7 index, since a chord's degrees aren't
// necessarily consecutive. The degree label's own b/# prefix is relative to
// the *major scale* degree, not the tonic's natural letter, so it can't be
// applied directly (e.g. G's b7 is F natural — zero accidentals — even
// though the label is 'b7'); only its numeral is used here; intervals
// carries the real semitone offsets.
export function spellChordNotes(
  tonicNote: string,
  intervals: number[],
  degreeLabels: string[],
): string[] {
  const tonic = parseNote(tonicNote);
  const startIdx = LETTER_ORDER.indexOf(tonic.letter);

  return intervals.map((interval, i) => {
    const label = degreeLabels[i];
    const match = label?.match(/^[#b]*(\d+)$/);
    if (!match) return SHARP_FALLBACK[(tonic.pc + interval + 144) % 12];
    const numeral = Number(match[1]);
    return spellNote(tonic, startIdx + numeral - 1, interval);
  });
}
