import Link from 'next/link';
import { LessonHeader } from '@/modules/lesson/LessonHeader';
import { buildLessonMetadata } from '@/modules/lesson/buildLessonMetadata';
import {
  RootPickerCharts,
  type RootPickerChartSpec,
} from '@/components/FretboardChart';

export const metadata = buildLessonMetadata('foundations', 'triads');

// Manual triad shapes — just the 3 triad tones, no doubled notes. Root on the
// 6th string (1st finger); the 3rd and 5th both fall on the 5th string. Frets
// are relative to the root fret (0 = root fret).
const TRIAD_POSITION = { rootString: 6 as const, rootFinger: 1 as const };
const MAJOR_TRIAD_TAB_RELATIVE = [[0], [-1, 2], [], [], [], []];
const MAJOR_TRIAD_INTERVALS = [[1], [3, 5], [], [], [], []];
const MINOR_TRIAD_TAB_RELATIVE = [[0], [-2, 2], [], [], [], []];
const MINOR_TRIAD_INTERVALS = [[1], ['b3', 5], [], [], [], []];

const TRIAD_CHARTS: RootPickerChartSpec[] = [
  {
    label: 'Major',
    titleSuffix: 'major triad, 6th string root',
    source: {
      kind: 'relativeShape',
      tabRelative: MAJOR_TRIAD_TAB_RELATIVE,
      intervalLabels: MAJOR_TRIAD_INTERVALS,
      ...TRIAD_POSITION,
    },
  },
  {
    label: 'Minor',
    titleSuffix: 'minor triad, 6th string root',
    source: {
      kind: 'relativeShape',
      tabRelative: MINOR_TRIAD_TAB_RELATIVE,
      intervalLabels: MINOR_TRIAD_INTERVALS,
      ...TRIAD_POSITION,
    },
  },
];

export default function TriadsLesson() {
  return (
    <>
      <LessonHeader partSlug="foundations" lessonSlug="triads" />

      <h2>Building a triad</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>A triad is built from 3 of the 7 scale intervals: 1, 3, 5</li>
        <li>
          Major triad: 1 3 5, the chord shape you already know as a{' '}
          <Link href="/chord/maj" className="underline hover:text-fg">
            major chord
          </Link>
        </li>
        <li>
          Minor triad: 1 b3 5, the{' '}
          <Link href="/chord/m" className="underline hover:text-fg">
            minor chord
          </Link>{' '}
          shape. One note different (the b3 instead of 3) produces the darker
          sound
        </li>
        <li>
          Major and minor sound different because of a single half-step on the
          3rd
        </li>
        <li>
          Those chord shapes are just these same intervals, arranged in specific
          positions on the fretboard
        </li>
      </ul>
      <RootPickerCharts
        defaultRoot="G"
        charts={TRIAD_CHARTS}
        chartClassName="w-56"
        caption="{root} major and {root} minor triads, just the 3 triad tones, no repeats: root on the 6th string, the 3rd and 5th both on the 5th string."
      />

      <h2>Naming chords by role</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Roman numerals name a chord by its role in a key rather than its note
          name
        </li>
        <li>
          I is used for a major chord, ii for a minor chord built on the 2nd
          degree
        </li>
      </ul>
    </>
  );
}
