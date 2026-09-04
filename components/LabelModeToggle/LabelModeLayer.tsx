'use client';
import type { ReactNode } from 'react';
import { useLabelMode } from './LabelModeContext';

// Picks between two pre-built label variants of the same diagram content —
// the diagram-side counterpart to LabelModeToggle's checkbox. Both
// `intervalContent` and `noteContent` are server-rendered (each an already-
// built <Pattern>, computed from plain props with no context dependency);
// this component only ever decides which one to show, never how to render
// either. Must render within a LabelModeProvider.
interface Props {
  intervalContent: ReactNode;
  noteContent: ReactNode;
}

export function LabelModeLayer({ intervalContent, noteContent }: Props) {
  const [showNoteNames] = useLabelMode();
  return <>{showNoteNames ? noteContent : intervalContent}</>;
}
