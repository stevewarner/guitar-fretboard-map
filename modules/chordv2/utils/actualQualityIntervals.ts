import { getMissingIntervalPcs } from './droppedIntervals';
import { isShapeValidForRoot } from './shapeValidity';
import {
  getShapesForRelated,
  type DbChordQuality,
  type DbChordShape,
} from '@/modules/chordv2/db/queries';

export interface QualityWithActualIntervals {
  quality: DbChordQuality;
  intervals: number[]; // actually-played, drop-aware
  shape: DbChordShape | null; // representative shape on this string; null if none
}

// For every quality, find a representative shape on the given root string
// (preferring one at preferredFinger, falling back to any) and reduce its
// theoretical intervals down to what that specific shape actually plays - a
// curated voicing can omit a chord tone the quality formally requires (e.g.
// a maj9#11 shape that drops the 3rd), and comparing raw quality.intervals
// would overstate how different (or alike) two chords really are. Used by
// RelatedChords (interval-difference comparison), which deliberately stays
// scoped to one string - a related chord is meant to be playable nearby, in
// the same hand region, so the "same string" constraint is the point.
//
// Candidate shapes are filtered to ones valid at rootPc (moveable, or fixed
// with a matching root_pc) before picking a representative - otherwise a
// quality whose only shape on this string is fixed to a different root
// (e.g. mMaj9's one shape, hardcoded to E) would get silently transposed
// there anyway, same bug class already fixed in ModeChords.tsx and
// chordid/actions.ts (and below, in getQualityShapeCandidates).
export async function getQualitiesWithActualIntervals(
  allQualities: DbChordQuality[],
  rootString: number,
  preferredFinger: number,
  rootPc: number,
): Promise<QualityWithActualIntervals[]> {
  const shapesOnString = (
    await getShapesForRelated(
      allQualities.map((q) => q.id),
      rootString,
    )
  ).filter((s) => isShapeValidForRoot(s, rootPc));
  const shapeFor = (qualityId: number): DbChordShape | null =>
    shapesOnString.find(
      (s) => s.quality_id === qualityId && s.root_finger === preferredFinger,
    ) ??
    shapesOnString.find((s) => s.quality_id === qualityId) ??
    null;

  return allQualities.map((quality) => {
    const shape = shapeFor(quality.id);
    if (!shape) return { quality, intervals: quality.intervals, shape: null };
    const missing = getMissingIntervalPcs(
      shape.tab_relative,
      shape.root_string,
      shape.root_finger ?? 0,
      rootPc,
      quality.intervals,
    );
    return {
      quality,
      intervals: quality.intervals.filter((i) => !missing.has(i % 12)),
      shape,
    };
  });
}

function actualIntervalsFor(
  shape: DbChordShape,
  quality: DbChordQuality,
  rootPc: number,
): number[] {
  const missing = getMissingIntervalPcs(
    shape.tab_relative,
    shape.root_string,
    shape.root_finger ?? 0,
    rootPc,
    quality.intervals,
  );
  return quality.intervals.filter((i) => !missing.has(i % 12));
}

export interface QualityShapeCandidate {
  quality: DbChordQuality;
  intervals: number[]; // actually-played, drop-aware, for THIS shape
  shape: DbChordShape;
}

// Same idea as getQualitiesWithActualIntervals, but for a relationship where
// "which string is this on" doesn't matter the way it does for Related
// Chords, and where collapsing each quality down to a single representative
// shape is wrong rather than just imprecise: SameNotesChords is an exact
// note-set match, and two shapes of the *same* quality can actually play
// different note sets (one shape drops a tone the quality formally
// requires, another plays it in full) - those two sets can each coincide
// with a DIFFERENT other quality's notes. Keeping only a "cleanest" shape
// per quality would silently hide a real match that only the dropped-note
// shape produces. Returns one candidate per (quality, shape) pair across
// every string in rootStrings, so the caller can check all of them.
//
// Candidates are filtered to shapes valid at rootPc for the same reason as
// getQualitiesWithActualIntervals above: a fixed shape hardcoded to a
// different root (e.g. mMaj9's shape at root_pc=E) would otherwise have its
// "actual intervals" computed as if it sat at an arbitrary root, and if
// that bogus interval set happened to match another quality's real notes,
// the caller would transpose a shape that was never meant to move there.
export async function getQualityShapeCandidates(
  allQualities: DbChordQuality[],
  rootStrings: number[],
  rootPc: number,
): Promise<QualityShapeCandidate[]> {
  const qualityById = new Map(allQualities.map((q) => [q.id, q]));
  const shapesByString = await Promise.all(
    rootStrings.map((rs) =>
      getShapesForRelated(
        allQualities.map((q) => q.id),
        rs,
      ),
    ),
  );

  return shapesByString
    .flat()
    .filter((shape) => isShapeValidForRoot(shape, rootPc))
    .map((shape) => {
      const quality = qualityById.get(shape.quality_id)!;
      return {
        quality,
        intervals: actualIntervalsFor(shape, quality, rootPc),
        shape,
      };
    });
}
