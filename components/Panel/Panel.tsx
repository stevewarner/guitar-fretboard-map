interface Props {
  children: React.ReactNode;
  className?: string;
}

// The "raised" card shell used across the redesigned pages to group a
// control cluster + diagram (chord/scale detail controls, the chord ID
// input panel, the feedback form, the homepage hero's fretboard figure).
export function Panel({ children, className = '' }: Props) {
  return (
    <div className={`rounded-2xl bg-surface-raised p-6 ${className}`}>
      {children}
    </div>
  );
}
