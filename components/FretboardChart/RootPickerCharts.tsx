'use client';

import { useId, useMemo, useState } from 'react';
import Link from 'next/link';
import { NOTE_TO_PC } from '@/app/utils/constants';
import { RootSelect } from '@/components/RootSelect';
import { Fretboard } from './Fretboard';
import { Pattern } from './Pattern';
import { buildChart, type ChartSource } from './buildChart';
import { describeChartForScreenReaders } from './describeChartForScreenReaders';

export interface RootPickerChartSpec {
  label?: string;
  // Appended after the resolved root note, e.g. "major pentatonic, box position".
  titleSuffix: string;
  source: ChartSource;
  // Template for a link to this exact shape on its scale page; {root} is replaced
  // with the resolved root note. Omit when the shape has no exact scale-page
  // equivalent (e.g. an anchored-window position, not a named hand position).
  href?: string;
}

interface RootPickerChartsProps {
  defaultRoot: string;
  charts: RootPickerChartSpec[];
  // Template for the caption text; {root} is replaced with the resolved root note.
  caption?: string;
  chartClassName?: string;
}

// Everything about these charts is hardcoded to the example being taught — shape,
// position, fingering — except the root, which the reader can change to see the
// same shape in a different key. Local state on purpose: each example on a lesson
// page is independent, so there's no shared URL param to collide over.
export function RootPickerCharts({
  defaultRoot,
  charts,
  caption,
  chartClassName = 'w-64',
}: RootPickerChartsProps) {
  const [rootNote, setRootNote] = useState(defaultRoot);
  const rootPc = NOTE_TO_PC[rootNote];
  const selectId = useId();
  const builtCharts = useMemo(
    () => charts.map((chart) => buildChart(chart.source, rootPc)),
    [charts, rootPc],
  );

  return (
    <div className="mb-4">
      <RootSelect id={selectId} value={rootNote} onChange={setRootNote} />
      {caption && (
        <p className="mb-4 mt-2 text-sm text-fg-secondary">
          {caption.replace(/\{root\}/g, rootNote)}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-6">
        {charts.map((chart, i) => {
          const built = builtCharts[i];
          const href = chart.href?.replace(/\{root\}/g, rootNote);
          const content = (
            <>
              {chart.label && (
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-fg-secondary">
                  {chart.label}
                </p>
              )}
              <div className={chartClassName}>
                <Fretboard
                  numFrets={built.numFrets}
                  startFret={built.startFret > 1 ? built.startFret : undefined}
                  title={`${rootNote} ${chart.titleSuffix} — guitar fretboard diagram`}
                >
                  {built.layers.map((layer, li) => (
                    <Pattern key={li} {...layer} />
                  ))}
                </Fretboard>
              </div>
            </>
          );

          // The sr-only description lives outside the Link (not inside
          // `content`) so it doesn't get folded into the link's accessible
          // name — a screen reader user browsing by links just wants "G
          // Ionian scale, position 2", not the full string-by-string dump.
          return (
            <div key={i}>
              {href ? (
                <Link href={href} className="hover:opacity-80">
                  {content}
                </Link>
              ) : (
                content
              )}
              <p className="sr-only">
                {describeChartForScreenReaders(built.layers)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
