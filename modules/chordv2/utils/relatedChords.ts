export type QualityMeta = {
  id: number;
  symbol: string;
  full_name: string;
  intervals: number[];
};

// Reusable across relationship tiers (e.g. "1 note different" vs a looser
// "2 notes different" section) — parameterized by maxDifference rather than
// hardcoding it per caller.
//
// `referenceIntervals` should be the ACTUALLY-PLAYED intervals of the chord
// being compared from, not necessarily a quality's full theoretical interval
// list. A specific curated shape can omit a chord tone its quality formally
// requires (e.g. a maj9#11 voicing that drops the 3rd) — comparing against
// the raw quality.intervals would overstate the difference by however many
// notes that voicing omits.
export function findQualitiesWithinNoteDifference(
  referenceIntervals: number[],
  candidateQualities: QualityMeta[],
  excludeSymbol: string,
  maxDifference: number,
): QualityMeta[] {
  const referencePcs = new Set(referenceIntervals.map((i) => i % 12));

  return candidateQualities.filter((q) => {
    if (q.symbol === excludeSymbol) return false;
    const qPcs = new Set(q.intervals.map((i) => i % 12));
    const onlyInReference = referenceIntervals.filter(
      (i) => !qPcs.has(i % 12),
    ).length;
    const onlyInCandidate = q.intervals.filter(
      (i) => !referencePcs.has(i % 12),
    ).length;
    return (
      onlyInReference <= maxDifference &&
      onlyInCandidate <= maxDifference &&
      onlyInReference + onlyInCandidate >= 1
    );
  });
}
