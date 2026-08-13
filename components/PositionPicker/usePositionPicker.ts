'use client';

import { useState } from 'react';
import { NOTE_TO_PC } from '@/app/utils/constants';
import {
  getValidFingersForString,
  type RootString,
  type RootFinger,
} from '@/modules/scale/utils/scaleUtils';

// State + fallback logic for a PositionPicker: root, root string, and root
// finger, plus the pieces PositionPicker itself needs (rootPc, and the
// derived finger). A finger picked for one root/string can turn out invalid
// after changing root or string (e.g. it required a stretch that isn't
// needed anymore) — this falls back to the nearest valid option rather than
// leaving the caller to render nothing.
export function usePositionPicker(
  defaultRoot: string,
  defaultRootString: RootString,
  defaultRootFinger: RootFinger,
) {
  const [root, setRoot] = useState(defaultRoot);
  const [rootString, setRootString] = useState<RootString>(defaultRootString);
  const [rootFinger, setRootFinger] = useState<RootFinger>(defaultRootFinger);

  const rootPc = NOTE_TO_PC[root];
  const validFingers = getValidFingersForString(rootString, rootPc);
  const finger = validFingers.includes(rootFinger)
    ? rootFinger
    : validFingers[0];

  return {
    root,
    setRoot,
    rootPc,
    rootString,
    setRootString,
    rootFinger: finger,
    setRootFinger,
  };
}
