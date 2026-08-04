'use client';
import { STANDARD_TUNING_PC, PC_TO_NOTE } from '@/app/utils/constants';
import {
  fbHeight,
  strHeight,
  stroke,
  circRad,
  topSpace,
  numStrings,
  svgDimension,
} from '@/components/FretboardChart/constants';

const stringX = (si: number) => topSpace + stroke / 2 + strHeight * si;

const dotY = (fret: number) =>
  fret === 0
    ? topSpace / 2 + stroke / 2
    : topSpace * fret + topSpace / 2 + stroke / 2;

interface FreeformFretboardProps {
  tab: (number | undefined)[];
  numFrets: number;
  onToggle: (si: number, fret: number) => void;
}

export const FreeformFretboard = ({
  tab,
  numFrets,
  onToggle,
}: FreeformFretboardProps) => {
  return (
    <svg
      viewBox={`0 0 ${svgDimension} ${topSpace * (numFrets + 2)}`}
      strokeWidth={stroke}
      className="w-full"
      aria-label="Freeform chord builder"
    >
      {/* strings */}
      {Array.from({ length: numStrings }, (_, si) => (
        <line
          key={`s-${si}`}
          x1={stringX(si)}
          y1={topSpace}
          x2={stringX(si)}
          y2={topSpace * (numFrets + 1)}
          stroke="black"
        />
      ))}

      {/* frets — index 0 is the nut */}
      {Array.from({ length: numFrets + 1 }, (_, i) => (
        <line
          key={`fr-${i}`}
          x1={topSpace}
          y1={topSpace * (i + 1)}
          x2={fbHeight + stroke + topSpace}
          y2={topSpace * (i + 1)}
          stroke="black"
          strokeWidth={i === 0 ? stroke * 3 : stroke}
        />
      ))}

      {/* click targets — open position (above nut) */}
      {Array.from({ length: numStrings }, (_, si) => (
        <rect
          key={`cell-open-${si}`}
          x={stringX(si) - strHeight / 2}
          y={0}
          width={strHeight}
          height={topSpace}
          fill="transparent"
          className="rounded-sm outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-blue-500 focus-visible:[outline-offset:-1px]"
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          aria-label={`String ${6 - si}, open`}
          aria-pressed={tab[si] === 0}
          onClick={() => onToggle(si, 0)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onToggle(si, 0);
            }
          }}
        />
      ))}

      {/* click targets — fretted positions */}
      {Array.from({ length: numFrets }, (_, i) => {
        const fret = i + 1;
        return Array.from({ length: numStrings }, (_, si) => (
          <rect
            key={`cell-${si}-${fret}`}
            x={stringX(si) - strHeight / 2}
            y={topSpace * fret}
            width={strHeight}
            height={topSpace}
            fill="transparent"
            className="rounded-sm outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-blue-500 focus-visible:[outline-offset:-1px]"
            style={{ cursor: 'pointer' }}
            role="button"
            tabIndex={0}
            aria-label={`String ${6 - si}, fret ${fret}`}
            aria-pressed={tab[si] === fret}
            onClick={() => onToggle(si, fret)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggle(si, fret);
              }
            }}
          />
        ));
      })}

      {/* dots */}
      {tab.map((fret, si) => {
        if (fret === undefined) return null;
        const cx = stringX(si);
        const cy = dotY(fret);
        const noteName = PC_TO_NOTE[(STANDARD_TUNING_PC[si] + fret) % 12];
        return (
          <g
            key={`dot-${si}`}
            onClick={() => onToggle(si, fret)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggle(si, fret);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Remove: string ${6 - si}, fret ${fret}`}
            className="rounded-sm outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-blue-500 focus-visible:[outline-offset:-1px]"
            style={{ cursor: 'pointer' }}
          >
            <circle
              cx={cx}
              cy={cy}
              r={circRad}
              fill="#000"
              stroke="#000"
              strokeWidth={stroke}
            />
            <text
              x={cx}
              y={cy + circRad / 3}
              fontFamily="Arial"
              fontSize={circRad}
              textAnchor="middle"
              fill="white"
            >
              {noteName}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
