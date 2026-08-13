import { LessonHeader } from '@/modules/lesson/LessonHeader';
import { buildLessonMetadata } from '@/modules/lesson/buildLessonMetadata';
import { HandPositionExplorer } from './HandPositionExplorer';

export const metadata = buildLessonMetadata(
  'learning-the-fretboard',
  'hand-positions',
);

export default function HandPositionsLesson() {
  return (
    <>
      <LessonHeader
        partSlug="learning-the-fretboard"
        lessonSlug="hand-positions"
      />

      <h2>Defining a position</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          A position is defined by two things: root string and finger on the
          root
        </li>
        <li>
          Root string: which string carries the root note (6th, 5th, or 4th)
        </li>
        <li>
          Finger on the root: which left-hand finger lands on that fret, a
          stretch (0) or fingers 1 through 4
        </li>
        <li>
          That&apos;s up to 15 positions per scale (3 root strings times 5
          finger options). Try all of them below
        </li>
      </ul>
      <HandPositionExplorer />

      <h2>Rules</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Don&apos;t stretch when you don&apos;t have to</li>
        <li>Don&apos;t use the same finger twice on the same string</li>
      </ul>

      <h2>Notes</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Root string and finger on the root are the same two numbers every
          chord and scale diagram on this site is built from. This page is the
          complete map, not just the 5 positions shown elsewhere
        </li>
        <li>
          Position Playing, next, uses this same model to line up a chord shape
          and a scale shape in the same hand position
        </li>
      </ul>

      <h2>Why not CAGED</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          The CAGED system is a common way to name scale positions, but it has
          two problems: it misses several practical positions, and its shape
          names (C, A, G, E, D) don&apos;t map cleanly to a programmatic or
          root-agnostic system
        </li>
        <li>
          Major Chord Shapes covered the same idea from the chord side. This is
          the scale-position version of that same decision
        </li>
      </ul>
    </>
  );
}
