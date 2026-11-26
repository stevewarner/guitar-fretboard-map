import { SCALE_SYSTEMS } from '@/modules/scale/data/systems';
import { SCALE_INTERVALS } from '@/modules/scale/data/scaleIntervals';
import {
  getModeIntervals,
  spellScaleIntervals,
} from '@/modules/scale/utils/scaleUtils';

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

// The degree number (1-7) a label names, ignoring accidentals; extensions
// fold back into the octave ('b9' -> 2, '#11' -> 4, '13' -> 6).
function degreeNumber(label: string): number {
  const numeral = Number(label.replace(/^[#b]+/, ''));
  return ((numeral - 1) % 7) + 1;
}

// A scale is compatible with a chord if none of its notes contradict a
// chord tone. For every chord tone, the scale either contains that exact
// note, or has nothing at all in that degree (e.g. major pentatonic omits
// the 7th degree entirely, so it doesn't conflict with a dominant chord's b7
// even though it doesn't contain it either). A scale with a DIFFERENT
// version of a degree the chord specifies (Ionian ♯5's #5 against a maj7
// chord's natural 5) is excluded.
//
// Degrees come from each side's own spelling, not a fixed semitone table:
// `chordDegrees` is the chord's labels (intervalsToDegrees, overrides like
// '#5' and 'bb7' included), and the scale's come from spellScaleIntervals, so
// a 7-note scale's semitone 8 counts as a 5th when the scale spells it #5.
export function isScaleCompatibleWithChord(
  chordIntervals: number[],
  chordDegrees: string[],
  scaleIntervals: number[],
): boolean {
  const scalePcs = new Set(scaleIntervals);
  const scaleDegrees = new Set(
    spellScaleIntervals(scaleIntervals).map(degreeNumber),
  );
  return chordIntervals.every((interval, i) => {
    if (scalePcs.has(interval % 12)) return true;
    return !scaleDegrees.has(degreeNumber(chordDegrees[i]));
  });
}
