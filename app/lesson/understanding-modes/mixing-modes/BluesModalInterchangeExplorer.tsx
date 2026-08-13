'use client';

import { useId, useMemo, useState } from 'react';
import Link from 'next/link';
import { RootSelect } from '@/components/RootSelect';
import {
  StaticChart,
  ChordCard,
  SpotlightOverlay,
  type ChartSource,
  type SpotlightShape,
} from '@/components/FretboardChart';
import { NOTE_TO_PC } from '@/app/utils/constants';
import {
  MAJOR_SCALE_INTERVALS,
  getModeIntervals,
  getDiatonicChords,
  deriveScaleRender,
  mergeScaleRenderShape,
} from '@/modules/scale/utils/scaleUtils';
import type { DbChordShape } from '@/modules/chordv2/db/queries';

// Every scale here is anchored to the tonic — this is A blues, not a key
// change per chord. Only the mode changes; the root never does.
const SCALE_POSITION = { rootString: 6 as const, rootFinger: 1 as const };

interface BluesRow {
  label: string; // 'I7', 'IV7', 'V7'
  slug: string;
  modeName: string;
  modeDegree: number; // index into modules/scale/data/systems.ts's mode ordering
  chordDegreeIndex: number; // 0-indexed scale degree this chord is built on (0, 3, 4)
  chordRootString: number;
  chordRootFinger: number;
  // The dominant-7 chord tones (1, 3, 5, b7) built on this row's scale
  // degree, expressed as labels relative to the *tonic* — e.g. IV7's own
  // notes (D-F#-A-C) land on A Dorian's 1, b3, 4, 6. Highlighting the whole
  // chord, not just the one note that makes the mode the mode, is the
  // clearer example: it shows the chord already sitting inside the scale.
  highlightLabels: string[];
}

// All 3 chord shapes land around the same fret for any given tonic (verified
// for A: fret 5 on all three) — the whole progression is playable from one
// hand position, which is the point being illustrated, not a coincidence.
const ROWS: BluesRow[] = [
  {
    label: 'I7',
    slug: 'mixolydian',
    modeName: 'Mixolydian',
    modeDegree: 4,
    chordDegreeIndex: 0,
    chordRootString: 6,
    chordRootFinger: 1,
    highlightLabels: ['1', '3', '5', 'b7'],
  },
  {
    label: 'IV7',
    slug: 'dorian',
    modeName: 'Dorian',
    modeDegree: 1,
    chordDegreeIndex: 3,
    chordRootString: 5,
    chordRootFinger: 1,
    highlightLabels: ['1', 'b3', '4', '6'],
  },
  {
    label: 'V7',
    slug: 'ionian',
    modeName: 'Ionian',
    modeDegree: 0,
    chordDegreeIndex: 4,
    chordRootString: 5,
    chordRootFinger: 3,
    highlightLabels: ['2', '4', '5', '7'],
  },
];

// Same merge as FullNeckScaleOverlay (scale-positions-full-neck): a mode's
// scaleTab and rootTab come back separately (so the single-mode diagrams
// above can color the root on its own), but here every note of a mode needs
// to be the same color regardless of scale-degree-vs-root, so they're
// combined into one per-string tab.
function buildModeLayer(
  modeIntervals: number[],
  rootPc: number,
  label: string,
): SpotlightShape {
  const rendered = deriveScaleRender(modeIntervals, rootPc, SCALE_POSITION);
  return mergeScaleRenderShape(rendered, label);
}

// All 3 modes, same tonic, same position, overlaid on one fretboard — same
// shared SpotlightOverlay as FullNeckOverlay/FullNeckScaleOverlay, single-
// select spotlight (one mode highlighted at a time, not several colors at
// once).
function MixedModesOverlay({ tonicPc }: { tonicPc: number }) {
  const shapes = useMemo(
    () =>
      ROWS.map((row) =>
        buildModeLayer(
          getModeIntervals(MAJOR_SCALE_INTERVALS, row.modeDegree),
          tonicPc,
          row.modeName,
        ),
      ),
    [tonicPc],
  );

  return (
    <SpotlightOverlay
      className="mb-4 mt-8"
      shapes={shapes}
      caption="All 3 modes, on one fretboard."
      boardTitle="Mixolydian, Dorian, and Ionian together — guitar fretboard diagram"
    />
  );
}

export function BluesModalInterchangeExplorer({
  shapes,
}: {
  shapes: DbChordShape[];
}) {
  const [tonic, setTonic] = useState('A');
  const selectId = useId();
  const tonicPc = NOTE_TO_PC[tonic];
  // The chord roots (I, IV, V) are just scale degrees 1, 4, 5 of the
  // tonic's own major scale — reusing this instead of a raw pitch-class
  // lookup gives the correctly spelled letter name for every key, not just
  // the sharp-spelled default (e.g. Bb for an F blues, not A#).
  const diatonic = getDiatonicChords(MAJOR_SCALE_INTERVALS, tonic) ?? [];

  return (
    <div className="mb-4">
      <RootSelect id={selectId} value={tonic} onChange={setTonic} label="Key" />
      <div className="mt-4 flex flex-col gap-8">
        {ROWS.map(
          ({
            label,
            slug,
            modeName,
            modeDegree,
            chordDegreeIndex,
            chordRootString,
            chordRootFinger,
            highlightLabels,
          }) => {
            const modeIntervals = getModeIntervals(
              MAJOR_SCALE_INTERVALS,
              modeDegree,
            );
            const chordRootNote = diatonic[chordDegreeIndex]?.rootNote ?? tonic;
            const chordRootPc = NOTE_TO_PC[chordRootNote];
            const shape = shapes.find(
              (s) =>
                s.quality_symbol === '7' &&
                s.root_string === chordRootString &&
                s.root_finger === chordRootFinger &&
                s.moveable,
            );
            const scaleSource: ChartSource = {
              kind: 'position',
              intervals: modeIntervals,
              highlightLabels,
              ...SCALE_POSITION,
            };
            return (
              <div key={label}>
                <p className="mb-3 text-sm text-fg-secondary">
                  <span className="font-mono font-semibold text-fg">
                    {label}
                  </span>{' '}
                  ({chordRootNote}7), from {tonic} {modeName}, highlighting{' '}
                  {chordRootNote}7&apos;s own chord tones (
                  {highlightLabels.join(', ')})
                </p>
                <div className="flex flex-wrap gap-6">
                  <Link
                    href={`/scale/major-scale/${slug}?root=${encodeURIComponent(tonic)}&string=${SCALE_POSITION.rootString}&position=${SCALE_POSITION.rootFinger}`}
                    className="hover:opacity-80"
                  >
                    <StaticChart
                      source={scaleSource}
                      rootPc={tonicPc}
                      title={`${tonic} ${modeName} — guitar fretboard diagram`}
                      label={`${tonic} ${modeName}`}
                    />
                  </Link>
                  {shape && (
                    <ChordCard
                      quality="7"
                      rootNote={chordRootNote}
                      rootPc={chordRootPc}
                      rootString={chordRootString}
                      rootFinger={chordRootFinger}
                      tab={shape.tab_relative}
                      label={`${chordRootNote}7`}
                    />
                  )}
                </div>
              </div>
            );
          },
        )}
      </div>
      <MixedModesOverlay tonicPc={tonicPc} />
    </div>
  );
}
