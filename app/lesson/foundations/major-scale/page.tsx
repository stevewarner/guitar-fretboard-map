import { LessonHeader } from '@/modules/lesson/LessonHeader';
import { buildLessonMetadata } from '@/modules/lesson/buildLessonMetadata';
import {
  RootPickerCharts,
  type RootPickerChartSpec,
} from '@/components/FretboardChart';
import { MAJOR_SCALE_INTERVALS } from '@/modules/scale/utils/scaleUtils';

export const metadata = buildLessonMetadata('foundations', 'major-scale');

const MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10]; // 1 2 b3 4 5 b6 b7
// Same box position as the pentatonic lesson's familiar pair — root on the 6th
// string, 2nd finger — so this reads as "the same shape, plus 2 new notes."
const BOX_POSITION = { rootString: 6 as const, rootFinger: 2 as const };

const SCALE_CHARTS: RootPickerChartSpec[] = [
  {
    label: 'Major',
    titleSuffix: 'major scale, 6th string root, box position',
    source: {
      kind: 'position',
      intervals: MAJOR_SCALE_INTERVALS,
      ...BOX_POSITION,
      highlightLabels: [4, 7],
    },
  },
  {
    label: 'Minor',
    titleSuffix: 'minor scale, 6th string root, box position',
    source: {
      kind: 'position',
      intervals: MINOR_SCALE_INTERVALS,
      ...BOX_POSITION,
      highlightLabels: ['2', 'b6'],
    },
  },
];

// One cell per semitone of the octave. A filled cell is a scale tone; a
// blank cell is the semitone the pattern steps over. Two adjacent filled
// cells (3-4, 7-1) means a half step; one blank between them (1-2, 2-3, 4-5,
// 5-6, 6-7) means a whole step, giving the major scale's WWHWWWH formula.
const WHOLE_HALF_STEP_CELLS = [
  '1',
  '',
  '2',
  '',
  '3',
  '4',
  '',
  '5',
  '',
  '6',
  '',
  '7',
];

function WholeHalfStepTable() {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-line">
      <table className="w-full min-w-max border-collapse text-sm">
        <tbody>
          <tr className="divide-x divide-line">
            {WHOLE_HALF_STEP_CELLS.map((cell, i) => (
              <td key={i} className="px-4 py-3 text-center font-mono">
                {cell}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function MajorScaleLesson() {
  return (
    <>
      <LessonHeader partSlug="foundations" lessonSlug="major-scale" />

      <h2>The major scale</h2>
      <p>
        The major scale is a 7 note scale built from a fixed pattern of whole
        and half steps: whole, whole, half, whole, whole, whole, half, usually
        written WWHWWWH. It is the basis of Western music, the lens the rest of
        music theory gets viewed and interpreted through. Concepts throughout
        this course, and in music theory generally, are named in relation to it.
      </p>
      <WholeHalfStepTable />

      <h2>Add the missing notes from pentatonic</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Add the 2 missing notes back into the pentatonic scale to get the full
          major or minor scale
        </li>
        <li>Major: the 4 and 7 are the notes pentatonic leaves out</li>
        <li>Minor: the 2 and b6</li>
        <li>
          The pentatonic shape is embedded inside the full scale shape, and the
          new notes are easy to spot
        </li>
      </ul>
      <RootPickerCharts
        defaultRoot="G"
        charts={SCALE_CHARTS}
        caption="{root} major and {root} minor scales, same box position as the pentatonic pair. The 2 new notes are highlighted in red."
      />
    </>
  );
}
