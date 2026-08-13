'use client';

import { useId } from 'react';
import { RootSelect } from '@/components/RootSelect';
import { STANDARD_TUNING_PC } from '@/app/utils/constants';
import {
  getValidFingersForString,
  ROOT_STRINGS,
  ROOT_FINGERS,
  type RootString,
  type RootFinger,
} from '@/modules/scale/utils/scaleUtils';

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

// Same labeling as the scale library page's PositionControls: finger 0 reads
// as "open" rather than "stretch 1st finger" whenever the root itself is the
// open string, since there's no actual stretch happening in that case.
function fingerLabel(
  finger: RootFinger,
  rootString: RootString,
  rootPc: number,
): string {
  if (finger === 0) {
    const openPc = STANDARD_TUNING_PC[6 - rootString];
    if ((rootPc - openPc + 12) % 12 === 0) return 'open';
  }
  return FINGER_LABELS[finger];
}

interface PositionPickerProps {
  root: string;
  onRootChange: (root: string) => void;
  rootPc: number;
  rootString: RootString;
  onRootStringChange: (value: RootString) => void;
  rootFinger: RootFinger;
  onRootFingerChange: (value: RootFinger) => void;
}

// The root-string + root-finger position controls, as local (non-URL) state
// — for lesson pages that want the reader to explore a position live without
// the page's own URL changing underneath them, unlike the library pages'
// URL-driven PositionControls. Purely presentational: the caller owns root,
// rootString, and rootFinger, and is responsible for falling back to a valid
// finger (via getValidFingersForString) if the current one stops being valid
// after a root or string change — this component only disables the invalid
// options, it doesn't correct the selection itself.
export function PositionPicker({
  root,
  onRootChange,
  rootPc,
  rootString,
  onRootStringChange,
  rootFinger,
  onRootFingerChange,
}: PositionPickerProps) {
  const rootSelectId = useId();
  const stringSelectId = useId();
  const fingerSelectId = useId();
  const validFingers = getValidFingersForString(rootString, rootPc);

  return (
    <fieldset className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3 border-0 p-0">
      <legend className="sr-only">Position</legend>
      <RootSelect id={rootSelectId} value={root} onChange={onRootChange} />
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium" htmlFor={stringSelectId}>
          Root string
        </label>
        <select
          id={stringSelectId}
          className="text-sm"
          value={rootString}
          onChange={(e) =>
            onRootStringChange(Number(e.target.value) as RootString)
          }
        >
          {ROOT_STRINGS.map((s) => (
            <option key={s} value={s}>
              {STRING_LABELS[s]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium" htmlFor={fingerSelectId}>
          Finger on root
        </label>
        <select
          id={fingerSelectId}
          className="text-sm"
          value={rootFinger}
          onChange={(e) =>
            onRootFingerChange(Number(e.target.value) as RootFinger)
          }
        >
          {ROOT_FINGERS.map((f) => (
            <option key={f} value={f} disabled={!validFingers.includes(f)}>
              {fingerLabel(f, rootString, rootPc)}
            </option>
          ))}
        </select>
      </div>
    </fieldset>
  );
}
