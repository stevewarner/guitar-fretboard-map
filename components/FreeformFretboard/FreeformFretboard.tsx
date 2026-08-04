'use client';
import { useRef, useState } from 'react';
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
  const svgRef = useRef<SVGSVGElement>(null);
  // Roving tabindex: only one position is a Tab stop at a time; arrow keys
  // move focus between adjacent strings/frets so completing a chord doesn't
  // require tabbing through every one of the ~150 individual positions.
  const [focused, setFocused] = useState({ si: 0, fret: 0 });
  const safeFocused = {
    si: Math.min(Math.max(focused.si, 0), numStrings - 1),
    fret: Math.min(Math.max(focused.fret, 0), numFrets),
  };

  const focusPosition = (si: number, fret: number) => {
    setFocused({ si, fret });
    svgRef.current
      ?.querySelector<HTMLElement>(`[data-si="${si}"][data-fret="${fret}"]`)
      ?.focus();
  };

  const handleArrowNav = (e: React.KeyboardEvent, si: number, fret: number) => {
    switch (e.key) {
      case 'ArrowLeft':
        if (si > 0) {
          e.preventDefault();
          focusPosition(si - 1, fret);
        }
        return;
      case 'ArrowRight':
        if (si < numStrings - 1) {
          e.preventDefault();
          focusPosition(si + 1, fret);
        }
        return;
      case 'ArrowUp':
        if (fret > 0) {
          e.preventDefault();
          focusPosition(si, fret - 1);
        }
        return;
      case 'ArrowDown':
        if (fret < numFrets) {
          e.preventDefault();
          focusPosition(si, fret + 1);
        }
        return;
      default:
        return;
    }
  };

  const renderPosition = (si: number, fret: number) => {
    const isActive = tab[si] === fret;
    const cx = stringX(si);
    const y = fret === 0 ? 0 : topSpace * fret;
    const cy = dotY(fret);
    const noteName = PC_TO_NOTE[(STANDARD_TUNING_PC[si] + fret) % 12];
    const fretLabel = fret === 0 ? 'open' : `fret ${fret}`;
    const label = isActive
      ? `String ${6 - si}, ${fretLabel}, ${noteName}`
      : `String ${6 - si}, ${fretLabel}`;

    return (
      <g
        key={`pos-${si}-${fret}`}
        data-si={si}
        data-fret={fret}
        role="button"
        tabIndex={safeFocused.si === si && safeFocused.fret === fret ? 0 : -1}
        aria-label={label}
        aria-pressed={isActive}
        className="cursor-pointer rounded-sm outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-blue-500 focus-visible:[outline-offset:-1px]"
        onFocus={() => setFocused({ si, fret })}
        onClick={() => onToggle(si, fret)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle(si, fret);
            return;
          }
          handleArrowNav(e, si, fret);
        }}
      >
        <rect
          x={cx - strHeight / 2}
          y={y}
          width={strHeight}
          height={topSpace}
          fill="transparent"
        />
        {isActive && (
          <>
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
          </>
        )}
      </g>
    );
  };

  return (
    <svg
      ref={svgRef}
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

      {/* positions — one focusable control per string/fret, showing either
          an empty click target or the active note dot */}
      {Array.from({ length: numStrings }, (_, si) => renderPosition(si, 0))}
      {Array.from({ length: numFrets }, (_, i) => i + 1).flatMap((fret) =>
        Array.from({ length: numStrings }, (_, si) => renderPosition(si, fret)),
      )}
    </svg>
  );
};
