import { STANDARD_TUNING_PC, INTERVAL_LABELS } from './constants';

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
  // Use fret 12 rather than fret 0 so every position is fingered (no open-string root).
  const rootFret = rawRootFret === 0 ? 12 : rawRootFret;

  const numFrets = 5;
  const startFret =
    position.rootFinger === 0 || position.rootFinger === 1
      ? rootFret
      : rootFret - position.rootFinger;

  if (startFret < 0) return null;
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
