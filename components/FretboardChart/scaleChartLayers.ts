import type { TabProp } from '@/types';

// Default fill color for every chord/scale dot. It's the *only* color the
// chord and scale library pages ever use — no note (root included) is
// singled out from the rest there. Lesson pages and Fretboard Playground are
// the only places that additionally use HIGHLIGHT_DOT_COLOR to call out a
// specific note or shape; see docs/STYLE_GUIDE.md.
export const DEFAULT_DOT_COLOR = '#000';
// The site's one highlight color, for lessons and the spotlight/legend
// interactions built on top of them — the root, a spotlighted position,
// "these are the 2 new notes," whatever a given lesson needs to call out.
// Deliberately capped at a single color everywhere it's used: stacking on a
// 2nd or 3rd highlight color reads as more distinctions than most readers
// (colorblind readers especially) can actually track. Fretboard Playground
// is the one exception, with its own user-chosen highlight color.
export const HIGHLIGHT_DOT_COLOR = '#cc2200';

type IntervalTab =
  | ((string | number | undefined)[] | (string | number)[][])
  | null;

interface DerivedScaleRender {
  scaleTab: TabProp;
  scaleIntervalTab: IntervalTab;
  rootTab: TabProp;
  rootIntervalTab: IntervalTab;
  patternStartFret: number;
}

export interface ScaleChartLayer {
  tab: TabProp;
  intervals?: IntervalTab;
  fillColor?: string;
  fillOpen?: boolean;
  startFret?: number;
}

// Every note in one layer, all in the default color — for the chord and
// scale library pages, where the root isn't singled out from the rest of
// the scale.
export function scaleChartDefaultLayer(
  rendered: DerivedScaleRender,
): ScaleChartLayer {
  const scaleTab = (rendered.scaleTab as (string | number)[][]) ?? [];
  const rootTab = (rendered.rootTab as (string | number)[][]) ?? [];
  const scaleIntervalTab =
    (rendered.scaleIntervalTab as (string | number)[][] | null) ??
    scaleTab.map(() => []);
  const rootIntervalTab =
    (rendered.rootIntervalTab as (string | number)[][] | null) ??
    rootTab.map(() => []);

  const tab = scaleTab.map((frets, i) => [...frets, ...(rootTab[i] ?? [])]);
  const intervals = scaleIntervalTab.map((labels, i) => [
    ...labels,
    ...(rootIntervalTab[i] ?? []),
  ]);

  return {
    tab,
    intervals,
    fillColor: DEFAULT_DOT_COLOR,
    fillOpen: true,
    startFret: rendered.patternStartFret,
  };
}

// Splits a derived scale render into a default layer (every scale tone) and
// a highlight layer (the root) — the standard lesson-page treatment. Not for
// library pages: those call scaleChartDefaultLayer instead, since there the
// root isn't singled out from the rest of the scale. (ScaleViewer's
// RootHighlightToggle overlay is built separately, straight off
// deriveScaleRender's rootTab/rootIntervalTab — see ScaleViewer.tsx.)
export function scaleChartLayers(
  rendered: DerivedScaleRender,
): ScaleChartLayer[] {
  return [
    {
      tab: rendered.scaleTab,
      fillColor: DEFAULT_DOT_COLOR,
      fillOpen: true,
      intervals: rendered.scaleIntervalTab,
      startFret: rendered.patternStartFret,
    },
    {
      tab: rendered.rootTab,
      fillColor: HIGHLIGHT_DOT_COLOR,
      fillOpen: true,
      intervals: rendered.rootIntervalTab,
      startFret: rendered.patternStartFret,
    },
  ];
}

// Same as scaleChartLayers, but pulls the given interval labels (e.g. the 4 and
// 7 added going from pentatonic to the full scale) out of the default layer
// into their own highlighted layer. The root merges into the default layer
// here rather than getting its usual separate highlight treatment — a lesson
// diagram only gets the site's one highlight color, and in this one it's
// spent calling out the new notes, not the root.
//
// highlightColor defaults to the site's shared HIGHLIGHT_DOT_COLOR — pass a
// different one only for a deliberate, explicit exception (e.g.
// relative-vs-parallel-modes' parallel comparison: two diagrams shown side
// by side, each needing its own distinct color so "what changed in this
// one" reads independently of "what changed in that one" — not a pattern to
// reach for by default, see docs/STYLE_GUIDE.md).
export function scaleChartLayersWithHighlight(
  rendered: DerivedScaleRender,
  highlightLabels: (string | number)[],
  highlightColor: string = HIGHLIGHT_DOT_COLOR,
): ScaleChartLayer[] {
  const highlightSet = new Set(highlightLabels.map(String));
  const { tab: scaleTab, intervals: scaleIntervalTab } =
    scaleChartDefaultLayer(rendered);
  const fullTab = (scaleTab as (string | number)[][]) ?? [];
  const fullIntervals = (scaleIntervalTab as (string | number)[][]) ?? [];

  const restTab: (string | number)[][] = [];
  const restIntervals: (string | number)[][] = [];
  const highlightTab: (string | number)[][] = [];
  const highlightIntervals: (string | number)[][] = [];

  fullTab.forEach((frets, stringIndex) => {
    const labels = fullIntervals[stringIndex] ?? [];
    const rFrets: (string | number)[] = [];
    const rLabels: (string | number)[] = [];
    const hFrets: (string | number)[] = [];
    const hLabels: (string | number)[] = [];
    frets.forEach((fret, i) => {
      const label = labels[i];
      if (highlightSet.has(String(label))) {
        hFrets.push(fret);
        hLabels.push(label);
      } else {
        rFrets.push(fret);
        rLabels.push(label);
      }
    });
    restTab.push(rFrets);
    restIntervals.push(rLabels);
    highlightTab.push(hFrets);
    highlightIntervals.push(hLabels);
  });

  return [
    {
      tab: restTab,
      fillColor: DEFAULT_DOT_COLOR,
      fillOpen: true,
      intervals: restIntervals,
      startFret: rendered.patternStartFret,
    },
    {
      tab: highlightTab,
      fillColor: highlightColor,
      fillOpen: true,
      intervals: highlightIntervals,
      startFret: rendered.patternStartFret,
    },
  ];
}
