'use client';
import { useEffect, useId } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { STANDARD_TUNING_PC } from '@/app/utils/constants';
import { RootSelect } from '@/components/RootSelect';
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

function fingerLabel(
  finger: number,
  rootString: RootString,
  rootPc: number,
  zeroOverride?: 'open' | 'stretch',
): string {
  if (finger === 0) {
    if (zeroOverride)
      return zeroOverride === 'open' ? 'open' : FINGER_LABELS[0];
    const openPc = STANDARD_TUNING_PC[6 - rootString];
    if ((rootPc - openPc + 12) % 12 === 0) return 'open';
  }
  return FINGER_LABELS[finger];
}

interface PositionControlsProps {
  rootNote: string;
  rootPc: number;
  position: ScalePosition;
  // Root strings with no matching shape data for the current context —
  // rendered as disabled options rather than omitted, so the control's shape
  // stays stable as root/quality changes.
  disabledStrings?: number[];
  // Finger values that are geometrically valid but have no matching shape data
  // for the current root+string — rendered as disabled options rather than
  // omitted, so the control's shape stays stable as filters change.
  disabledFingers?: number[];
  // Overrides the finger-0 label regardless of the geometric open-string check.
  // Callers with real shape data (list and detail pages) know whether finger 0
  // actually means "open" or "stretch" for what's being shown; when omitted,
  // falls back to the geometric check (used by scale positions).
  fingerZeroLabel?: 'open' | 'stretch';
  // When true, each control offers an "Any" option (empty = no filter). Used by
  // the chord list to browse all qualities until a position is chosen.
  allowAny?: boolean;
}

export function PositionControls({
  rootNote,
  rootPc,
  position,
  disabledStrings,
  disabledFingers,
  fingerZeroLabel,
  allowAny,
}: PositionControlsProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const liveUpdateHintId = useId();
  const positionDisabledHintId = useId();

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

  // In allowAny mode the selects mirror the raw params so an absent param shows
  // as "Any" rather than the resolved default.
  const rawRoot = searchParams?.get('root') ?? '';
  const rawString = searchParams?.get('string') ?? '';
  const rawPosition = searchParams?.get('position') ?? '';

  // Intentionally scoped to position.rootFinger only — this syncs the URL to
  // a recomputed effective finger (e.g. after a fallback elsewhere resolves
  // an invalid one). Including searchParams/updateParams would refire on
  // every navigation, including the one this effect itself causes, and risk
  // a loop; allowAny is read once per render via the early return, not
  // something this effect needs to react to.
  useEffect(() => {
    if (allowAny) return;
    const urlPosition = searchParams?.get('position');
    if (urlPosition !== null && urlPosition !== String(position.rootFinger)) {
      updateParams({ position: String(position.rootFinger) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position.rootFinger]);

  return (
    <fieldset className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-0 p-0">
      <legend className="sr-only">Position</legend>
      <p id={liveUpdateHintId} className="sr-only">
        Changing these selections updates the diagram immediately.
      </p>
      <RootSelect
        id="key-select"
        value={allowAny ? rawRoot : rootNote}
        onChange={(value) =>
          updateParams({
            root: value || null,
            // A different root can invalidate the current position (e.g. a
            // fixed open-chord finger only matches its own root) — reset it
            // rather than leave a now-disabled option selected.
            ...(allowAny ? { position: null } : {}),
          })
        }
        describedBy={liveUpdateHintId}
        extraOption={allowAny ? { value: '', label: 'Any key' } : undefined}
      />

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium" htmlFor="string-select">
          String
        </label>
        <select
          id="string-select"
          value={allowAny ? rawString : position.rootString}
          onChange={(e) =>
            updateParams({ string: e.target.value || null, position: null })
          }
          aria-describedby={liveUpdateHintId}
          className="text-sm"
        >
          {allowAny && <option value="">Any string</option>}
          {ROOT_STRINGS.map((s) => (
            <option key={s} value={s} disabled={disabledStrings?.includes(s)}>
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
          value={allowAny ? rawPosition : position.rootFinger}
          onChange={(e) => updateParams({ position: e.target.value || null })}
          disabled={allowAny && !rawString}
          aria-describedby={
            allowAny && !rawString
              ? `${liveUpdateHintId} ${positionDisabledHintId}`
              : liveUpdateHintId
          }
          className="text-sm"
        >
          {allowAny && <option value="">Any position</option>}
          {validFingers.map((f) => (
            <option key={f} value={f} disabled={disabledFingers?.includes(f)}>
              {fingerLabel(
                f,
                position.rootString,
                rootPc,
                f === 0 ? fingerZeroLabel : undefined,
              )}
            </option>
          ))}
        </select>
        {allowAny && !rawString && (
          <p id={positionDisabledHintId} className="sr-only">
            Choose a string first.
          </p>
        )}
      </div>
    </fieldset>
  );
}
