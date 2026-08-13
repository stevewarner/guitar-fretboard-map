import { LessonHeader } from '@/modules/lesson/LessonHeader';
import { buildLessonMetadata } from '@/modules/lesson/buildLessonMetadata';
import { RelativeVsParallelExplorer } from './RelativeVsParallelExplorer';

export const metadata = buildLessonMetadata(
  'understanding-modes',
  'relative-vs-parallel-modes',
);

export default function RelativeVsParallelModesLesson() {
  return (
    <>
      <LessonHeader
        partSlug="understanding-modes"
        lessonSlug="relative-vs-parallel-modes"
      />

      <h2>Two ways to compare modes</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Relative: same notes, different starting point, for example C Ionian
          and A Aeolian
        </li>
        <li>
          Parallel: same root, different formula, for example C Ionian and C
          Dorian
        </li>
        <li>
          The relative relationship matters for composition: a melody in one
          mode already fits chords built from its relative
        </li>
        <li>
          The parallel relationship matters for improvisation. Swapping formula
          over the same root is what modal interchange (later in this part) is
          built from
        </li>
      </ul>
      <RelativeVsParallelExplorer />

      <h2>Notes</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Relative shares the fretboard shape and just moves where the root
          falls. That&rsquo;s the exact relationship Relative Major and Minor
          covered already, now just named with its mode terms
        </li>
        <li>
          Parallel keeps the root fixed and changes the shape. This is the
          relationship Comparing Modes, next, uses to walk the full
          brightest-to-darkest spectrum from one root
        </li>
      </ul>
    </>
  );
}
