'use client';
import { useEffect, useState } from 'react';
import { Fretboard, Pattern } from '@/components/FretboardChart';
import { NOTE_TO_PC, NOTE_OPTIONS } from '@/app/utils/constants';
import {
  computeScaleTab,
  computeRootTab,
  computeIntervalTab,
  computePositionWindow,
  deduplicateGBStrings,
  type ScalePosition,
  type RootString,
  type RootFinger,
} from '@/app/utils/scaleUtils';

const ROOT_STRINGS: RootString[] = [6, 5, 4];
const ROOT_FINGERS: RootFinger[] = [0, 1, 2, 3, 4];

const STRING_LABELS: Record<RootString, string> = {
  6: '6th string',
  5: '5th string',
  4: '4th string',
};

const FINGER_LABELS: Record<RootFinger, string> = {
  0: 'stretch 1st finger',
  1: '1st finger',
  2: '2nd finger',
  3: '3rd finger',
  4: '4th finger',
};

const DEFAULT_POSITION: ScalePosition = { rootString: 6, rootFinger: 1 };

interface ScaleViewerProps {
  modeIntervals: number[];
}

export function ScaleViewer({ modeIntervals }: ScaleViewerProps) {
  const [rootNote, setRootNote] = useState('A');
  const [position, setPosition] = useState<ScalePosition>(DEFAULT_POSITION);

  const rootPc = NOTE_TO_PC[rootNote];

  // If the current position becomes invalid after a key change, reset to default.
  useEffect(() => {
    if (!computePositionWindow(position, rootPc)) {
      setPosition(DEFAULT_POSITION);
    }
  }, [rootPc, position]);

  const posWindow =
    computePositionWindow(position, rootPc) ??
    computePositionWindow(DEFAULT_POSITION, rootPc)!;
  const { startFret: rawStartFret, numFrets } = posWindow;

  // Compute at rawStartFret first; if the window starts at 0 but no notes land on open
  // strings, shift up to 1 so the chart doesn't show an empty open-string area above the nut.
  const rawScaleTab = computeScaleTab(modeIntervals, rootPc, rawStartFret, numFrets);
  const hasOpenNotes = rawStartFret === 0 && rawScaleTab.some((frets) => frets.includes(0));
  const startFret = rawStartFret === 0 && !hasOpenNotes ? 1 : rawStartFret;

  // Pattern.startFret must be ≥ 1; fret 0 (open string) is always above the nut.
  const patternStartFret = Math.max(1, startFret);

  // Use rawStartFret for finger-label alignment: the fingering is defined by the original
  // window position, regardless of whether we shifted the display up by one fret.
  const fingerLabels: string[] =
    position.rootFinger === 0
      ? ['', '1', '2', '3', '4']
      : position.rootFinger === 1 || rawStartFret === 0
        ? ['1', '2', '3', '4', '']
        : ['', '1', '2', '3', '4'];

  const scaleTab = deduplicateGBStrings(
    startFret === rawStartFret ? rawScaleTab : computeScaleTab(modeIntervals, rootPc, startFret, numFrets),
    position.rootFinger,
    startFret,
    numFrets,
  );
  const rootTab = deduplicateGBStrings(
    computeRootTab(rootPc, startFret, numFrets),
    position.rootFinger,
    startFret,
    numFrets,
  );
  const scaleIntervalTab = computeIntervalTab(scaleTab, rootPc);
  const rootIntervalTab = rootTab.map((frets) => frets.map(() => '1'));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium" htmlFor="key-select">
            Key
          </label>
          <select
            id="key-select"
            value={rootNote}
            onChange={(e) => setRootNote(e.target.value)}
            className="text-sm"
          >
            {NOTE_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium" htmlFor="string-select">
            String
          </label>
          <select
            id="string-select"
            value={position.rootString}
            onChange={(e) => {
              const rootString = Number(e.target.value) as RootString;
              const validFingers = ROOT_FINGERS.filter(
                (f) =>
                  computePositionWindow(
                    { rootString, rootFinger: f },
                    rootPc,
                  ) !== null,
              );
              const rootFinger = validFingers.includes(position.rootFinger)
                ? position.rootFinger
                : validFingers[0];
              setPosition({ rootString, rootFinger });
            }}
            className="text-sm"
          >
            {ROOT_STRINGS.map((s) => (
              <option key={s} value={s}>
                {STRING_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium" htmlFor="finger-select">
            Finger
          </label>
          <select
            id="finger-select"
            value={position.rootFinger}
            onChange={(e) =>
              setPosition({
                ...position,
                rootFinger: Number(e.target.value) as RootFinger,
              })
            }
            className="text-sm"
          >
            {ROOT_FINGERS.filter(
              (f) =>
                computePositionWindow(
                  { rootString: position.rootString, rootFinger: f },
                  rootPc,
                ) !== null,
            ).map((f) => (
              <option key={f} value={f}>
                {FINGER_LABELS[f]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="w-64">
        <Fretboard
          numFrets={numFrets}
          startFret={startFret > 1 ? startFret : undefined}
          fingerLabels={fingerLabels}
        >
          <Pattern
            tab={scaleTab}
            fillColor="#000"
            fillOpen
            intervals={scaleIntervalTab}
            startFret={patternStartFret}
          />
          <Pattern
            tab={rootTab}
            fillColor="#cc2200"
            fillOpen
            intervals={rootIntervalTab}
            startFret={patternStartFret}
          />
        </Fretboard>
      </div>
    </div>
  );
}
