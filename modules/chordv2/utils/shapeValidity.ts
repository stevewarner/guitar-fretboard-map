import type { DbChordShape } from '@/modules/chordv2/db/queries';

// A fixed (non-moveable) shape is hardcoded to one specific root - using it
// for a different root would transpose a shape whose frets were never meant
// to move, producing a nonsensical diagram. A moveable shape has no such
// restriction. Shared by every call site that needs to know whether a shape
// can legitimately represent a given root before transposing it - keeping
// this in one place means a new call site can't skip it by accident, unlike
// before when it was hand-copied into each file separately.
export function isShapeValidForRoot(
  shape: DbChordShape,
  rootPc: number,
): boolean {
  return shape.moveable || shape.root_pc === rootPc;
}
