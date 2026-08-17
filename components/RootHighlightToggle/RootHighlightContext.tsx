'use client';
import { createContext, useContext, useState, type ReactNode } from 'react';

type ContextValue = [boolean, (next: boolean) => void];

const RootHighlightContext = createContext<ContextValue | null>(null);

// Local, per-page-view state — not synced to the URL. This is a display
// preference ("show me the root in a different color while I look"), not
// something worth making shareable/bookmarkable like root/string/position.
// Off by default, resets on navigation to a different chord/scale, and
// (unlike a URL param) doesn't clutter every link on the page with an extra
// query string.
//
// The checkbox (RootHighlightToggle) and the diagram overlay it controls
// (RootHighlightLayer) render in different parts of a server-rendered page,
// so they share this one piece of client state via context rather than
// prop-drilling through server components that don't otherwise need it.
export function RootHighlightProvider({ children }: { children: ReactNode }) {
  const state = useState(false);
  return (
    <RootHighlightContext.Provider value={state}>
      {children}
    </RootHighlightContext.Provider>
  );
}

export function useRootHighlight(): ContextValue {
  const ctx = useContext(RootHighlightContext);
  if (!ctx) {
    throw new Error(
      'useRootHighlight must be used within a RootHighlightProvider',
    );
  }
  return ctx;
}
