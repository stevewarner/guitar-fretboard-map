import type {
  DbChordQuality,
  DbChordShape,
} from '@/modules/chordv2/db/queries';
import type { QualityWithActualIntervals } from './actualQualityIntervals';

function sameIntervalSet(a: number[], b: number[]): boolean {
  const setA = [...new Set(a.map((i) => i % 12))].sort((x, y) => x - y);
  const setB = [...new Set(b.map((i) => i % 12))].sort((x, y) => x - y);
  if (setA.length !== setB.length) return false;
  return setA.every((v, i) => v === setB[i]);
}

// Returns every rotation offset d (0-11) such that shifting
// candidateIntervals forward by d exactly reproduces referenceIntervals as a
// set. A chord's absolute notes are its interval set rotated by its root, so
// this check both confirms an exact-notes match and pins down exactly which
// root the candidate lands on - no need to scan every quality at every one
// of 12 actual roots. Usually at most one d matches, but a rotation-
// symmetric interval set (fully-diminished 7th repeats every 3 semitones,
// augmented triad every 4) can match at several - all of them are real,
// distinct roots, not duplicates of one match, so every one is returned.
function findRootOffsets(
  referenceIntervals: number[],
  candidateIntervals: number[],
): number[] {
  const offsets: number[] = [];
  for (let d = 0; d < 12; d++) {
    const shifted = candidateIntervals.map((i) => (i + d) % 12);
    if (sameIntervalSet(shifted, referenceIntervals)) offsets.push(d);
  }
  return offsets;
}

export interface SameNotesMatch {
  quality: DbChordQuality;
  rootPc: number;
  shape: DbChordShape | null;
}

// Finds every (quality, root) pair whose actual notes exactly match the
// given chord's, at a different root. Deliberately includes same-quality-
// different-root matches: fully-diminished 7th and augmented triads are
// rotation-symmetric, so e.g. Bdim7/Ddim7/Fdim7/Abdim7 are the literal same
// 4 notes - a real, distinct fact. The only exclusion is the trivial
// self-match (same quality AND the root already on screen).
export function findSameNotesChords(
  referenceIntervals: number[],
  referenceSymbol: string,
  referenceRootPc: number,
  candidates: QualityWithActualIntervals[],
): SameNotesMatch[] {
  const matches: SameNotesMatch[] = [];
  for (const candidate of candidates) {
    const offsets = findRootOffsets(referenceIntervals, candidate.intervals);
    for (const offset of offsets) {
      if (offset === 0 && candidate.quality.symbol === referenceSymbol)
        continue;
      matches.push({
        quality: candidate.quality,
        rootPc: (referenceRootPc + offset) % 12,
        shape: candidate.shape,
      });
    }
  }
  return matches;
}
