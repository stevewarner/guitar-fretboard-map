interface Options {
  // 'raised' is the redesigned pages' bigger, gray-card treatment
  // (chord/scale library grids, inversion/related-chord rows, chord ID
  // matches) — 'plain' (default) is the border-only style pages still on
  // the old plain style use. Same pattern as Button/ButtonLink's
  // buttonClassName: one source of truth so ChordPreviewCard and
  // ScalePreviewCard (byte-for-byte identical here before this was
  // extracted) can't drift apart.
  variant?: 'plain' | 'raised';
  className?: string;
}

export function previewCardClassName({
  variant = 'plain',
  className = '',
}: Options) {
  const raised = variant === 'raised';
  return {
    link: `flex flex-col items-center gap-1 rounded px-3 py-2 ${raised ? 'rounded-xl bg-surface-raised py-4 hover:bg-surface-sunken' : 'border border-current hover:bg-surface-sunken'} ${className}`,
    label: raised
      ? 'text-center text-lg font-bold'
      : 'text-center text-xs font-medium',
    sublabel: `text-center text-fg-secondary ${raised ? 'text-sm' : 'text-xs'}`,
  };
}
