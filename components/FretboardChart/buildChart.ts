// Pure chart-building logic, split out of RootPickerCharts.tsx so it can be
// called from server components too — anything exported from a 'use client'
// file becomes a client-only reference, even a plain function with no
// browser APIs, so buildChart couldn't live there and still be called from
// a server-rendered lesson page.
import { computeRootFret } from '@/app/utils/musicUtils';
import {
  scaleChartLayers,
  scaleChartLayersWithHighlight,
} from './scaleChartLayers';
import {
  deriveScaleRender,
  computeAnchoredPositions,
  deriveAnchoredScaleRender,
  findRootAnchoredPositionIndex,
  computeRootTab,
  type RootString,
  type RootFinger,
} from '@/modules/scale/utils/scaleUtils';

// A chart's shape/fingering is fully described by one of these — everything
// hardcoded to the example being taught. Only the root (looked up by the
// caller-supplied rootPc) changes what's actually rendered.
export type ChartSource =
  | {
      kind: 'position';
      intervals: number[];
      rootString: RootString;
      rootFinger: RootFinger;
      // Interval labels (e.g. ['4', '7']) to draw in a third "new note" color
      // instead of the usual black — for showing specific notes added to an
      // already-familiar shape.
      highlightLabels?: (string | number)[];
      // Overrides the default shared highlight color — see
      // scaleChartLayersWithHighlight's own doc comment before reaching for
      // this; it's an explicit exception, not a per-lesson style choice.
      highlightColor?: string;
    }
  | {
      // Literal index into the ascending anchored-position list — "position 1" is
      // always the lowest fret on the neck, whatever scale degree that happens to be.
      kind: 'anchoredPosition';
      intervals: number[];
      positionIndex: number;
      windowSize?: number;
      referenceStringIndex?: number;
      // Pull the window's start back by this many frets (widening it by the same
      // amount) — for a position that reads as too narrow at the computed anchor.
      extendStartBy?: number;
    }
  | {
      // Indexed relative to whichever position has the root itself on the reference
      // string — offset 0 is always "root position, 6th string" regardless of key.
      kind: 'rootAnchoredPosition';
      intervals: number[];
      positionOffset: number;
      windowSize?: number;
      referenceStringIndex?: number;
      extendStartBy?: number;
    }
  | {
      // A hand-picked shape (not every scale-tone occurrence, just these specific
      // notes) — e.g. a triad with no doubled notes. Frets are relative to the
      // root fret (0 = root fret), one array per string, same convention as
      // chordv2's tab_relative. intervalLabels is a parallel array; any label
      // equal to '1' is drawn as the root (red) rather than a scale tone (black).
      kind: 'relativeShape';
      tabRelative: number[][];
      intervalLabels: (string | number)[][];
      rootString: RootString;
      rootFinger: RootFinger;
    }
  | {
      // Every occurrence of the root note across a wide, fixed fret range — not
      // a hand position at all, so there's no rootString/rootFinger to anchor to.
      kind: 'rootAcrossNeck';
      startFret: number;
      numFrets: number;
    };

function resolveAnchoredWindow(
  source: Extract<
    ChartSource,
    { kind: 'anchoredPosition' | 'rootAnchoredPosition' }
  >,
  rootPc: number,
) {
  const positions = computeAnchoredPositions(
    source.intervals,
    rootPc,
    source.windowSize,
    source.referenceStringIndex,
  );
  const window =
    source.kind === 'anchoredPosition'
      ? positions[source.positionIndex]
      : positions[
          (((Math.max(
            0,
            findRootAnchoredPositionIndex(
              positions,
              rootPc,
              source.referenceStringIndex,
            ),
          ) +
            source.positionOffset) %
            positions.length) +
            positions.length) %
            positions.length
        ];

  const extendStartBy = Math.min(source.extendStartBy ?? 0, window.startFret);
  return extendStartBy
    ? {
        ...window,
        startFret: window.startFret - extendStartBy,
        numFrets: window.numFrets + extendStartBy,
      }
    : window;
}

function buildRelativeShapeChart(
  source: Extract<ChartSource, { kind: 'relativeShape' }>,
  rootPc: number,
) {
  const minOffset = Math.min(0, ...source.tabRelative.flat());
  let rootFret = computeRootFret(source.rootString, source.rootFinger, rootPc);
  if (rootFret + minOffset < 0) rootFret += 12;

  const scaleTab: number[][] = [];
  const scaleIntervalTab: (string | number)[][] = [];
  const rootTab: number[][] = [];
  const rootIntervalTab: (string | number)[][] = [];

  source.tabRelative.forEach((offsets, stringIndex) => {
    const labels = source.intervalLabels[stringIndex];
    const sFrets: number[] = [];
    const sLabels: (string | number)[] = [];
    const rFrets: number[] = [];
    const rLabels: (string | number)[] = [];
    offsets.forEach((offset, i) => {
      const fret = offset + rootFret;
      const label = labels[i];
      if (String(label) === '1') {
        rFrets.push(fret);
        rLabels.push(label);
      } else {
        sFrets.push(fret);
        sLabels.push(label);
      }
    });
    scaleTab.push(sFrets);
    scaleIntervalTab.push(sLabels);
    rootTab.push(rFrets);
    rootIntervalTab.push(rLabels);
  });

  const allFrets = source.tabRelative.flat().map((o) => o + rootFret);
  const startFret = allFrets.length ? Math.min(...allFrets) : 1;
  const endFret = allFrets.length ? Math.max(...allFrets) : startFret;
  const patternStartFret = Math.max(1, startFret);
  // Fret 0 (if included) draws in the reserved open-string area above the
  // nut rather than as a normal row — same convention as rootAcrossNeck.
  const rawNumFrets = endFret - startFret + 1;

  return {
    numFrets: Math.max(1, startFret === 0 ? rawNumFrets - 1 : rawNumFrets),
    startFret,
    layers: scaleChartLayers({
      scaleTab,
      scaleIntervalTab,
      rootTab,
      rootIntervalTab,
      patternStartFret,
    }),
  };
}

export function buildChart(source: ChartSource, rootPc: number) {
  if (source.kind === 'relativeShape') {
    return buildRelativeShapeChart(source, rootPc);
  }

  if (source.kind === 'rootAcrossNeck') {
    const rootTab = computeRootTab(rootPc, source.startFret, source.numFrets);
    // Fret 0 (if included) draws in the reserved open-string area above the
    // nut rather than as a normal row — same convention as an open position.
    const displayNumFrets =
      source.startFret === 0 ? source.numFrets - 1 : source.numFrets;
    return {
      numFrets: displayNumFrets,
      startFret: source.startFret,
      layers: scaleChartLayers({
        scaleTab: rootTab.map(() => []),
        scaleIntervalTab: rootTab.map(() => []),
        rootTab,
        rootIntervalTab: rootTab.map((frets) => frets.map(() => '1')),
        patternStartFret: Math.max(1, source.startFret),
      }),
    };
  }

  const rendered =
    source.kind === 'position'
      ? deriveScaleRender(source.intervals, rootPc, {
          rootString: source.rootString,
          rootFinger: source.rootFinger,
        })
      : deriveAnchoredScaleRender(
          source.intervals,
          rootPc,
          resolveAnchoredWindow(source, rootPc),
        );

  const highlightLabels =
    source.kind === 'position' ? source.highlightLabels : undefined;
  const highlightColor =
    source.kind === 'position' ? source.highlightColor : undefined;

  return {
    numFrets: rendered.numFrets,
    startFret: rendered.startFret,
    layers: highlightLabels
      ? scaleChartLayersWithHighlight(rendered, highlightLabels, highlightColor)
      : scaleChartLayers(rendered),
  };
}
