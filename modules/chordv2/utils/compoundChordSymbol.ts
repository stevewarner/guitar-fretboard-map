// V1 chord URLs (and how most people guess a chord URL, e.g. following a
// link from Reddit) combine root note and quality into one path segment —
// "C#dim", "Cmaj7", "Bb13" — where V2 splits them into
// `/chord/{quality}?root={root}`. Given the raw combined segment and the set
// of real quality symbols, find the split that recovers both.
//
// Accidentals are matched greedily onto the root (checked longest prefix
// first) since that's how the compact chord name is actually built
// elsewhere (`${rootNote}${symbol}`), and it resolves the one genuine
// ambiguity in practice — "Bb13" reads as root "Bb" + quality "13"
// (Dominant 13th), not root "B" + quality "b13" (Dominant Flat 13th).
export function splitCompoundChordSymbol(
  raw: string,
  validSymbols: ReadonlySet<string>,
): { root: string; quality: string } | null {
  const letter = raw[0]?.toUpperCase();
  if (!letter || letter < 'A' || letter > 'G') return null;

  let accidentalEnd = 1;
  while (raw[accidentalEnd] === '#' || raw[accidentalEnd] === 'b') {
    accidentalEnd++;
  }

  for (let cut = accidentalEnd; cut >= 1; cut--) {
    const root = letter + raw.slice(1, cut);
    const quality = raw.slice(cut) || 'maj';
    if (validSymbols.has(quality)) return { root, quality };
  }
  return null;
}
