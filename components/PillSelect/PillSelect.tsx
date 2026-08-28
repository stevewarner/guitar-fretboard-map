import { forwardRef } from 'react';
import ChevronDownIcon from '@/svgs/chevron-down.svg';

type Props = React.SelectHTMLAttributes<HTMLSelectElement>;

// Shared pill-shaped chrome for every root/string/position `<select>` in the
// app (RootSelect, PositionControls' string + position selects). Wraps a
// real native <select> — no aria/keyboard behavior changes, just the visual
// language: rounded-full surface, custom chevron instead of the browser
// default arrow.
export const PillSelect = forwardRef<HTMLSelectElement, Props>(
  function PillSelect({ className = '', ...props }, ref) {
    return (
      <div className="relative inline-flex items-center">
        <select
          ref={ref}
          // border-gray-500 (~4.8:1 against white) rather than bg-surface-raised
          // alone — the raised surface is only ~1:1 against a white page, so
          // without a border this control has no perceivable boundary until
          // hovered or focused (WCAG 1.4.11 Non-text Contrast).
          className={`appearance-none rounded-full border border-gray-500 bg-surface-raised py-1.5 pl-3 pr-8 text-sm font-medium hover:bg-surface-sunken focus:outline-none focus:ring-2 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
          {...props}
        />
        <ChevronDownIcon
          width={10}
          height={10}
          aria-hidden="true"
          className="pointer-events-none absolute right-3 text-fg-muted"
        />
      </div>
    );
  },
);
