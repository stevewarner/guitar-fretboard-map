import { intervalLabels } from '@/app/utils/musicUtils';
import type { FlatTabValue } from '@/types';
import type { SpotlightShape } from './SpotlightOverlay';

// Every note repeats an octave (12 frets) higher — the same interval label
// applies either way, since +12 semitones doesn't change the pitch class.
const REPEAT_OFFSET = 12;

// Turns an already-transposed tab (as returned by transposeShape) into a
// SpotlightShape: one interval-labeled fret per string, optionally repeated
// an octave higher. Shared by every lesson that merges several transposed
// chord shapes onto one fretboard (chord-shapes' FullNeckOverlay,
// four-note-voicings, voicing-inversions, one-position-voicings).
export function buildSpotlightShape(
  tab: FlatTabValue[],
  labelRootPc: number,
  label: string,
  includeRepeat = false,
): SpotlightShape {
  const labels = intervalLabels(tab, labelRootPc);
  const shapeTab: number[][] = [];
  const intervals: string[][] = [];
  tab.forEach((fret, stringIndex) => {
    if (typeof fret !== 'number') {
      shapeTab.push([]);
      intervals.push([]);
      return;
    }
    const frets = includeRepeat ? [fret, fret + REPEAT_OFFSET] : [fret];
    const interval = labels[stringIndex] as string;
    shapeTab.push(frets);
    intervals.push(frets.map(() => interval));
  });

  return { label, tab: shapeTab, intervals };
}
