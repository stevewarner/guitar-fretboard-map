import { LessonHeader } from '@/modules/lesson/LessonHeader';
import { buildLessonMetadata } from '@/modules/lesson/buildLessonMetadata';
import { PositionPlayingExplorer } from './PositionPlayingExplorer';

export const metadata = buildLessonMetadata(
  'learning-the-fretboard',
  'position-playing',
);

export default function PositionPlayingLesson() {
  return (
    <>
      <LessonHeader
        partSlug="learning-the-fretboard"
        lessonSlug="position-playing"
      />

      <h2>Chord inside the scale</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Every position has a chord shape embedded inside the scale pattern:
          the 1, 3, and 5 (or 1, 3, 5, and 7) are chord tones no matter what
          else is going on around them
        </li>
        <li>
          Same root string, same finger on the root, same position. The chord
          below isn&apos;t a different shape to learn, it&apos;s a subset of
          notes already inside the scale shape above it
        </li>
        <li>
          Seeing the chord inside the scale connects melody and harmony in the
          same area of the neck
        </li>
      </ul>
      <PositionPlayingExplorer />

      <h2>Notes</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Hand Positions, just before this, defined the position. This lesson is
          what that position is actually for: soloing and comping without moving
          your hand
        </li>
        <li>
          Extended Chords, up next, takes these same 1-3-5-7 chord tones
          further, adding the 9th, 11th, and 13th on top
        </li>
      </ul>
    </>
  );
}
