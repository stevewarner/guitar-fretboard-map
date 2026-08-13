import { LessonHeader } from '@/modules/lesson/LessonHeader';
import { buildLessonMetadata } from '@/modules/lesson/buildLessonMetadata';
import { getShapesBySymbols } from '@/modules/chordv2/db/queries';
import {
  ChordPositionsSection,
  type PositionSpec,
} from '@/components/FretboardChart';

export const metadata = buildLessonMetadata(
  'learning-the-fretboard',
  'chord-shapes',
);

const QUALITY = 'maj';
const DEFAULT_ROOT = 'G';
// (rootString, rootFinger) pairs to show — same chord, five places on the
// neck.
const POSITIONS: { label: string; rootString: number; rootFinger: number }[] = [
  { label: '6th String, 3rd Finger', rootString: 6, rootFinger: 3 },
  { label: '6th String, 1st Finger', rootString: 6, rootFinger: 1 },
  { label: '4th String, 1st Finger', rootString: 4, rootFinger: 1 },
  { label: '5th String, 4th Finger', rootString: 5, rootFinger: 4 },
  { label: '5th String, 1st Finger', rootString: 5, rootFinger: 1 },
];

export default async function ChordShapesLesson() {
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
        lessonSlug="chord-shapes"
      />

      <h2>Same chord, different position</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          The same chord exists in multiple positions across the neck: same
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

      <h2>Notes</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          The same chord can be played in many different spots on the fretboard
        </li>
        <li>
          Root string and root finger, not shape nicknames, is the labeling
          system used across every chord and scale diagram on this site: the
          same two numbers in the URL address every position of every chord
        </li>
        <li>
          Hand Positions, later in the course, turns this into a complete map of
          every position on the neck
        </li>
      </ul>

      <h2>What about CAGED?</h2>
      <p>
        Some guitarists know this idea by a different name: the{' '}
        <strong>CAGED system</strong>. It takes 5 open chord shapes almost every
        guitarist already knows (open C, A, G, E, and D) and treats each one as
        a moveable template. Barre the open C shape at a different fret,
        fretting what used to be open strings, and it becomes the same chord
        somewhere else on the neck. The same works for the other four shapes.
      </p>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Those 5 shapes repeat in that same order (C, A, G, E, D, back to C) as
          you move up the neck, which is a genuinely useful pattern to notice
          once you know it&rsquo;s there
        </li>
        <li>
          This site doesn&rsquo;t name positions after CAGED&rsquo;s 5 letters,
          though. Positions here are labeled by root string and root finger
          instead, like &ldquo;5th string, 4th finger.&rdquo; That system covers
          more positions than 5 shape names and doesn&rsquo;t require memorizing
          which open chord each one came from first
        </li>
      </ul>
    </>
  );
}
