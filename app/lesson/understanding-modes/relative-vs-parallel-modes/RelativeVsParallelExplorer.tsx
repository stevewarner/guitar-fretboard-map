'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { RootSelect } from '@/components/RootSelect';
import { StaticChart, type ChartSource } from '@/components/FretboardChart';
import { NOTE_TO_PC } from '@/app/utils/constants';
import { spellScale } from '@/app/utils/noteSpelling';
import {
  MAJOR_SCALE_INTERVALS,
  getModeIntervals,
} from '@/modules/scale/utils/scaleUtils';

// Degree indices match modules/scale/data/systems.ts's own mode ordering
// (Ionian 0 ... Locrian 6) — Aeolian and Dorian derived from it here rather
// than hardcoded as their own interval arrays, so this stays framed as
// "modes of the major scale" throughout, matching the rest of this part.
const AEOLIAN_DEGREE = 5;
const DORIAN_DEGREE = 1;
const PARALLEL_POSITION = { rootString: 6 as const, rootFinger: 1 as const };
// The relative pair uses different (string, finger) positions for each
// mode on purpose — verified (for the default C/A root) that these two
// specific positions land on the exact same shape, same frets, same dots,
// just labeled from a different starting note. Not guaranteed pixel-for-
// pixel identical at every root the way RelativeMajorMinorExplorer's own
// hardcoded-shape trick is (spot-checked G/E: very close, one extra note
// on one string) — but every root still renders its own correct, clearly
// labeled position either way.
const RELATIVE_IONIAN_POSITION = {
  rootString: 6 as const,
  rootFinger: 0 as const,
};
const RELATIVE_AEOLIAN_POSITION = {
  rootString: 5 as const,
  rootFinger: 4 as const,
};

// One root drives all four diagrams: the relative minor root is always the
// major root's own 6th degree (calculated, never picked separately, same
// convention as Relative Major and Minor); the parallel comparison just
// reuses the same root untouched.
export function RelativeVsParallelExplorer() {
  const [root, setRoot] = useState('C');
  const selectId = useId();
  const rootPc = NOTE_TO_PC[root];
  const relativeMinorRoot = spellScale(root, MAJOR_SCALE_INTERVALS)[5];
  const relativeMinorPc = NOTE_TO_PC[relativeMinorRoot];
  const aeolianIntervals = getModeIntervals(
    MAJOR_SCALE_INTERVALS,
    AEOLIAN_DEGREE,
  );
  const dorianIntervals = getModeIntervals(
    MAJOR_SCALE_INTERVALS,
    DORIAN_DEGREE,
  );

  // The parallel pair shares its root fret (see PARALLEL_POSITION), so
  // highlighting the root here wouldn't show anything a reader doesn't
  // already know — it's in the same place on both diagrams. Highlighting
  // the notes that actually differ (3/7 vs b3/b7) points straight at what
  // "different formula" means instead. Two distinct colors here, one per
  // diagram — an explicit, deliberate exception to the site's usual
  // one-highlight-color rule (see scaleChartLayersWithHighlight), since
  // these two are compared side by side and each needs its own change to
  // read independently of the other's.
  const parallelIonianSource: ChartSource = {
    kind: 'position',
    intervals: MAJOR_SCALE_INTERVALS,
    highlightLabels: ['3', '7'],
    highlightColor: '#16a34a',
    ...PARALLEL_POSITION,
  };

  return (
    <div className="mb-4">
      <RootSelect id={selectId} value={root} onChange={setRoot} />

      <h3>Relative: same notes, different starting point</h3>
      <p className="mb-4 text-sm text-fg-secondary">
        {root} Ionian and {relativeMinorRoot} Aeolian share every note:{' '}
        {relativeMinorRoot} is the 6th degree of {root} Ionian. Nothing else
        changes.
      </p>
      <div className="mb-8 flex flex-wrap gap-6">
        <Link
          href={`/scale/major-scale/ionian?root=${encodeURIComponent(root)}&string=6&position=0`}
          className="hover:opacity-80"
        >
          <StaticChart
            source={{
              kind: 'position',
              intervals: MAJOR_SCALE_INTERVALS,
              ...RELATIVE_IONIAN_POSITION,
            }}
            rootPc={rootPc}
            title={`${root} Ionian — guitar fretboard diagram`}
            label={`${root} Ionian`}
          />
        </Link>
        <Link
          href={`/scale/major-scale/aeolian?root=${encodeURIComponent(relativeMinorRoot)}&string=5&position=4`}
          className="hover:opacity-80"
        >
          <StaticChart
            source={{
              kind: 'position',
              intervals: aeolianIntervals,
              ...RELATIVE_AEOLIAN_POSITION,
            }}
            rootPc={relativeMinorPc}
            title={`${relativeMinorRoot} Aeolian — guitar fretboard diagram`}
            label={`${relativeMinorRoot} Aeolian`}
          />
        </Link>
      </div>

      <h3>Parallel: same root, different formula</h3>
      <p className="mb-4 text-sm text-fg-secondary">
        {root} Ionian and {root} Dorian share the same root but not the same
        notes: the 3rd and 7th (green) are flattened to b3 and b7 (light blue)
        in Dorian, a genuinely different scale anchored to the same starting
        point.
      </p>
      <div className="flex flex-wrap gap-6">
        <Link
          href={`/scale/major-scale/ionian?root=${encodeURIComponent(root)}&string=6&position=1`}
          className="hover:opacity-80"
        >
          <StaticChart
            source={parallelIonianSource}
            rootPc={rootPc}
            title={`${root} Ionian — guitar fretboard diagram`}
            label={`${root} Ionian`}
          />
        </Link>
        <Link
          href={`/scale/major-scale/dorian?root=${encodeURIComponent(root)}&string=6&position=1`}
          className="hover:opacity-80"
        >
          <StaticChart
            source={{
              kind: 'position',
              intervals: dorianIntervals,
              highlightLabels: ['b3', 'b7'],
              highlightColor: '#38bdf8',
              ...PARALLEL_POSITION,
            }}
            rootPc={rootPc}
            title={`${root} Dorian — guitar fretboard diagram`}
            label={`${root} Dorian`}
          />
        </Link>
      </div>
    </div>
  );
}
