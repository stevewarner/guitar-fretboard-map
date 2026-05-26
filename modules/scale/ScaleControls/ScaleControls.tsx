'use client';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { NOTE_OPTIONS } from '@/app/utils/constants';
import {
  ROOT_STRINGS,
  getValidFingersForString,
  type RootString,
  type ScalePosition,
} from '@/modules/scale/utils/scaleUtils';

const STRING_LABELS: Record<RootString, string> = {
  6: '6th string',
  5: '5th string',
  4: '4th string',
};

const FINGER_LABELS: Record<number, string> = {
  0: 'stretch 1st finger',
  1: '1st finger',
  2: '2nd finger',
  3: '3rd finger',
  4: '4th finger',
};

interface ScaleControlsProps {
  rootNote: string;
  rootPc: number;
  position: ScalePosition;
}

export function ScaleControls({ rootNote, rootPc, position }: ScaleControlsProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const updateParams = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams || undefined);
    for (const [k, v] of Object.entries(changes)) {
      if (v === null) next.delete(k);
      else next.set(k, v);
    }
    const qs = next.toString();
    replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const validFingers = getValidFingersForString(position.rootString, rootPc);

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-6">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium" htmlFor="key-select">
          Key
        </label>
        <select
          id="key-select"
          value={rootNote}
          onChange={(e) => updateParams({ key: e.target.value })}
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
          onChange={(e) => updateParams({ string: e.target.value, position: null })}
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
        <label className="text-sm font-medium" htmlFor="position-select">
          Position
        </label>
        <select
          id="position-select"
          value={position.rootFinger}
          onChange={(e) => updateParams({ position: e.target.value })}
          className="text-sm"
        >
          {validFingers.map((f) => (
            <option key={f} value={f}>
              {FINGER_LABELS[f]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
