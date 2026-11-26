import { Suspense } from 'react';
import {
  Fretboard,
  NeckChart,
  Pattern,
  scaleChartDefaultLayer,
} from '@/components/FretboardChart';
import { PositionControls } from '@/components/PositionControls';
import { Panel } from '@/components/Panel';
import { IntervalsNotesTable } from '@/components/IntervalsNotesTable';
import {
  RootHighlightProvider,
  RootHighlightToggle,
  RootHighlightLayer,
} from '@/components/RootHighlightToggle';
import {
  LabelModeProvider,
  LabelModeToggle,
  LabelModeLayer,
} from '@/components/LabelModeToggle';
import { ACCENT_HEX } from '@/app/utils/constants';
import { STRING_LABELS, fingerLabel } from '@/app/utils/musicUtils';
import {
  deriveScaleRender,
  computeIntervalTab,
  computeNoteTab,
  computeScaleTab,
  type ScalePosition,
} from '@/modules/scale/utils/scaleUtils';

const NECK_FRETS = 15;

interface ScaleViewerProps {
  modeIntervals: number[];
  modeTitle: string;
  // Pentatonic entries are genuinely scales, not modes of one another —
  // "pentatonic mode" isn't a term anyone uses. Everything else here (Lydian,
  // Phrygian Dominant, even the tonic Harmonic/Melodic Minor entries) is
  // conventionally called a mode. Passed in rather than hardcoded so this
  // stays correct as systems are added.
  patternKind: 'scale' | 'mode';
  rootNote: string;
  rootPc: number;
  position: ScalePosition;
  // Same order as modeIntervals: spelled interval labels and note names.
  intervalLabels: string[];
  noteNames: string[];
  // SVG-only <desc> summary (notes/intervals/root string) — see
  // components/FretboardChart/Fretboard.tsx and docs/GEO_STRATEGY.md item 5.
  // Built by the page (has the notes/interval-label data already) and just
  // threaded through here.
  description?: string;
}

// The scale detail panel: everything the Root / String / Position selects
// control — the position diagram, the notes and intervals, and the whole
// neck with this position lit.
export function ScaleViewer({
  modeIntervals,
  modeTitle,
  patternKind,
  rootNote,
  rootPc,
  position,
  intervalLabels,
  noteNames,
  description,
}: ScaleViewerProps) {
  const render = deriveScaleRender(modeIntervals, rootPc, position);
  // Library page — every note in the default color, root included, per
  // docs/STYLE_GUIDE.md — unless the reader opts into RootHighlightToggle,
  // which layers an accent-colored root overlay on top (always computed;
  // RootHighlightLayer decides whether to show it).
  const layer = scaleChartDefaultLayer(render);
  // LabelModeToggle's "Show note names" alternative to layer.intervals/
  // render.rootIntervalTab — same dots (layer.tab, render.rootTab), just a
  // different label. scaleTab/rootTab are always plain frets (never 'x',
  // that's only the chord page's flat single-fret-per-string format), so
  // the cast mirrors scaleChartDefaultLayer's own.
  const noteTab = computeNoteTab(
    render.scaleTab as number[][],
    rootNote,
    rootPc,
    modeIntervals,
  );
  const rootNoteTab = computeNoteTab(
    render.rootTab as number[][],
    rootNote,
    rootPc,
    modeIntervals,
  );
  const noteIntervals = noteTab.map((notes, i) => [
    ...notes,
    ...(rootNoteTab[i] ?? []),
  ]);

  const scaleName = `${rootNote} ${modeTitle}`;
  const finger = fingerLabel(position.rootFinger, position.rootString, rootPc);
  const positionPhrase = `${STRING_LABELS[position.rootString]}, ${finger === 'open' ? 'open position' : `played with ${finger}`}`;

  // Full neck: every scale tone to the 15th fret, with this position (its
  // dots, root included) drawn on top in the accent color. Frets above the
  // neck view are dropped from the highlight rather than stretching the neck
  // for a single high position.
  const neckTab = computeScaleTab(modeIntervals, rootPc, 0, NECK_FRETS + 1);
  // layer.tab lists the root fret twice (scale tones + root overlay).
  const positionTab = (layer.tab as number[][]).map((frets) =>
    [...new Set(frets)].filter((fret) => fret <= NECK_FRETS),
  );
  const neckTitle = `${scaleName} notes to the ${NECK_FRETS}th fret, root on ${positionPhrase} position highlighted`;
  const neck = (labelTab: (tab: number[][]) => string[][]) => (
    // Scrolls sideways on a phone rather than shrinking the dots.
    <div className="overflow-x-auto pb-2 sm:pb-0">
      <NeckChart
        numFrets={NECK_FRETS}
        layers={[
          { tab: neckTab, labels: labelTab(neckTab), fillColor: '#000' },
          {
            tab: positionTab,
            labels: labelTab(positionTab),
            fillColor: ACCENT_HEX,
            fillOpen: true,
          },
        ]}
        title={neckTitle}
        className="w-[760px] max-w-none sm:w-full sm:max-w-full"
      />
    </div>
  );
  const intervalLabelTab = (tab: number[][]) =>
    computeIntervalTab(tab, rootPc, modeIntervals);
  const noteLabelTab = (tab: number[][]) =>
    computeNoteTab(tab, rootNote, rootPc, modeIntervals);

  const toggles = (
    <div className="flex flex-row flex-wrap gap-4 sm:flex-col sm:gap-2.5">
      <LabelModeToggle />
      <RootHighlightToggle />
    </div>
  );

  return (
    <LabelModeProvider>
      <RootHighlightProvider>
        <Panel>
          <div className="flex flex-col gap-10">
            <div>
              <Suspense>
                <PositionControls
                  rootNote={rootNote}
                  rootPc={rootPc}
                  position={position}
                />
              </Suspense>

              <p className="sr-only" aria-live="polite">
                {`Showing ${modeTitle} ${patternKind} in ${rootNote}, string ${position.rootString}, position ${position.rootFinger}`}
              </p>

              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-10">
                <div className="order-2 w-64 shrink-0 sm:order-1">
                  <Fretboard
                    numFrets={render.numFrets}
                    startFret={
                      render.startFret > 1 ? render.startFret : undefined
                    }
                    fingerLabels={render.fingerLabels}
                    title={`${modeTitle} ${patternKind} in ${rootNote} — guitar fretboard diagram`}
                    description={description}
                  >
                    <LabelModeLayer
                      intervalContent={<Pattern {...layer} />}
                      noteContent={
                        <Pattern {...layer} intervals={noteIntervals} />
                      }
                    />
                    <RootHighlightLayer>
                      <LabelModeLayer
                        intervalContent={
                          <Pattern
                            tab={render.rootTab}
                            intervals={render.rootIntervalTab}
                            fillColor={ACCENT_HEX}
                            fillOpen
                            startFret={render.patternStartFret}
                          />
                        }
                        noteContent={
                          <Pattern
                            tab={render.rootTab}
                            intervals={rootNoteTab}
                            fillColor={ACCENT_HEX}
                            fillOpen
                            startFret={render.patternStartFret}
                          />
                        }
                      />
                    </RootHighlightLayer>
                  </Fretboard>
                </div>

                <div className="order-1 flex min-w-0 flex-col gap-5 sm:order-2 sm:gap-6 sm:pt-1">
                  <div>
                    <h2 className="text-lg font-semibold">{scaleName}</h2>
                    <p className="mt-1 text-sm leading-snug text-fg-secondary">
                      Root on {positionPhrase}.
                    </p>
                  </div>
                  <IntervalsNotesTable
                    degrees={intervalLabels}
                    notes={noteNames}
                  />
                  {toggles}
                </div>
              </div>
            </div>

            <div className="flex min-w-0 flex-col gap-3">
              <h3 className="text-base font-semibold">
                {scaleName} on the fretboard
              </h3>
              <LabelModeLayer
                intervalContent={neck(intervalLabelTab)}
                noteContent={neck(noteLabelTab)}
              />
            </div>
          </div>
        </Panel>
      </RootHighlightProvider>
    </LabelModeProvider>
  );
}
