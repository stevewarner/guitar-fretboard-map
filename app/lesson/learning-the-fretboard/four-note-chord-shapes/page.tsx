import { LessonHeader } from '@/modules/lesson/LessonHeader';
import { buildLessonMetadata } from '@/modules/lesson/buildLessonMetadata';
import { getShapesBySymbols } from '@/modules/chordv2/db/queries';
import {
  ChordPositionsSection,
  type PositionSpec,
} from '@/components/FretboardChart';

export const metadata = buildLessonMetadata(
  'learning-the-fretboard',
  'four-note-chord-shapes',
);

const QUALITY = 'maj7';
// Same default root as the previous lesson (chord-shapes), on purpose —
// both lessons show the same key by default.
const DEFAULT_ROOT = 'G';
// (rootString, rootFinger) pairs to show — same chord, five places on the
// neck.
const POSITIONS: { label: string; rootString: number; rootFinger: number }[] = [
  { label: '6th String, 4th Finger', rootString: 6, rootFinger: 4 },
  { label: '4th String, 4th Finger', rootString: 4, rootFinger: 4 },
  { label: '4th String, 1st Finger', rootString: 4, rootFinger: 1 },
  { label: '5th String, 4th Finger', rootString: 5, rootFinger: 4 },
  { label: '5th String, 1st Finger', rootString: 5, rootFinger: 1 },
];

export default async function FourNoteChordShapesLesson() {
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
        lessonSlug="four-note-chord-shapes"
      />

      <h2>Four notes, same idea</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          The same positions system from the last lesson applies just as well to
          4-note voicings, not just triads
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
