import { getMissingIntervalPcs } from './droppedIntervals';
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
export async function getQualitiesWithActualIntervals(
  allQualities: DbChordQuality[],
  rootString: number,
  preferredFinger: number,
  rootPc: number,
): Promise<QualityWithActualIntervals[]> {
  const shapesOnString = await getShapesForRelated(
    allQualities.map((q) => q.id),
    rootString,
  );
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

// Same idea as getQualitiesWithActualIntervals, but for a relationship where
// "which string is this on" doesn't matter the way it does for Related
// Chords - SameNotesChords needs to know whether a quality has ANY complete
// (non-dropped) voicing, not just whatever happens to exist on the string
// currently on screen. Searches every string in rootStrings (in the given
// preference order, e.g. the current chord's own string first for locality
// when it works out) and every shape per quality, preferring the first
// complete match found; if a quality has no complete voicing anywhere,
// falls back to whichever shape drops the fewest notes rather than
// returning nothing.
export async function getQualitiesWithCleanestShape(
  allQualities: DbChordQuality[],
  rootStrings: number[],
  preferredFinger: number,
  rootPc: number,
): Promise<QualityWithActualIntervals[]> {
  const shapesByString = await Promise.all(
    rootStrings.map((rs) =>
      getShapesForRelated(
        allQualities.map((q) => q.id),
        rs,
      ),
    ),
  );

  return allQualities.map((quality) => {
    let best: { shape: DbChordShape; intervals: number[] } | null = null;

    outer: for (const shapesOnString of shapesByString) {
      const candidates = shapesOnString.filter(
        (s) => s.quality_id === quality.id,
      );
      const preferred = candidates.find(
        (s) => s.root_finger === preferredFinger,
      );
      const ordered = preferred
        ? [preferred, ...candidates.filter((s) => s !== preferred)]
        : candidates;

      for (const shape of ordered) {
        const intervals = actualIntervalsFor(shape, quality, rootPc);
        if (!best || intervals.length > best.intervals.length) {
          best = { shape, intervals };
        }
        if (intervals.length === quality.intervals.length) break outer;
      }
    }

    if (!best) return { quality, intervals: quality.intervals, shape: null };
    return { quality, intervals: best.intervals, shape: best.shape };
  });
}
