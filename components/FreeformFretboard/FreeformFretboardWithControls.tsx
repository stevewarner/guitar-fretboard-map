'use client';
import { useState } from 'react';
import { FreeformFretboard } from './FreeformFretboard';
import ResetIcon from '@/svgs/reset.svg';

const MIN_FRETS = 4;
const MAX_FRETS = 24;

interface FreeformFretboardWithControlsProps {
  tab: (number | undefined)[];
  onTabChange: (tab: (number | undefined)[]) => void;
  onClear: () => void;
}

export const FreeformFretboardWithControls = ({
  tab,
  onTabChange,
  onClear,
}: FreeformFretboardWithControlsProps) => {
  const [numFrets, setNumFrets] = useState(MIN_FRETS);
  // Grow numFrets to fit the tab as notes get added — derived from `tab`
  // during render (React's recommended pattern for adjusting state in
  // response to a prop change) rather than an effect, which would cause an
  // extra cascading render.
  const [prevTab, setPrevTab] = useState(tab);
  if (tab !== prevTab) {
    setPrevTab(tab);
    const maxFret = Math.max(
      0,
      ...tab.filter((v): v is number => v !== undefined),
    );
    if (maxFret > 0) {
      setNumFrets((n) => Math.min(Math.max(n, maxFret), MAX_FRETS));
    }
  }

  const hasNotes = tab.some((v) => v !== undefined);

  const handleToggle = (si: number, fret: number) => {
    const next = [...tab];
    next[si] = tab[si] === fret ? undefined : fret;
    onTabChange(next);
  };

  const handleClear = () => {
    setNumFrets(MIN_FRETS);
    onClear();
  };

  return (
    <div className="flex items-start">
      <div className="min-w-0 flex-1">
        <FreeformFretboard
          tab={tab}
          numFrets={numFrets}
          onToggle={handleToggle}
        />
      </div>
      <div className="flex shrink-0 flex-col items-center gap-3 pt-2">
        {hasNotes && (
          <button
            type="button"
            onClick={handleClear}
            className="flex size-8 items-center justify-center rounded border border-current text-fg-secondary hover:bg-surface-sunken hover:text-fg"
            aria-label="Reset"
            title="Reset"
          >
            <ResetIcon aria-hidden="true" height={16} width={16} />
          </button>
        )}
        <div className="flex flex-col rounded border border-current">
          <button
            type="button"
            onClick={() => setNumFrets((n) => n - 1)}
            disabled={numFrets <= MIN_FRETS}
            className="flex size-8 items-center justify-center rounded-t border-b border-current text-sm hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Remove fret"
            title="Remove fret"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => setNumFrets((n) => n + 1)}
            disabled={numFrets >= MAX_FRETS}
            className="flex size-8 items-center justify-center rounded-b text-sm hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Add fret"
            title="Add fret"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};
