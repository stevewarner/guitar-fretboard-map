'use client';
import { useState } from 'react';
import { Fretboard, Pattern } from '@/components/FretboardChart';
import { ColorInput } from '@/components/ColorInput';

const NUM_FRETS = 15;

const OPEN_STRING_PCS = [4, 9, 2, 7, 11, 4]; // low E, A, D, G, B, high e

const NOTE_TO_PC: Record<string, number> = {
  C: 0,
  'C#': 1,
  D: 2,
  'D#': 3,
  E: 4,
  F: 5,
  'F#': 6,
  G: 7,
  'G#': 8,
  A: 9,
  'A#': 10,
  B: 11,
};

const PC_TO_NOTE = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
];

const INTERVAL_KEYS = [
  'b2',
  '2',
  'b3',
  '3',
  '4',
  '#4',
  '5',
  'b6',
  '6',
  'b7',
  '7',
];

const INTERVAL_SEMITONES: Record<string, number> = {
  b2: 1,
  '2': 2,
  b3: 3,
  '3': 4,
  '4': 5,
  '#4': 6,
  '5': 7,
  b6: 8,
  '6': 9,
  b7: 10,
  '7': 11,
};

const LABEL_CLASS = 'text-xs font-medium uppercase tracking-wide text-gray-400';

function getNoteFrets(pitchClass: number): number[][] {
  return OPEN_STRING_PCS.map((openPc) => {
    const frets: number[] = [];
    let fret = (pitchClass - openPc + 12) % 12;
    while (fret <= NUM_FRETS) {
      frets.push(fret);
      fret += 12;
    }
    return frets;
  });
}

const FretboardPage = () => {
  const [root, setRoot] = useState('C');
  const [rootColor, setRootColor] = useState('#3B82F6');
  const [intervals, setIntervals] = useState<Set<string>>(new Set());

  const toggleInterval = (key: string) =>
    setIntervals((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const rootPc = NOTE_TO_PC[root];
  const rootTab = getNoteFrets(rootPc);
  const intervalKeys = INTERVAL_KEYS.filter((k) => intervals.has(k));
  const intervalTabs = intervalKeys.map((k) =>
    getNoteFrets((rootPc + INTERVAL_SEMITONES[k]) % 12),
  );

  return (
    <div className="flex h-full flex-col gap-4 lg:px-12 xl:px-24">
      <div className="flex justify-center">
        <h1>Fretboard Playground</h1>
      </div>

      <div className="flex min-h-0 flex-1 gap-6">
        <div className="flex justify-center min-h-0 basis-1/2">
          <Fretboard numFrets={NUM_FRETS} className="h-full w-auto">
            <Pattern
              tab={rootTab}
              fillColor={rootColor}
              fillOpen
              intervals={Array(6).fill('1')}
            />
            {intervalTabs.map((tab, i) => (
              <Pattern
                key={i}
                tab={tab}
                fillColor="#000"
                intervals={Array(6).fill(intervalKeys[i])}
              />
            ))}
          </Fretboard>
        </div>

        <div className="flex basis-1/2 flex-col gap-6 pt-2 px-8">
          <div className="flex flex-col gap-1">
            <label className={LABEL_CLASS}>Root</label>
            <div className="flex items-center gap-2">
              <select value={root} onChange={(e) => setRoot(e.target.value)}>
                <option value="C">C</option>
                <option value="C#">C#/Db</option>
                <option value="D">D</option>
                <option value="D#">D#/Eb</option>
                <option value="E">E</option>
                <option value="F">F</option>
                <option value="F#">F#/Gb</option>
                <option value="G">G</option>
                <option value="G#">G#/Ab</option>
                <option value="A">A</option>
                <option value="A#">A#/Bb</option>
                <option value="B">B</option>
              </select>
              <ColorInput
                value={rootColor}
                onChange={setRootColor}
                label="Root note color"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className={LABEL_CLASS}>Intervals</span>
            <label className="flex items-center gap-2 text-sm font-medium w-fit">
              <input type="checkbox" checked disabled />1{' '}
              <span className="text-xs text-gray-400">{root}</span>
            </label>
            {INTERVAL_KEYS.map((key) => (
              <label
                key={key}
                className="flex items-center gap-2 text-sm w-fit"
              >
                <input
                  type="checkbox"
                  checked={intervals.has(key)}
                  onChange={() => toggleInterval(key)}
                />
                {key === '#4'
                  ? intervals.size === 0
                    ? '#4/b5'
                    : intervals.has('4')
                      ? 'b5'
                      : '#4'
                  : key}
                {intervals.has(key) && (
                  <span className="text-xs text-gray-400">
                    {PC_TO_NOTE[(rootPc + INTERVAL_SEMITONES[key]) % 12]}
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FretboardPage;
