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

  return intervals.map((interval, i) => {
    const letter = LETTER_ORDER[(startIdx + i) % 7];
    const targetPc = (tonic.pc + interval) % 12;
    let diff = (targetPc - NATURAL_PC[letter] + 12) % 12;
    if (diff > 6) diff -= 12;
    return letter + accidentalString(diff);
  });
}
