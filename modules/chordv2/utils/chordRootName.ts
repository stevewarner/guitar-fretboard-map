import {
  fewestAccidentalsRoot,
  spellChordNotes,
} from '@/app/utils/noteSpelling';
import { intervalsToDegrees } from './intervalDegrees';

type Overrides = Record<string, string> | null | undefined;

export function chordNoteNames(
  rootNote: string,
  intervals: number[],
  overrides: Overrides,
): string[] {
  return spellChordNotes(
    rootNote,
    intervals,
    intervalsToDegrees(intervals, (overrides ?? {}) as Record<number, string>),
  );
}

export function chordRootName(
  rootPc: number,
  intervals: number[],
  overrides: Overrides,
): string {
  return fewestAccidentalsRoot(rootPc, (rootNote) =>
    chordNoteNames(rootNote, intervals, overrides),
  );
}
