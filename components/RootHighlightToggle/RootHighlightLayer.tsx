'use client';
import type { ReactNode } from 'react';
import { useRootHighlight } from './RootHighlightContext';

// Wraps the extra accent-colored Pattern layer that highlights the root —
// the diagram-side counterpart to RootHighlightToggle's checkbox. `children`
// is server-rendered (it's a <Pattern>, computed from plain props with no
// context dependency) and passed in as an already-built subtree; this
// component only ever decides whether to show it, never how to render it.
// Must render within a RootHighlightProvider.
export function RootHighlightLayer({ children }: { children: ReactNode }) {
  const [checked] = useRootHighlight();
  return checked ? <>{children}</> : null;
}
