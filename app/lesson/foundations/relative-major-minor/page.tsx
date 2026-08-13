import Link from 'next/link';
import { LessonHeader } from '@/modules/lesson/LessonHeader';
import { buildLessonMetadata } from '@/modules/lesson/buildLessonMetadata';
import { RelativeMajorMinorExplorer } from './RelativeMajorMinorExplorer';

export const metadata = buildLessonMetadata(
  'foundations',
  'relative-major-minor',
);

export default function RelativeMajorMinorLesson() {
  return (
    <>
      <LessonHeader partSlug="foundations" lessonSlug="relative-major-minor" />

      <h2>Same notes, different starting point</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Every major scale shares its 7 notes with a relative minor scale, just
          a different starting point
        </li>
        <li>
          The relative minor starts on the 6th degree: C major and A minor use
          the exact same 7 notes (C D E F G A B)
        </li>
        <li>
          Nothing on the fretboard moves: pick any major root below and its
          relative minor is calculated automatically
        </li>
      </ul>
      <RelativeMajorMinorExplorer />

      <h2>Finding the relative minor</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Count up to the 6th degree of any major scale to land on its relative
          minor root: the 6th degree of C major is A
        </li>
        <li>
          Same distance either way: the relative minor root is always a minor
          3rd (3 semitones) below the major root, and the relative major root is
          always a minor 3rd above the minor root
        </li>
        <li>
          The{' '}
          <Link
            href="/scale/pentatonic/minor"
            className="underline hover:text-fg"
          >
            minor pentatonic
          </Link>{' '}
          shape you already know is the relative minor of the major key at that
          same position: same fretboard material, viewed from its other root
        </li>
      </ul>

      <h2>Notes</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Knowing one key means automatically knowing its relative minor: no new
          notes to learn, just a different note to call home
        </li>
        <li>
          A minor-key song shares its key signature with its relative major,
          which is why chord charts and key signatures for minor songs are
          usually written and reasoned about through the major key instead
        </li>
        <li>
          This is also why the minor pentatonic shape most guitarists learn
          first already contains a major pentatonic shape hiding inside it, a
          minor 3rd away
        </li>
      </ul>
    </>
  );
}
