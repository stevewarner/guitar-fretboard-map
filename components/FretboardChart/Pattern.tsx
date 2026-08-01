import { strHeight, topSpace, stroke, circRad } from './constants';
import { TabProp } from '@/types';
import { getContrastColor } from '@/app/utils';

interface PatternProps {
  tab: TabProp;
  intervals?: ((string | number | undefined)[] | (string | number)[][]) | null;
  fillColor: string;
  fillOpen?: boolean;
  startFret?: number;
}

export const Pattern = ({
  tab = [],
  intervals = [],
  fillColor,
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
          fontSize={circRad}
          textAnchor="middle"
          fill={textFill(isOpen)}
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
