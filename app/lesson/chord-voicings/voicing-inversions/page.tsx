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
      <p>
        A 7th chord has 4 notes, so it has exactly 4 possible arrangements from
        the bottom up, one for each tone taking its turn as the lowest note.
        This lesson takes the 1-5-7-3 voicing from the last lesson and cycles
        through all 4 of them. The string set never changes (still the top 4
        strings, 4th through 1st) and the voicing&apos;s own shape never changes
        either. All that moves is which chord tone lands on the 4th string, and
        with it, which finger reaches for the bottom note.
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
