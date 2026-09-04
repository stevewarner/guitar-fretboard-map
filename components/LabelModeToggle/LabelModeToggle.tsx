'use client';
import { useLabelMode } from './LabelModeContext';

// Opt-in note-name labeling for the chord/scale detail diagrams — off by
// default (interval degrees). Must render within a LabelModeProvider (see
// that file). Same UI shape as RootHighlightToggle, an independent toggle:
// note names and root highlighting can both be on at once.
export function LabelModeToggle() {
  const [showNoteNames, setShowNoteNames] = useLabelMode();

  return (
    <label className="flex items-center gap-2 text-sm text-fg-secondary">
      <input
        type="checkbox"
        checked={showNoteNames}
        onChange={(e) => setShowNoteNames(e.target.checked)}
        className="size-4 rounded border-gray-500 accent-accent"
      />
      Show note names
    </label>
  );
}
