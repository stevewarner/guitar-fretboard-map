import Link from 'next/link';
import { LessonHeader } from '@/modules/lesson/LessonHeader';
import { buildLessonMetadata } from '@/modules/lesson/buildLessonMetadata';
import { ScalePositionsSection } from './ScalePositionsSection';

export const metadata = buildLessonMetadata(
  'learning-the-fretboard',
  'scale-positions-full-neck',
);

export default function ScalePositionsFullNeckLesson() {
  return (
    <>
      <LessonHeader
        partSlug="learning-the-fretboard"
        lessonSlug="scale-positions-full-neck"
      />

      <h2>Mapping the whole neck</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          The major scale can be played in 5 positions across the neck: same
          notes, same fingering logic, just anchored to a different fret each
          time
        </li>
        <li>
          The 5 positions below are spread evenly from the open end of the neck
          up past the 12th fret. Connecting them removes the gaps between
          separate, disconnected &ldquo;boxes&rdquo;
        </li>
        <li>
          The result reads as one continuous map of the scale, not 5 unrelated
          shapes to memorize separately
        </li>
      </ul>
      <ScalePositionsSection />

      <h2>Notes</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Being stuck in one 4-fret box is exactly the problem these 5 positions
          solve: every area of the neck has a scale shape ready to use
        </li>
        <li>
          This is the same root-string-plus-root-finger system already used for
          chord positions and for the{' '}
          <Link
            href="/scale/pentatonic/major"
            className="underline hover:text-fg"
          >
            pentatonic scale
          </Link>
          , one system applied to every shape on the site
        </li>
        <li>
          Position Playing, later in this part, layers a chord shape directly on
          top of each of these positions
        </li>
      </ul>
    </>
  );
}
