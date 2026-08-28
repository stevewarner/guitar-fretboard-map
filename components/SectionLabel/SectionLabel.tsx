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

// 'muted' uses fg-secondary, not fg-muted — fg-muted (#9ca3af) is only
// ~2.5:1 against the page's white/near-white backgrounds, well under the
// 4.5:1 WCAG AA requires for text this small (12px), and this component
// renders real breadcrumb and <h2> section-heading text, not decoration.
const TONE_CLASSES: Record<NonNullable<Props['tone']>, string> = {
  muted: 'text-fg-secondary',
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
