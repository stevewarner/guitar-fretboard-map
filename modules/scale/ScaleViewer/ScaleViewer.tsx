import {
  Fretboard,
  Pattern,
  scaleChartDefaultLayer,
} from '@/components/FretboardChart';
import { PositionControls } from '@/components/PositionControls';
import { Panel } from '@/components/Panel';
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
import {
  deriveScaleRender,
  computeNoteTab,
  type ScalePosition,
} from '@/modules/scale/utils/scaleUtils';

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
  // SVG-only <desc> summary (notes/intervals/root string) — see
  // components/FretboardChart/Fretboard.tsx and docs/GEO_STRATEGY.md item 5.
  // Built by the page (has the notes/interval-label data already) and just
  // threaded through here.
  description?: string;
}

export function ScaleViewer({
  modeIntervals,
  modeTitle,
  patternKind,
  rootNote,
  rootPc,
  position,
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

  return (
    <LabelModeProvider>
      <RootHighlightProvider>
        <Panel>
          <PositionControls
            rootNote={rootNote}
            rootPc={rootPc}
            position={position}
          />

          <p className="sr-only" aria-live="polite">
            {`Showing ${modeTitle} ${patternKind} in ${rootNote}, string ${position.rootString}, position ${position.rootFinger}`}
          </p>

          <div className="mt-4 w-64">
            <Fretboard
              numFrets={render.numFrets}
              startFret={render.startFret > 1 ? render.startFret : undefined}
              fingerLabels={render.fingerLabels}
              title={`${modeTitle} ${patternKind} in ${rootNote} — guitar fretboard diagram`}
              description={description}
            >
              <LabelModeLayer
                intervalContent={<Pattern {...layer} />}
                noteContent={<Pattern {...layer} intervals={noteIntervals} />}
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
          {/* Not width-constrained to the w-64 diagram column above — these
              2 labels don't fit side by side in 256px, and the point of a
              row layout is that they don't wrap. */}
          <div className="mt-2 flex flex-row items-center gap-4">
            <LabelModeToggle />
            <RootHighlightToggle />
          </div>
        </Panel>
      </RootHighlightProvider>
    </LabelModeProvider>
  );
}
