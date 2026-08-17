import type { ElementType, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  // 'muted' — page breadcrumbs ("Chords / Major 7th") and section labels
  // ("Intervals", "Inversions"). 'accent' — the homepage showcase labels.
  tone?: 'muted' | 'accent';
  // Renders as a heading (section labels like "Intervals"/"Inversions" are
  // real h2s, just styled small) or a plain paragraph (breadcrumbs aren't
  // headings). Defaults to 'p'.
  as?: ElementType;
  className?: string;
}

const TONE_CLASSES: Record<NonNullable<Props['tone']>, string> = {
  muted: 'text-fg-muted',
  accent: 'text-accent',
};

// Small-caps label used throughout the redesigned pages — page breadcrumbs,
// section headings ("Intervals", "Notes", "Inversions", ...), and the
// homepage showcase labels. Content stays natural-case in the DOM;
// `uppercase` is a CSS transform only, so screen readers/SEO see the real
// string ("Chords / Major 7th") while it displays as "CHORDS / MAJOR 7TH".
export function SectionLabel({
  children,
  tone = 'muted',
  as: Tag = 'p',
  className = '',
}: Props) {
  return (
    <Tag
      className={`text-xs font-semibold uppercase tracking-wide ${TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </Tag>
  );
}
