'use client';

import { useId, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Fretboard,
  Pattern,
  buildChart,
  HIGHLIGHT_DOT_COLOR,
  type ChartSource,
  type ScaleChartLayer,
} from '@/components/FretboardChart';
import { RootSelect } from '@/components/RootSelect';
import { INTERVAL_LABELS, NOTE_TO_PC } from '@/app/utils/constants';
import {
  MAJOR_SCALE_INTERVALS,
  getModeIntervals,
} from '@/modules/scale/utils/scaleUtils';

const POSITION = { rootString: 6 as const, rootFinger: 1 as const };

// Brightest to darkest — degree indices match
// modules/scale/data/systems.ts's own mode ordering (Ionian 0 ... Locrian 6).
// Not the scale-degree order (Ionian, Dorian, Phrygian, ...) — this is the
// circle-of-fifths order, the one where each mode is one note flatter than
// its neighbor.
const BRIGHTNESS_ORDER = [
  { slug: 'lydian', name: 'Lydian', degree: 3 },
  { slug: 'ionian', name: 'Ionian', degree: 0 },
  { slug: 'mixolydian', name: 'Mixolydian', degree: 4 },
  { slug: 'dorian', name: 'Dorian', degree: 1 },
  { slug: 'aeolian', name: 'Aeolian', degree: 5 },
  { slug: 'phrygian', name: 'Phrygian', degree: 2 },
  { slug: 'locrian', name: 'Locrian', degree: 6 },
];

// The site's shared interval labeling (INTERVAL_LABELS, used by every
// scale/chord diagram via computeIntervalTab) always calls semitone 6 "b5"
// — there's no mode-aware override the way chords get via
// interval_overrides (see docs/MUSIC_THEORY.md). Lydian is the one mode
// here where that's wrong: its raised 4th, not a lowered 5th, so its
// diagram needs "#4" instead. Scoped to this lesson only; the shared
// site-wide labeling (and the real /scale/major-scale/lydian page) is a
// separate, bigger fix, not made here.
function relabelLydianDiagram(layers: ScaleChartLayer[]): ScaleChartLayer[] {
  return layers.map((layer) => ({
    ...layer,
    intervals: Array.isArray(layer.intervals)
      ? (layer.intervals as (string | number)[][]).map((row) =>
          row.map((label) => (label === 'b5' ? '#4' : label)),
        )
      : layer.intervals,
  }));
}

interface ModeStep {
  slug: string;
  name: string;
  intervals: number[];
  // The one interval label that just got flatted relative to the previous
  // (brighter) mode — undefined for Lydian, the reference point with
  // nothing flatted yet.
  changedLabel: string | undefined;
}

// Every mode here is anchored to the same root — not "modes of C major"
// (which would each have a different root), but C Lydian, C Ionian, C
// Mixolydian, etc., all sharing one tonic, so the only thing changing
// diagram to diagram is the formula itself.
function buildBrightnessSteps(): ModeStep[] {
  let previousIntervals: number[] | null = null;
  return BRIGHTNESS_ORDER.map(({ slug, name, degree }) => {
    const intervals = getModeIntervals(MAJOR_SCALE_INTERVALS, degree);
    let changedLabel: string | undefined;
    if (previousIntervals) {
      const changedIndex = intervals.findIndex(
        (interval, i) => interval !== previousIntervals![i],
      );
      if (changedIndex !== -1) {
        const semitone = intervals[changedIndex];
        changedLabel =
          slug === 'lydian' && semitone === 6
            ? '#4'
            : INTERVAL_LABELS[semitone];
      }
    }
    previousIntervals = intervals;
    return { slug, name, intervals, changedLabel };
  });
}

// Same brightness cascade as the diagrams above, in table form — hardcoded
// rather than derived, since it's fixed music theory, not something that
// changes with the selected root the way the diagrams do. One row per mode,
// one column per chromatic semitone; blank means that mode doesn't contain
// the note. The changed column per row is the same one the matching
// diagram highlights.
const CHROMATIC_HEADERS = [
  '1',
  'b2',
  '2',
  'b3',
  '3',
  '4',
  '#4/b5',
  '5',
  'b6',
  '6',
  'b7',
  '7',
];
const BRIGHTNESS_TABLE_ROWS: {
  name: string;
  cells: string[];
  changed: string;
}[] = [
  {
    name: 'Lydian',
    cells: ['1', '', '2', '', '3', '', '#4', '5', '', '6', '', '7'],
    changed: '',
  },
  {
    name: 'Ionian',
    cells: ['1', '', '2', '', '3', '4', '', '5', '', '6', '', '7'],
    changed: '4',
  },
  {
    name: 'Mixolydian',
    cells: ['1', '', '2', '', '3', '4', '', '5', '', '6', 'b7', ''],
    changed: 'b7',
  },
  {
    name: 'Dorian',
    cells: ['1', '', '2', 'b3', '', '4', '', '5', '', '6', 'b7', ''],
    changed: 'b3',
  },
  {
    name: 'Aeolian',
    cells: ['1', '', '2', 'b3', '', '4', '', '5', 'b6', '', 'b7', ''],
    changed: 'b6',
  },
  {
    name: 'Phrygian',
    cells: ['1', 'b2', '', 'b3', '', '4', '', '5', 'b6', '', 'b7', ''],
    changed: 'b2',
  },
  {
    name: 'Locrian',
    cells: ['1', 'b2', '', 'b3', '', '4', 'b5', '', 'b6', '', 'b7', ''],
    changed: 'b5',
  },
];

function BrightnessTable() {
  return (
    <div className="mt-8 w-full overflow-x-auto rounded-lg border border-line">
      <table className="w-full min-w-max border-collapse text-sm">
        <thead>
          <tr className="divide-x divide-line border-b border-line bg-surface-sunken">
            <th className="px-4 py-3 text-left font-medium text-fg-secondary">
              Mode
            </th>
            {CHROMATIC_HEADERS.map((header) => (
              <th
                key={header}
                className="px-4 py-3 text-center font-mono font-medium text-fg-secondary"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {BRIGHTNESS_TABLE_ROWS.map(({ name, cells, changed }, i) => (
            <tr
              key={name}
              className={
                i < BRIGHTNESS_TABLE_ROWS.length - 1
                  ? 'divide-x divide-line-subtle border-b border-line-subtle'
                  : 'divide-x divide-line-subtle'
              }
            >
              <th className="px-4 py-3 text-left font-medium">{name}</th>
              {cells.map((cell, j) => (
                <td
                  key={CHROMATIC_HEADERS[j]}
                  className="px-4 py-3 text-center font-mono"
                  style={
                    cell && cell === changed
                      ? { color: HIGHLIGHT_DOT_COLOR, fontWeight: 600 }
                      : undefined
                  }
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BrightnessSpectrumExplorer() {
  const [root, setRoot] = useState('C');
  const selectId = useId();
  const rootPc = NOTE_TO_PC[root];
  const steps = useMemo(() => buildBrightnessSteps(), []);
  const builtSteps = useMemo(
    () =>
      steps.map((step) => {
        // Lydian (no changedLabel — it's the reference point, nothing
        // changed *from* it) still needs an explicit empty array here, not
        // an omitted prop: without highlightLabels at all, buildChart falls
        // back to the ordinary root-in-red treatment, which would wrongly
        // imply the root is what changed. An empty array routes through
        // scaleChartLayersWithHighlight with nothing matching, leaving every
        // note — root included — in the default color.
        const source: ChartSource = {
          kind: 'position',
          intervals: step.intervals,
          highlightLabels: step.changedLabel ? [step.changedLabel] : [],
          ...POSITION,
        };
        const built = buildChart(source, rootPc);
        const layers =
          step.slug === 'lydian'
            ? relabelLydianDiagram(built.layers)
            : built.layers;
        return { ...step, built, layers };
      }),
    [steps, rootPc],
  );

  return (
    <div className="mb-4">
      <RootSelect id={selectId} value={root} onChange={setRoot} />
      <div className="mt-4 flex flex-wrap gap-6">
        {builtSteps.map(({ slug, name, built, layers }) => {
          return (
            <Link
              key={slug}
              href={`/scale/major-scale/${slug}?root=${encodeURIComponent(root)}&string=6&position=1`}
              className="hover:opacity-80"
            >
              <p className="mb-1 text-xs font-semibold tracking-widest text-fg-secondary">
                {root} {name}
              </p>
              <div className="w-40">
                <Fretboard
                  numFrets={built.numFrets}
                  startFret={built.startFret > 1 ? built.startFret : undefined}
                  title={`${root} ${name} — guitar fretboard diagram`}
                >
                  {layers.map((layer, i) => (
                    <Pattern key={i} {...layer} />
                  ))}
                </Fretboard>
              </div>
            </Link>
          );
        })}
      </div>
      <BrightnessTable />
    </div>
  );
}
