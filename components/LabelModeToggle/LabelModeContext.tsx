'use client';
import { createContext, useContext, useState, type ReactNode } from 'react';

type ContextValue = [boolean, (next: boolean) => void];

const LabelModeContext = createContext<ContextValue | null>(null);

// Local, per-page-view state — not synced to the URL. Same reasoning as
// RootHighlightContext (components/RootHighlightToggle): a display
// preference ("show me note names instead of interval numbers while I
// look"), not something worth making shareable/bookmarkable. Off by
// default — interval degrees are this site's default labeling, root-
// agnostic and the whole point of the position system (docs/AUDIENCE.md,
// docs/STYLE_GUIDE.md) — resets on navigation to a different chord/scale.
export function LabelModeProvider({ children }: { children: ReactNode }) {
  const state = useState(false);
  return (
    <LabelModeContext.Provider value={state}>
      {children}
    </LabelModeContext.Provider>
  );
}

export function useLabelMode(): ContextValue {
  const ctx = useContext(LabelModeContext);
  if (!ctx) {
    throw new Error('useLabelMode must be used within a LabelModeProvider');
  }
  return ctx;
}
