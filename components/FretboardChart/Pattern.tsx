import { strHeight, topSpace, stroke, circRad } from './constants';
import { TabProp } from '@/types';
import { getContrastColor, needsContrastFallback } from '@/app/utils';

interface PatternProps {
  tab: TabProp;
  intervals?: ((string | number | undefined)[] | (string | number)[][]) | null;
  fillColor?: string;
  fillOpen?: boolean;
  startFret?: number;
}

export const Pattern = ({
  tab = [],
  intervals = [],
  fillColor = '#000',
  fillOpen = false,
  startFret = 1,
}: PatternProps) => {
  const calcFret = (fretKey: number) =>
    fretKey === 0
      ? topSpace / 2 + stroke / 2
      : topSpace / 2 + stroke / 2 + topSpace * (fretKey - startFret + 1);

  const circleFill = (isOpen: boolean) =>
    isOpen && !fillOpen ? 'none' : fillColor;

  const textFill = (isOpen: boolean) =>
    isOpen && !fillOpen ? '#000' : getContrastColor(fillColor);

  // When the fill color is a mid-tone that can't reach 4.5:1 contrast with
  // either black or white text, add a thin opposite-color outline so the
  // label stays legible regardless (e.g. user-chosen colors in the
  // fretboard playground).
  const textOutline = (isOpen: boolean) => {
    if (isOpen && !fillOpen) return undefined;
    if (!needsContrastFallback(fillColor)) return undefined;
    return getContrastColor(fillColor) === '#fff' ? '#000' : '#fff';
  };

  const renderDot = (
    key: string,
    cx: number,
    cy: number,
    isOpen: boolean,
    stringIndex: number,
    label?: string | number,
  ) => (
    <g key={key} data-test={`string-${stringIndex}`}>
      <circle
        cx={cx}
        cy={cy}
        r={circRad}
        fill={circleFill(isOpen)}
        stroke="#000"
        strokeWidth={stroke}
      />
      {!!label && (
        <text
          x={cx}
          y={cy + circRad / 3}
          fontFamily="Arial"
          fontSize={circRad * 1.3}
          textAnchor="middle"
          fill={textFill(isOpen)}
          stroke={textOutline(isOpen)}
          strokeWidth={textOutline(isOpen) ? 0.4 : undefined}
          paintOrder="stroke"
        >
          {label}
        </text>
      )}
    </g>
  );

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
                <line
                  x1={cx + r}
                  y1={y - r}
                  x2={cx - r}
                  y2={y + r}
                  stroke="#000"
                  strokeWidth={stroke}
                />
                <line
                  x1={cx - r}
                  y1={y - r}
                  x2={cx + r}
                  y2={y + r}
                  stroke="#000"
                  strokeWidth={stroke}
                />
              </g>
            );
          }

          const fretNum = Number(string);
          const intervalVal = intervals?.[stringIndex];
          const label = Array.isArray(intervalVal)
            ? intervalVal[0]
            : intervalVal;
          return renderDot(
            `${stringIndex}-${string}`,
            cx,
            calcFret(fretNum || 0),
            fretNum === 0,
            stringIndex,
            label as string | number | undefined,
          );
        }

        return string.map((fret, fretIndex) => {
          const intervalVal = intervals?.[stringIndex];
          const label = Array.isArray(intervalVal)
            ? intervalVal[fretIndex]
            : intervalVal;
          return renderDot(
            `${stringIndex}-${fretIndex}`,
            cx,
            calcFret(Number(fret)),
            fret === 0,
            stringIndex,
            label as string | number | undefined,
          );
        });
      })}
    </>
  );
};
