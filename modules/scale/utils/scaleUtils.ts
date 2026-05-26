import { STANDARD_TUNING_PC, INTERVAL_LABELS } from '@/app/utils/constants';
import { spellScale } from '@/app/utils/noteSpelling';

// Rotate parent scale intervals to derive a mode starting at the given degree.
export function getModeIntervals(parentIntervals: number[], degree: number): number[] {
  const offset = parentIntervals[degree];
  return parentIntervals
    .map((i) => (i - offset + 12) % 12)
    .sort((a, b) => a - b);
}

// For each string, return interval labels matching the positions in scaleTab.
export function computeIntervalTab(scaleTab: number[][], rootPc: number): string[][] {
  return STANDARD_TUNING_PC.map((openPc, stringIndex) =>
    scaleTab[stringIndex].map((fret) => INTERVAL_LABELS[(openPc + fret - rootPc + 12) % 12])
  );
}

// For each string, collect frets in [startFret, startFret+windowSize) that are in the scale.
export function computeScaleTab(
  modeIntervals: number[],
  rootPc: number,
  startFret = 0,
  windowSize = 5,
): number[][] {
  const scalePCs = new Set(modeIntervals.map((i) => (rootPc + i) % 12));
  return STANDARD_TUNING_PC.map((openPc) => {
    const frets: number[] = [];
    for (let fret = startFret; fret < startFret + windowSize; fret++) {
      if (scalePCs.has((openPc + fret) % 12)) frets.push(fret);
    }
    return frets;
  });
}

// ── Position system ──────────────────────────────────────────────────────────
//
// A scale position is defined by:
//   rootString  — which string carries the root note (6th, 5th, or 4th)
//   rootFinger  — which left-hand finger is placed on that root fret
//                 0 = stretch (1st finger extends back to reach the root;
//                              hand sits one fret higher)
//                 1–4 = the numbered finger sits directly on the root fret
//
// Construction rules:
//   1. Don't stretch when you don't have to — fill the 4-fret window first.
//   2. Don't use the same finger twice on the same string.
//
// The resulting fret window is:
//   finger 0 (stretch): startFret = rootFret,              numFrets = 5
//   finger 1:           startFret = rootFret,              numFrets = 5
//   finger 2–4:         startFret = rootFret − rootFinger, numFrets = 5

export type RootString = 6 | 5 | 4;
export type RootFinger = 0 | 1 | 2 | 3 | 4;

export interface ScalePosition {
  rootString: RootString;
  rootFinger: RootFinger;
}

const STRING_TO_INDEX: Record<RootString, number> = { 6: 0, 5: 1, 4: 2 };

export function computePositionWindow(
  position: ScalePosition,
  rootPc: number,
): { startFret: number; numFrets: number } | null {
  const openPc = STANDARD_TUNING_PC[STRING_TO_INDEX[position.rootString]];
  const rawRootFret = (rootPc - openPc + 12) % 12;
  // For fingered positions (1–4) the root must be fretted, so bump open roots up an octave.
  // Stretch (finger 0) is exempt: the 1st finger sits on fret 1, the open string is the root.
  let rootFret =
    rawRootFret === 0 && position.rootFinger !== 0 ? 12 : rawRootFret;

  const numFrets = 5;
  const computeStart = (rf: number) =>
    position.rootFinger === 0 || position.rootFinger === 1
      ? rf
      : rf - position.rootFinger;

  // If the position runs off the low end of the neck, shift the root up an octave
  // (e.g. F on the 6th string with 4th-finger position lives at fret 13, not fret 1).
  let startFret = computeStart(rootFret);
  if (startFret < 0) {
    rootFret += 12;
    startFret = computeStart(rootFret);
  }

  // Cap at a 22-fret neck (window of 5 frets → highest start = 18).
  if (startFret + numFrets - 1 > 22) return null;

  return { startFret, numFrets };
}

// In standard tuning the G (index 3) and B (index 4) strings are only 4 semitones
// apart instead of the usual 5. In a 5-fret window this means G[startFret+4] and
// B[startFret] are always the same absolute pitch — a direct duplicate.
// Drop the copy that requires a stretch or extension beyond the hand position.
export function deduplicateGBStrings(
  tab: number[][],
  rootFinger: RootFinger,
  startFret: number,
  numFrets = 5,
): number[][] {
  const result = tab.map((s) => [...s]);
  const lastFret = startFret + numFrets - 1;

  const gHasLast = result[3].includes(lastFret);
  const bHasFirst = result[4].includes(startFret);
  if (!gHasLast || !bHasFirst) return result;

  if (rootFinger === 0) {
    // Stretch position: B string note at startFret is the stretch — remove it
    result[4] = result[4].filter((f) => f !== startFret);
  } else {
    // Fingers 1–4: G string note at lastFret is above the hand span — remove it
    result[3] = result[3].filter((f) => f !== lastFret);
  }

  return result;
}

// For each string, collect frets in the window that land on the root pitch class.
export function computeRootTab(
  rootPc: number,
  startFret = 0,
  windowSize = 5,
): number[][] {
  return STANDARD_TUNING_PC.map((openPc) => {
    const frets: number[] = [];
    for (let fret = startFret; fret < startFret + windowSize; fret++) {
      if ((openPc + fret) % 12 === rootPc) frets.push(fret);
    }
    return frets;
  });
}

export const ROOT_STRINGS: RootString[] = [6, 5, 4];
export const ROOT_FINGERS: RootFinger[] = [0, 1, 2, 3, 4];
export const DEFAULT_POSITION: ScalePosition = { rootString: 6, rootFinger: 1 };

export function isValidPosition(position: ScalePosition, rootPc: number): boolean {
  return computePositionWindow(position, rootPc) !== null;
}

export function getValidFingersForString(
  rootString: RootString,
  rootPc: number,
): RootFinger[] {
  return ROOT_FINGERS.filter((f) =>
    isValidPosition({ rootString, rootFinger: f }, rootPc),
  );
}

// Derive everything needed to render the chart for a given mode/key/position.
// Position must be valid for this key (use isValidPosition first).
export function deriveScaleRender(
  modeIntervals: number[],
  rootPc: number,
  position: ScalePosition,
) {
  const { startFret: rawStartFret, numFrets } = computePositionWindow(position, rootPc)!;

  // If the window starts at 0 but no notes land on open strings, shift up to 1
  // so the chart doesn't show an empty open-string area above the nut.
  const rawScaleTab = computeScaleTab(modeIntervals, rootPc, rawStartFret, numFrets);
  const hasOpenNotes = rawStartFret === 0 && rawScaleTab.some((frets) => frets.includes(0));
  const startFret = rawStartFret === 0 && !hasOpenNotes ? 1 : rawStartFret;
  const patternStartFret = Math.max(1, startFret);

  // When startFret is 0, the open area above the nut replaces the first fret space
  // in the displayed window. Render one fewer fretted space and shift labels accordingly
  // (no leading empty slot — the open string is the unfingered root).
  const isOpenPosition = startFret === 0;
  const fingerLabels: string[] = isOpenPosition
    ? ['1', '2', '3', '4']
    : position.rootFinger === 0
      ? ['', '1', '2', '3', '4']
      : position.rootFinger === 1
        ? ['1', '2', '3', '4', '']
        : ['', '1', '2', '3', '4'];
  const displayNumFrets = isOpenPosition ? numFrets - 1 : numFrets;

  const scaleTab = deduplicateGBStrings(
    startFret === rawStartFret
      ? rawScaleTab
      : computeScaleTab(modeIntervals, rootPc, startFret, numFrets),
    position.rootFinger,
    startFret,
    numFrets,
  );
  const rootTab = deduplicateGBStrings(
    computeRootTab(rootPc, startFret, numFrets),
    position.rootFinger,
    startFret,
    numFrets,
  );
  const scaleIntervalTab = computeIntervalTab(scaleTab, rootPc);
  const rootIntervalTab = rootTab.map((frets) => frets.map(() => '1'));

  return {
    numFrets: displayNumFrets,
    startFret,
    patternStartFret,
    fingerLabels,
    scaleTab,
    rootTab,
    scaleIntervalTab,
    rootIntervalTab,
  };
}

export interface DiatonicChord {
  degree: number;        // 1–7
  romanNumeral: string;  // 'I', 'ii', 'III', etc. — case reflects chord quality
  quality: string;       // 'maj7', 'm7', '7', 'm7b5', 'dim7', 'mMaj7', 'maj7#5', '7#5'
  rootNote: string;      // 'C', 'C#', etc.
  name: string;          // rootNote + quality, e.g. 'Cmaj7'
}

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

// Classify a 7th chord from semitone intervals (3rd, 5th, 7th) above the root.
// Returns null for combinations that don't match a common 7th-chord quality.
function classify7thChord(
  third: number,
  fifth: number,
  seventh: number,
): { quality: string; isMajor: boolean } | null {
  if (third === 4 && fifth === 7 && seventh === 11) return { quality: 'maj7', isMajor: true };
  if (third === 4 && fifth === 7 && seventh === 10) return { quality: '7', isMajor: true };
  if (third === 3 && fifth === 7 && seventh === 10) return { quality: 'm7', isMajor: false };
  if (third === 3 && fifth === 6 && seventh === 10) return { quality: 'm7b5', isMajor: false };
  if (third === 3 && fifth === 6 && seventh === 9) return { quality: 'dim7', isMajor: false };
  if (third === 3 && fifth === 7 && seventh === 11) return { quality: 'mMaj7', isMajor: false };
  if (third === 4 && fifth === 8 && seventh === 11) return { quality: 'maj7#5', isMajor: true };
  if (third === 4 && fifth === 8 && seventh === 10) return { quality: '7#5', isMajor: true };
  return null;
}

// Build the diatonic 7th-chord sequence for the given mode + tonic. Returns null
// for scales that aren't 7-note (e.g. pentatonic). Chord roots are spelled so each
// letter A–G appears once across the scale.
export function getDiatonicChords(
  modeIntervals: number[],
  tonicNote: string,
): DiatonicChord[] | null {
  if (modeIntervals.length !== 7) return null;

  const spelled = spellScale(tonicNote, modeIntervals);

  return modeIntervals.map((rootInterval, i): DiatonicChord => {
    const third = (modeIntervals[(i + 2) % 7] - rootInterval + 12) % 12;
    const fifth = (modeIntervals[(i + 4) % 7] - rootInterval + 12) % 12;
    const seventh = (modeIntervals[(i + 6) % 7] - rootInterval + 12) % 12;

    const classified = classify7thChord(third, fifth, seventh);
    const quality = classified?.quality ?? '?';
    const isMajor = classified?.isMajor ?? false;

    const numeral = isMajor ? ROMAN_NUMERALS[i] : ROMAN_NUMERALS[i].toLowerCase();
    const rootNote = spelled[i];

    return {
      degree: i + 1,
      romanNumeral: numeral,
      quality,
      rootNote,
      name: `${rootNote}${quality}`,
    };
  });
}
