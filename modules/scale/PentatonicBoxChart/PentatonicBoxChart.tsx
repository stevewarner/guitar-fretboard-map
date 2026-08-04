import { STANDARD_TUNING_PC, INTERVAL_LABELS } from '@/app/utils/constants';
import {
  circRad,
  stroke,
  topSpace,
  strHeight,
  fontSize,
  svgDimension,
} from '@/components/FretboardChart/constants';

// Horizontal fret width matches the vertical chart's fret height spacing.
// String spacing matches the vertical chart's string spacing.
const FRET_W = topSpace;
const NUM_STRINGS = 6;
const PAD = circRad * 2;

// Scale factor that makes this chart visually identical to the vertical FretboardChart
// rendered inside its `w-64` (256px) container.
const VERT_SCALE = 256 / svgDimension;

// Offsets from root fret on the anchor string. Index 0 = low E, 5 = high e.
// String 6 (anchor = low E):
//   Minor: [R], [m3,P4,P5], [m7,R], [m3,P4,P5], [m7,R], [m3,P4,P5]
//   Major: [R,M2,M3], [P5,M6], [R,M2,M3], [P5,M6], [R,M2,M3], [P5,M6,R]
// String 5 (anchor = A string, low E is empty):
//   Minor: [], [R], [m3,P4,P5], [m7,R], [m3,P4,P5], [m7,R]
//   Major: [], [R,M2,M3], [P5,M6], [R,M2,M3], [P5,M6], [M2,M3]
// (B string offsets shift +1 vs pattern due to G–B being 4 semitones, not 5)
const MINOR_S6 = [[0], [-2, 0, 2], [0, 2], [0, 2, 4], [3, 5], [3, 5, 7]];
const MINOR_S5 = [[], [0], [-2, 0, 2], [0, 2], [1, 3, 5], [3, 5]];
const MAJOR_S6 = [
  [0, 2, 4],
  [2, 4],
  [2, 4, 6],
  [4, 6],
  [5, 7, 9],
  [7, 9, 12],
];
const MAJOR_S5 = [[], [0, 2, 4], [2, 4], [2, 4, 6], [5, 7], [7, 9]];

function getOffsets(isMajor: boolean, rootString: number) {
  const s5 = rootString === 5;
  return isMajor ? (s5 ? MAJOR_S5 : MAJOR_S6) : s5 ? MINOR_S5 : MINOR_S6;
}

function getRootFret(
  rootPc: number,
  anchorIdx: number,
  minOffset: number,
): number {
  const raw = (rootPc - STANDARD_TUNING_PC[anchorIdx] + 12) % 12 || 12;
  return raw + minOffset < 1 ? raw + 12 : raw;
}

type Props = { rootPc: number; modeIntervals: number[]; rootString?: number };

export function PentatonicBoxChart({
  rootPc,
  modeIntervals,
  rootString = 6,
}: Props) {
  const isMajor = !modeIntervals.includes(3);
  const offsets = getOffsets(isMajor, rootString);

  const anchorIdx = rootString === 5 ? 1 : 0;
  const allOffsets = offsets.flat();
  const minOffset = allOffsets.length > 0 ? Math.min(...allOffsets) : 0;

  const rf = getRootFret(rootPc, anchorIdx, minOffset);
  const tab = offsets.map((row) => row.map((o) => rf + o));

  const allFrets = tab.flat();
  const startFret = Math.min(...allFrets);
  const endFret = Math.max(...allFrets);
  const numFrets = endFret - startFret + 1;

  const boardWidth = FRET_W * numFrets;
  const boardHeight = strHeight * (NUM_STRINGS - 1); // = fbHeight = 64
  const svgWidth = PAD + boardWidth + PAD;
  const svgHeight = PAD + boardHeight + PAD + fontSize + 4;

  const dotX = (fret: number) => PAD + FRET_W * (fret - startFret) + FRET_W / 2;
  // si 0 = low E = bottom, si 5 = high e = top
  const dotY = (si: number) => PAD + strHeight * (NUM_STRINGS - 1 - si);

  const isRoot = (si: number, fret: number) =>
    (STANDARD_TUNING_PC[si] + fret) % 12 === rootPc;
  const intervalLabel = (si: number, fret: number) =>
    INTERVAL_LABELS[(STANDARD_TUNING_PC[si] + fret - rootPc + 12) % 12];

  return (
    <div
      className="mt-6"
      style={{ maxWidth: `${Math.round(svgWidth * VERT_SCALE)}px` }}
    >
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full"
        strokeWidth={stroke}
        role="img"
        aria-label={`Pentatonic diagonal pattern, frets ${startFret}–${endFret}`}
      >
        {/* strings */}
        {Array.from({ length: NUM_STRINGS }, (_, i) => (
          <line
            key={`s-${i}`}
            x1={PAD}
            y1={dotY(i)}
            x2={PAD + boardWidth}
            y2={dotY(i)}
            stroke="black"
          />
        ))}
        {/* frets */}
        {Array.from({ length: numFrets + 1 }, (_, i) => (
          <line
            key={`f-${i}`}
            x1={PAD + FRET_W * i}
            y1={PAD}
            x2={PAD + FRET_W * i}
            y2={PAD + boardHeight}
            stroke="black"
          />
        ))}
        {/* dots */}
        {tab.map((frets, si) =>
          frets.map((fret) => {
            const cx = dotX(fret);
            const cy = dotY(si);
            const root = isRoot(si, fret);
            return (
              <g key={`${si}-${fret}`}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={circRad}
                  fill={root ? '#cc2200' : '#000'}
                  stroke="#000"
                  strokeWidth={stroke}
                />
                <text
                  x={cx}
                  y={cy + circRad / 3}
                  textAnchor="middle"
                  fontFamily="Arial"
                  fontSize={circRad * 1.3}
                  fill="white"
                >
                  {intervalLabel(si, fret)}
                </text>
              </g>
            );
          }),
        )}
        {/* fret position label */}
        <text
          x={PAD + FRET_W / 2}
          y={PAD + boardHeight + fontSize + 4}
          textAnchor="middle"
          fontFamily="Arial"
          fontSize={fontSize * 0.75}
          fill="#555"
        >
          {startFret}fr
        </text>
      </svg>
    </div>
  );
}
