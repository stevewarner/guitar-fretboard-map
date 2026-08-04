// WCAG relative luminance (https://www.w3.org/TR/WCAG21/#dfn-relative-luminance).
const getRelativeLuminance = (hex: string): number => {
  const [r, g, b] = [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ].map((c) => {
    const channel = c / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// WCAG contrast ratio (https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio).
export const getContrastRatio = (hexA: string, hexB: string): number => {
  const lA = getRelativeLuminance(hexA);
  const lB = getRelativeLuminance(hexB);
  const [lighter, darker] = lA > lB ? [lA, lB] : [lB, lA];
  return (lighter + 0.05) / (darker + 0.05);
};

// Picks whichever of black/white has the higher contrast ratio against the
// given fill color, rather than a naive perceived-brightness threshold that
// can pick the visually worse option for saturated mid-tone colors.
export const getContrastColor = (hex: string): '#000' | '#fff' => {
  const whiteRatio = getContrastRatio(hex, '#ffffff');
  const blackRatio = getContrastRatio(hex, '#000000');
  return whiteRatio > blackRatio ? '#fff' : '#000';
};

// True when neither black nor white text reaches the WCAG AA minimum
// (4.5:1) against the given fill color — callers should add a fallback
// (e.g. a contrasting text outline) in this case.
export const needsContrastFallback = (hex: string): boolean =>
  Math.max(getContrastRatio(hex, '#ffffff'), getContrastRatio(hex, '#000000')) <
  4.5;

export const getOrdinal = (n: number) => {
  let ord = 'th';

  if (n % 10 == 1 && n % 100 != 11) {
    ord = 'st';
  } else if (n % 10 == 2 && n % 100 != 12) {
    ord = 'nd';
  } else if (n % 10 == 3 && n % 100 != 13) {
    ord = 'rd';
  }

  return ord;
};
