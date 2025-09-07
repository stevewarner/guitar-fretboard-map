import { strHeight, topSpace, stroke, circRad } from './constants';
// <Fretboard numFrets={4}>
// <Pattern tab={['x', 3, 2, 0, 1, 0]} />
// tab={[[2,4], [1,2,4], [1,3,4]]}
// </Fretboard>

interface PatternProps {
  tab: (string | number)[]; // | (string | number)[][]; // nested
  intervals?: (string | number | undefined)[]; // | (string | number)[][];
  fillColor: string;
  startFret?: number;
}

export const Pattern = ({
  tab = [],
  intervals = [],
  fillColor,
  startFret = 1,
}: PatternProps) => {
  const calcFret = (fretKey: number) => {
    if (fretKey === 0) {
      return topSpace / 2 + stroke / 2 + topSpace * Number(fretKey);
    } else {
      return (
        topSpace / 2 +
        stroke / 2 +
        topSpace * Number(fretKey) -
        topSpace * (startFret - 1)
      );
    }
  };

  return (
    <>
      {tab.map((string, stringIndex) =>
        // handle string value 'X'
        string === 'x' ? (
          <svg key={`${stringIndex}-${string}`}>
            {/* X svg 2 lines */}
            <line
              x1={topSpace + strHeight * stringIndex + circRad / 1.8}
              y1={topSpace / 2 + stroke / 2 - circRad / 1.8}
              x2={topSpace + strHeight * stringIndex - circRad / 1.8}
              y2={topSpace / 2 + stroke / 2 + circRad / 1.8}
              stroke="#000"
              strokeWidth={stroke}
            />
            <line
              x1={topSpace + strHeight * stringIndex - circRad / 1.8}
              y1={topSpace / 2 + stroke / 2 - circRad / 1.8}
              x2={topSpace + strHeight * stringIndex + circRad / 1.8}
              y2={topSpace / 2 + stroke / 2 + circRad / 1.8}
              stroke="#000"
              strokeWidth={stroke}
            />
          </svg>
        ) : (
          <g
            key={`${stringIndex}-${string}`}
            data-test={`string-${stringIndex}`}
          >
            <circle
              // string
              cx={topSpace + stroke / 2 + strHeight * stringIndex}
              // fret
              cy={calcFret(Number(string) || 0)}
              r={circRad}
              fill={Number(string) === 0 ? 'none' : fillColor}
              stroke="#000"
              strokeWidth={stroke}
            />
            {intervals.length > 0 && intervals[stringIndex] && (
              <text
                x={topSpace + stroke / 2 + strHeight * stringIndex}
                y={calcFret(Number(string) || 0) + circRad / 3}
                fontFamily="Arial"
                fontSize={circRad}
                textAnchor="middle"
                fill={Number(string) === 0 ? '#000' : '#fff'}
              >
                {intervals[stringIndex]}
              </text>
            )}
          </g>
        ),
      )}
    </>
  );
};
