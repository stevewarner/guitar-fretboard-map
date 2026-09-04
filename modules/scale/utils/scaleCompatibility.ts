import { SCALE_SYSTEMS } from '@/modules/scale/data/systems';
import { SCALE_INTERVALS } from '@/modules/scale/data/scaleIntervals';
import { getModeIntervals } from '@/modules/scale/utils/scaleUtils';

export interface ScaleModeOption {
  systemSlug: string;
  systemName: string;
  modeSlug: string;
  displayName: string;
  // 0-indexed position within the parent scale (mode.degree as-is) — e.g.
  // Dorian is degree 1, the 2nd mode. Meaningless for pentatonic (its 2
  // entries are independent scales, not rotations of one shared parent —
  // see patternKind in modules/scale/ScaleViewer/ScaleViewer.tsx for the
  // same distinction made elsewhere), so callers should key off systemSlug
  // rather than assume every entry is "a mode of" its system.
  degree: number;
  // 0-11 semitone offsets from the root, ascending.
  intervals: number[];
}

// Every scale/mode page on the site, flattened, with its own interval set
// computed once — the candidate pool CompatibleScales filters down per chord.
export function getAllScaleModeOptions(): ScaleModeOption[] {
  return SCALE_SYSTEMS.flatMap((system) =>
    system.modes.map((mode) => {
      const parentIntervals = SCALE_INTERVALS[mode.dbName ?? system.dbName];
      return {
        systemSlug: system.slug,
        systemName: system.displayName,
        modeSlug: mode.slug,
        displayName: mode.pageTitle ?? mode.displayName,
        degree: mode.degree,
        intervals: getModeIntervals(parentIntervals, mode.degree),
      };
    }),
  );
}

// Groups each semitone (0-11) by scale-degree family, ignoring accidental —
// e.g. semitones 1 (b2) and 2 (2) are both "the 2nd degree," just a
// different version of it. Mirrors INTERVAL_LABELS' own grouping (the
// numeric part of each label, '1'..'7').
const DEGREE_FAMILY = [0, 1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6];

// A scale is compatible with a chord if none of its notes contradict a
// chord tone — for every chord tone, the scale either contains that exact
// note, or has nothing at all in that degree family (e.g. major pentatonic
// omits the 7th degree entirely, so it doesn't conflict with a dominant
// chord's b7 even though it doesn't contain it either). A scale with a
// DIFFERENT version of a degree the chord specifies — a natural 7 where the
// chord wants b7 — is excluded. Compares by semitone only, never by note
// name/spelling (see app/utils/noteSpelling.ts for that separate concern).
export function isScaleCompatibleWithChord(
  chordIntervals: number[],
  scaleIntervals: number[],
): boolean {
  const chordPcs = new Set(chordIntervals.map((i) => i % 12));
  const scalePcs = new Set(scaleIntervals.map((i) => i % 12));
  return [...chordPcs].every((pc) => {
    if (scalePcs.has(pc)) return true;
    const family = DEGREE_FAMILY[pc];
    return ![...scalePcs].some((s) => DEGREE_FAMILY[s] === family);
  });
}
