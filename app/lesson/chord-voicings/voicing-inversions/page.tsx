import { LessonHeader } from '@/modules/lesson/LessonHeader';
import { buildLessonMetadata } from '@/modules/lesson/buildLessonMetadata';
import {
  getInversionShapes,
  getQualityBySymbol,
} from '@/modules/chordv2/db/queries';
import { VoicingInversionsExplorer } from './VoicingInversionsExplorer';

export const metadata = buildLessonMetadata(
  'chord-voicings',
  'voicing-inversions',
);

const QUALITY = 'maj7';
const CHORD_ROOT_STRING = 4;

export default async function VoicingInversionsLesson() {
  const [shapes, qualityMeta] = await Promise.all([
    getInversionShapes(QUALITY, CHORD_ROOT_STRING),
    getQualityBySymbol(QUALITY),
  ]);
  if (!qualityMeta) {
    throw new Error(`Missing chord_qualities row for ${QUALITY}`);
  }

  return (
    <>
      <LessonHeader partSlug="chord-voicings" lessonSlug="voicing-inversions" />

      <h2>Inverting the voicing</h2>
      {/* prettier-ignore */}
      <p>
        An <strong>inversion</strong>{' '}
        rearranges the notes of a chord to change
        what&apos;s in the bass, the lowest note, and what&apos;s in the melody,
        the highest note. The 1-5-7-3 voicing of a major 7 chord cycles through
        4 arrangements this way: each note moves up to the next interval,
        giving 4 distinct patterns, one for each tone taking a turn in the
        bass. Inversions can be used to
        introduce melody or bass movements while still playing the same chord.
      </p>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <strong>Root position:</strong> 1-5-7-3
        </li>
        <li>
          <strong>1st inversion:</strong> 3-7-1-5
        </li>
        <li>
          <strong>2nd inversion:</strong> 5-1-3-7
        </li>
        <li>
          <strong>3rd inversion:</strong> 7-3-5-1
        </li>
      </ul>

      <VoicingInversionsExplorer
        defaultRoot="E"
        quality={QUALITY}
        qualityIntervals={qualityMeta.intervals}
        shapes={shapes}
      />

      <h2>Notes</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          The chord is exactly the same chord in all 4 boxes above, Emaj7, just
          voiced with a different tone on the bottom
        </li>
        <li>
          Voicings in One Position, next, uses these same 4 inversions to keep a
          whole progression in one place on the neck
        </li>
      </ul>
    </>
  );
}
