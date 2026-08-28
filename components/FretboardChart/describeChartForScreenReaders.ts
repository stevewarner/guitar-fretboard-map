import type { TabProp } from '@/types';
import { numStrings } from './constants';

const STRING_NAMES = [
  'low E (6th string)',
  'A (5th string)',
  'D (4th string)',
  'G (3rd string)',
  'B (2nd string)',
  'high e (1st string)',
];

interface ChartLayer {
  tab: TabProp;
  intervals?: ((string | number | undefined)[] | (string | number)[][]) | null;
}

// A Fretboard's <svg role="img"> flattens the whole diagram into one image
// with a single accessible name (its <title>) — screen readers can't reach
// the per-dot <text> interval labels inside it (see
// docs/accessibility-audit.csv row 112). This derives a plain-text,
// per-string equivalent from the exact same tab/intervals arrays already
// driving the visual dots, so it can't say anything the diagram doesn't
// already show. Meant for a visually-hidden caption next to lesson diagrams
// that don't already restate the mapping as real text nearby (chord/scale
// detail pages don't need this — they already repeat the same info in
// Notes/Tab/interval-formula text next to the diagram).
export function describeChartForScreenReaders(layers: ChartLayer[]): string {
  // Keyed by fret, not pushed to a list — a highlight layer (e.g. the root,
  // via scaleChartLayers) commonly repeats a fret already present in the
  // default layer, drawn on top in a different color rather than as a
  // second dot. Layers are processed in the same order they're painted, so
  // a later layer's label for a given fret correctly overwrites an earlier
  // one instead of appearing twice.
  const byString: Map<number, string | number | undefined>[] = Array.from(
    { length: numStrings },
    () => new Map(),
  );
  const muted = new Set<number>();

  for (const layer of layers) {
    layer.tab.forEach((raw, stringIndex) => {
      if (stringIndex >= numStrings) return;
      const labelsForString = layer.intervals?.[stringIndex];
      const frets = Array.isArray(raw) ? raw : [raw];
      const labels = Array.isArray(labelsForString)
        ? labelsForString
        : [labelsForString];

      frets.forEach((fret, i) => {
        if (fret === undefined) return;
        if (fret === 'x') {
          muted.add(stringIndex);
          return;
        }
        byString[stringIndex].set(Number(fret), labels[i]);
      });
    });
  }

  const parts = byString.map((frets, stringIndex) => {
    const name = STRING_NAMES[stringIndex];
    if (frets.size === 0) {
      return muted.has(stringIndex) ? `${name}: muted` : null;
    }
    const dots = [...frets.entries()]
      .sort(([a], [b]) => a - b)
      .map(([fret, label]) => {
        const fretText = fret === 0 ? 'open' : `fret ${fret}`;
        return label !== undefined ? `${fretText} (${label})` : fretText;
      })
      .join(', ');
    return `${name}: ${dots}`;
  });

  return parts.filter((part): part is string => part !== null).join('. ');
}
