'use client';
import { useId } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export type InversionOption = {
  inversion: number;
  label: string;
};

interface Props {
  options: InversionOption[];
  selected: number;
}

// Only covers fixed (open-position) inversions — slash chords like C/G,
// discoverable purely from the root note. Moveable multi-string-set
// inversions (e.g. maj7's drop-2 cycle) stay on the existing Inversions
// card row, scoped by string as before.
export function InversionSelect({ options, selected }: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const hintId = useId();

  if (options.length <= 1) return null;

  const onChange = (value: string) => {
    const next = new URLSearchParams(searchParams || undefined);
    if (value === '0') next.delete('inversion');
    else next.set('inversion', value);
    const qs = next.toString();
    replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="mb-6 flex items-center gap-2">
      <label className="text-sm font-medium" htmlFor="inversion-select">
        Inversion
      </label>
      <select
        id="inversion-select"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={hintId}
        className="text-sm"
      >
        {options.map((o) => (
          <option key={o.inversion} value={o.inversion}>
            {o.label}
          </option>
        ))}
      </select>
      <p id={hintId} className="sr-only">
        Changing this selection updates the diagram immediately.
      </p>
    </div>
  );
}
