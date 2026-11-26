'use client';
import { useEffect, useId, useState } from 'react';
import { ScalesNav } from './ScalesNav';
import { SectionLabel } from '@/components/SectionLabel';
import ChevronRightIcon from '@/svgs/chevron-right.svg';
import type { ScaleSystem } from '@/modules/scale/data/systems';

const DESKTOP_QUERY = '(min-width: 1024px)';

// Show/hide toggle around ScalesNav, on every screen size: open by default
// from lg up, closed below that (on a phone it opens inline above the page). The
// server can't know the viewport, so until hydration CSS picks the default,
// then state takes over from the same starting point — no flash either way.
export function ScalesNavSidebar({ systems }: { systems: ScaleSystem[] }) {
  const [open, setOpen] = useState<boolean | null>(null);
  const navId = useId();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync to the viewport after hydration, see above
    setOpen(window.matchMedia(DESKTOP_QUERY).matches);
  }, []);

  const navVisibility =
    open === null ? 'hidden lg:block' : open ? 'block' : 'hidden';
  // Points left (collapse) while open, right (expand) while closed.
  const chevronRotation =
    open === null ? 'lg:rotate-180' : open ? 'rotate-180' : '';
  const label = open === false ? 'Show scales menu' : 'Hide scales menu';

  return (
    <aside
      className={`flex shrink-0 flex-col gap-3 ${open === null ? 'md:w-7 lg:w-44' : open ? 'md:w-44' : 'md:w-7'}`}
    >
      <div className="flex items-center justify-between gap-2">
        <SectionLabel className={navVisibility}>Scale Systems</SectionLabel>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-controls={navId}
          aria-expanded={open ?? undefined}
          aria-label={label}
          title={label}
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-fg-secondary hover:bg-surface-sunken hover:text-fg"
        >
          <ChevronRightIcon
            width={16}
            height={16}
            aria-hidden="true"
            className={chevronRotation}
          />
        </button>
      </div>
      <div id={navId} className={navVisibility}>
        <ScalesNav systems={systems} />
      </div>
    </aside>
  );
}
