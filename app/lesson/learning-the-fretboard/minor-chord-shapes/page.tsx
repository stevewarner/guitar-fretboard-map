import { LessonHeader } from '@/modules/lesson/LessonHeader';
import { buildLessonMetadata } from '@/modules/lesson/buildLessonMetadata';
import { getShapesBySymbols } from '@/modules/chordv2/db/queries';
import {
  ChordPositionsSection,
  type PositionSpec,
} from '@/components/FretboardChart';

export const metadata = buildLessonMetadata(
  'learning-the-fretboard',
  'minor-chord-shapes',
);

const QUALITY = 'm';
const DEFAULT_ROOT = 'G';
// (rootString, rootFinger) pairs to show — same chord, five places on the
// neck. Mirrors Major Chord Shapes' own 5 positions, with one substitution:
// the minor triad has no root_finger=3 shape on the 6th string, so that
// slot uses finger 4 instead, the other real moveable shape available
// there.
const POSITIONS: { label: string; rootString: number; rootFinger: number }[] = [
  { label: '6th String, 4th Finger', rootString: 6, rootFinger: 4 },
  { label: '6th String, 1st Finger', rootString: 6, rootFinger: 1 },
  { label: '4th String, 1st Finger', rootString: 4, rootFinger: 1 },
  { label: '5th String, 4th Finger', rootString: 5, rootFinger: 4 },
  { label: '5th String, 1st Finger', rootString: 5, rootFinger: 1 },
];

export default async function MinorChordShapesLesson() {
  const dbShapes = await getShapesBySymbols(
    [QUALITY],
    [...new Set(POSITIONS.map((p) => p.rootString))],
  );
  const positions: PositionSpec[] = POSITIONS.map((p) => {
    const shape = dbShapes.find(
      (s) => s.root_string === p.rootString && s.root_finger === p.rootFinger,
    );
    if (!shape) {
      throw new Error(
        `Missing ${QUALITY} chord_shapes at root_string=${p.rootString}, root_finger=${p.rootFinger}`,
      );
    }
    return { ...p, tab: shape.tab_relative };
  });

  return (
    <>
      <LessonHeader
        partSlug="learning-the-fretboard"
        lessonSlug="minor-chord-shapes"
      />

      <h2>Same chord, different position</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Same idea as Major Chord Shapes, applied to the minor triad instead:
          the same chord exists in multiple positions across the neck, same
          harmony, different voicing, different spot on the neck
        </li>
        <li>
          Each position is anchored to two things: which string carries the root
          note, and which finger lands on the root fret
        </li>
        <li>
          Finding the root in each shape is what makes it possible to move any
          chord to any key, in any position
        </li>
      </ul>
      <ChordPositionsSection
        quality={QUALITY}
        defaultRoot={DEFAULT_ROOT}
        positions={positions}
      />
    </>
  );
}
