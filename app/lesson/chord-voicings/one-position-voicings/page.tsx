import { LessonHeader } from '@/modules/lesson/LessonHeader';
import { buildLessonMetadata } from '@/modules/lesson/buildLessonMetadata';
import {
  getShapesBySymbols,
  getInversionShapes,
  getQualityBySymbol,
} from '@/modules/chordv2/db/queries';
import {
  OnePositionVoicingsExplorer,
  type DegreeVoicing,
} from './OnePositionVoicingsExplorer';

export const metadata = buildLessonMetadata(
  'chord-voicings',
  'one-position-voicings',
);

// Each diatonic degree's voicing: quality, which string carries the bass
// note, which finger that string is browsed under, and which inversion (0 =
// root position). Feeds the merged, one-fretboard example: vi's plain
// root-position shape (string 6, 2nd finger) is a real, different position
// from the rest, kept as-is here on purpose.
const DEGREE_VOICINGS: Record<
  number,
  { quality: string; string: number; finger: number; inversion: number }
> = {
  1: { quality: 'maj7', string: 5, finger: 1, inversion: 0 },
  2: { quality: 'm7', string: 4, finger: 1, inversion: 1 },
  3: { quality: 'm7', string: 4, finger: 1, inversion: 0 },
  4: { quality: 'maj7', string: 4, finger: 1, inversion: 0 },
  5: { quality: '7', string: 6, finger: 1, inversion: 0 },
  6: { quality: 'm7', string: 6, finger: 2, inversion: 0 },
  7: { quality: 'm7b5', string: 5, finger: 1, inversion: 0 },
};

// vi, card-grid only: the 3rd inversion (b7 in bass) on the same string 4,
// 1st finger position as ii, iii, and IV, instead of the merged example's
// string-6 root position above. Same (string, finger) label as those 3, not
// just a nearby fret.
const CARD_VI_VOICING = { quality: 'm7', string: 4, finger: 1, inversion: 3 };

type VoicingSpec = {
  quality: string;
  string: number;
  finger: number;
  inversion: number;
};

export default async function OnePositionVoicingsLesson() {
  const qualities = Array.from(
    new Set(
      [...Object.values(DEGREE_VOICINGS), CARD_VI_VOICING].map(
        (v) => v.quality,
      ),
    ),
  );
  const strings = Array.from(
    new Set(
      [...Object.values(DEGREE_VOICINGS), CARD_VI_VOICING].map((v) => v.string),
    ),
  );

  const [rootPositionShapes, m7Inversions, qualityMetas] = await Promise.all([
    getShapesBySymbols(qualities, strings),
    getInversionShapes('m7', 4),
    Promise.all(qualities.map((q) => getQualityBySymbol(q))),
  ]);

  const qualityIntervals: Record<string, number[]> = Object.fromEntries(
    qualities.map((q, i) => [q, qualityMetas[i]?.intervals ?? [0]]),
  );

  const resolveVoicing = (v: VoicingSpec): DegreeVoicing => {
    const shape =
      v.inversion === 0
        ? rootPositionShapes.find(
            (s) =>
              s.quality_symbol === v.quality &&
              s.root_string === v.string &&
              s.root_finger === v.finger,
          )
        : m7Inversions.find((s) => s.inversion === v.inversion);
    return {
      quality: v.quality,
      inversion: v.inversion,
      bassString: shape?.bass_string ?? v.string,
      bassFinger: shape?.bass_finger ?? v.finger,
      tab: shape?.tab_relative ?? [],
    };
  };

  const voicings: Record<number, DegreeVoicing> = Object.fromEntries(
    Object.entries(DEGREE_VOICINGS).map(([degree, v]) => [
      Number(degree),
      resolveVoicing(v),
    ]),
  );
  const cardVoicings: Record<number, DegreeVoicing> = {
    ...voicings,
    6: resolveVoicing(CARD_VI_VOICING),
  };

  return (
    <>
      <LessonHeader
        partSlug="chord-voicings"
        lessonSlug="one-position-voicings"
      />

      <h2>Keeping a progression in one place</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Every chord shape learned so far can be played on more than one string
          set, or in more than one inversion. Picking the right one for each
          chord in a progression means the hand barely has to move
        </li>
        <li>
          I, IV, and V of a key each have a natural home: I on the 5th string,
          IV on the 4th string, V on the 6th string, all at the same finger.
          Those 3 string choices are not arbitrary. The 5th and 4th strings are
          tuned a fourth apart, the same interval as IV above I. The 6th and 5th
          strings are also a fourth apart, the same interval as I above V. That
          is why all 3 chords land on the same fret, in every key
        </li>
        <li>
          ii, iii, and vii round out the picture. None of them land on that
          exact same fret (a minor 7th chord&apos;s own shapes just do not line
          up as neatly), but each sits within a fret or 2, close enough that the
          hand still only has to shift slightly, not jump across the neck
        </li>
        <li>
          vi shares that same string 4, 1st finger position too, just using its
          3rd inversion (b7 in bass) instead of root position. Same hand
          position as ii, iii, and IV, not a special case
        </li>
      </ul>

      <OnePositionVoicingsExplorer
        defaultRoot="C"
        cardVoicings={cardVoicings}
        overlayVoicings={voicings}
        qualityIntervals={qualityIntervals}
      />

      <h2>Notes</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          ii here is not the plain root-position Dm7. It is the 1st inversion, F
          in the bass, which is what actually lands it next to the others. The
          root-position shape would sit several frets away
        </li>
        <li>
          vi is the same story: its 3rd inversion, G in the bass, not the plain
          root-position Am7
        </li>
        <li>
          The merged fretboard below still uses vi&apos;s plain root-position
          shape on the 6th string instead, a genuinely different position from
          the rest, kept as its own example rather than folded into the one
          above
        </li>
      </ul>
    </>
  );
}
