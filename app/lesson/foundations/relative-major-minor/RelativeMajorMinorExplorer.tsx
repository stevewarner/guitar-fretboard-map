'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { RootSelect } from '@/components/RootSelect';
import { StaticChart, type ChartSource } from '@/components/FretboardChart';
import { NOTE_TO_PC } from '@/app/utils/constants';
import { spellScale } from '@/app/utils/noteSpelling';
import { MAJOR_SCALE_INTERVALS } from '@/modules/scale/utils/scaleUtils';

const NATURAL_MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 10];

// One real major-scale box shape (root on the 6th string, 1st finger — the
// same box the Scale Explorer renders for Ionian, verified fret-by-fret
// against its actual output), reused with two label sets below. tabRelative
// is root-agnostic (offsets from the root fret), one array per string (6→1).
const BOX_POSITION = { rootString: 6 as const, rootFinger: 1 as const };
const BOX_TAB_RELATIVE = [
  [0, 2, 4],
  [0, 2, 4],
  [1, 2, 4],
  [1, 2],
  [0, 2, 4],
  [0, 2, 4],
];
const MAJOR_LABELS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '1', '2'],
  ['3', '4'],
  ['5', '6', '7'],
  ['1', '2', '3'],
];
// The exact same shape, relabeled from its 6th degree — the standard
// rotate-to-the-6th-degree relationship, not specific to any one root.
const RELATIVE_MINOR_LABELS = [
  ['b3', '4', '5'],
  ['b6', 'b7', '1'],
  ['2', 'b3', '4'],
  ['5', 'b6'],
  ['b7', '1', '2'],
  ['b3', '4', '5'],
];

// Both box charts pass the SAME rootPc (the picked major root) — that's what
// anchors the fret window, and it must stay fixed for both so the two
// diagrams land on the identical frets. Only intervalLabels differs, which
// is what actually controls which note is drawn as the root.
const MAJOR_BOX_SOURCE: ChartSource = {
  kind: 'relativeShape',
  tabRelative: BOX_TAB_RELATIVE,
  intervalLabels: MAJOR_LABELS,
  ...BOX_POSITION,
};
const MINOR_BOX_SOURCE: ChartSource = {
  kind: 'relativeShape',
  tabRelative: BOX_TAB_RELATIVE,
  intervalLabels: RELATIVE_MINOR_LABELS,
  ...BOX_POSITION,
};

const MAJOR_POSITION_4 = { rootString: 6 as const, rootFinger: 4 as const };
const MINOR_POSITION_1 = { rootString: 6 as const, rootFinger: 1 as const };

// Picking the major root drives everything else — the relative minor root is
// always the major scale's own 6th degree, so it's calculated, never picked
// separately.
export function RelativeMajorMinorExplorer() {
  const [majorRoot, setMajorRoot] = useState('C');
  const selectId = useId();
  const majorPc = NOTE_TO_PC[majorRoot];
  // Reuses the same spelling utility the diatonic-harmony chord grid relies
  // on, so the letter name comes out correctly (e.g. G major → E minor, not
  // the enharmonically-equal but wrong-letter Fb minor).
  const minorRoot = spellScale(majorRoot, MAJOR_SCALE_INTERVALS)[5];
  const minorPc = NOTE_TO_PC[minorRoot];

  return (
    <div className="mb-4">
      <RootSelect
        id={selectId}
        value={majorRoot}
        onChange={setMajorRoot}
        label="Major root"
      />
      <p className="mb-4 mt-2 text-sm text-fg-secondary">
        {majorRoot} major → {minorRoot} minor, its relative minor (the 6th
        degree of {majorRoot} major).
      </p>

      <h3>Same shape, different root</h3>
      <p className="mb-4 text-sm text-fg-secondary">
        One shape, the root fret held fixed. Only the labels change.
      </p>
      <div className="mb-8 flex flex-wrap gap-6">
        <StaticChart
          source={MAJOR_BOX_SOURCE}
          rootPc={majorPc}
          title={`${majorRoot} major scale, root on the 6th string — guitar fretboard diagram`}
          label={`${majorRoot} Major`}
        />
        <StaticChart
          source={MINOR_BOX_SOURCE}
          rootPc={majorPc}
          title={`${minorRoot} minor scale, same shape as ${majorRoot} major — guitar fretboard diagram`}
          label={`${minorRoot} Minor (Same Shape)`}
        />
      </div>

      <h3>Each key&rsquo;s own natural position</h3>
      <p className="mb-4 text-sm text-fg-secondary">
        Position 4 of the major scale and position 1 of its relative minor land
        in the same hand position on the neck for most keys. Try a few roots
        above and see for yourself. (One exception: G major, whose relative
        minor E sits on the open low string, which pushes its position 1 up an
        octave.)
      </p>
      <div className="flex flex-wrap gap-6">
        <Link
          href={`/scale/major-scale/ionian?root=${encodeURIComponent(majorRoot)}&string=6&position=4`}
          className="hover:opacity-80"
        >
          <StaticChart
            source={{
              kind: 'position',
              intervals: MAJOR_SCALE_INTERVALS,
              ...MAJOR_POSITION_4,
            }}
            rootPc={majorPc}
            title={`${majorRoot} major (Ionian), position 4 — guitar fretboard diagram`}
            label={`${majorRoot} Major, Position 4`}
          />
        </Link>
        <Link
          href={`/scale/major-scale/aeolian?root=${encodeURIComponent(minorRoot)}&string=6&position=1`}
          className="hover:opacity-80"
        >
          <StaticChart
            source={{
              kind: 'position',
              intervals: NATURAL_MINOR_INTERVALS,
              ...MINOR_POSITION_1,
            }}
            rootPc={minorPc}
            title={`${minorRoot} minor (Aeolian), position 1 — guitar fretboard diagram`}
            label={`${minorRoot} Minor, Position 1`}
          />
        </Link>
      </div>
    </div>
  );
}
