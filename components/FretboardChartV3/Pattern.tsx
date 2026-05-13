import { strHeight, topSpace, stroke, circRad } from './constants';
import { TabProp } from '@/types';

interface PatternProps {
  tab: TabProp;
  intervals?: ((string | number | undefined)[] | (string | number)[][]) | null;
  fillColor: string;
  startFret?: number;
}

export const Pattern = ({
  tab = [],
  intervals = [],
  fillColor,
  startFret = 1,
}: PatternProps) => {
  const calcFret = (fretKey: number) =>
    fretKey === 0
      ? topSpace / 2 + stroke / 2
      : topSpace / 2 + stroke / 2 + topSpace * (fretKey - startFret + 1);

  return (
    <>
      {tab.map((string, stringIndex) => {
        const cx = topSpace + stroke / 2 + strHeight * stringIndex;

        if (!Array.isArray(string)) {
          if (string === undefined) return null;

          if (string === 'x') {
            const y = topSpace / 2 + stroke / 2;
            const r = circRad / 1.8;
            return (
              <g key={`${stringIndex}-x`}>
                <line x1={cx + r} y1={y - r} x2={cx - r} y2={y + r} stroke="#000" strokeWidth={stroke} />
                <line x1={cx - r} y1={y - r} x2={cx + r} y2={y + r} stroke="#000" strokeWidth={stroke} />
              </g>
            );
          }

          const fretNum = Number(string);
          const cy = calcFret(fretNum || 0);
          const isOpen = fretNum === 0;
          return (
            <g key={`${stringIndex}-${string}`} data-test={`string-${stringIndex}`}>
              <circle
                cx={cx}
                cy={cy}
                r={circRad}
                fill={isOpen ? 'none' : fillColor}
                stroke="#000"
                strokeWidth={stroke}
              />
              {intervals && intervals.length > 0 && intervals[stringIndex] && (
                <text
                  x={cx}
                  y={cy + circRad / 3}
                  fontFamily="Arial"
                  fontSize={circRad}
                  textAnchor="middle"
                  fill={isOpen ? '#000' : '#fff'}
                >
                  {intervals[stringIndex]}
                </text>
              )}
            </g>
          );
        }

        // nested array (scale diagrams)
        return string.map((fret, fretIndex) => {
          const cy = topSpace / 2 + stroke / 2 + topSpace * Number(fret);
          const isOpen = fret === 0;
          return (
            <g key={`${stringIndex}-${fretIndex}`} data-test={`string-${stringIndex}`}>
              <circle
                cx={cx}
                cy={cy}
                r={isOpen ? circRad / 1.5 : circRad}
                fill={isOpen ? '#fff' : fillColor}
                stroke="#000"
                strokeWidth={stroke}
              />
              {intervals && intervals.length > 0 && intervals[stringIndex] && (
                <text
                  x={cx}
                  y={cy + circRad / 3}
                  fontFamily="Arial"
                  fontSize={circRad}
                  textAnchor="middle"
                  fill={isOpen ? '#000' : '#fff'}
                >
                  {Array.isArray(intervals[stringIndex])
                    ? (intervals[stringIndex] as (string | number)[])[fretIndex]
                    : intervals[stringIndex]}
                </text>
              )}
            </g>
          );
        });
      })}
    </>
  );
};
