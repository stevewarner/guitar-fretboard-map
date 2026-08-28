'use client';
import { useRootHighlight } from './RootHighlightContext';

// Opt-in root highlighting for the chord/scale detail diagrams — off by
// default, which is what keeps docs/STYLE_GUIDE.md's "no root highlighting
// on library pages" rule intact: that rule is about the default treatment,
// not a ban on ever coloring the root. Same shape of exception the guide
// already carves out for Fretboard Playground's user-chosen highlight
// color. Must render within a RootHighlightProvider (see that file).
export function RootHighlightToggle() {
  const [checked, setChecked] = useRootHighlight();

  return (
    <label className="flex items-center gap-2 text-sm text-fg-secondary">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        className="size-4 rounded border-gray-500 accent-accent"
      />
      Highlight root
    </label>
  );
}
