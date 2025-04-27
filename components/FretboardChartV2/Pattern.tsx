import { strHeight, fretWidth, stroke, circRad, topSpace } from './constants';
// <Fretboard numFrets={4}>
// <Pattern tab={['x', 3, 2, 0, 1, 0]} />
// tab={[[2,4], [1,2,4], [1,3,4]]}
// </Fretboard>

interface PatternProps {
  tab: (string | number)[] | (string | number)[][];
  intervals?: (string | number | undefined)[];
  fillColor: string;
  startFret?: number;
}

export const Pattern = ({
  tab = [],
  intervals = [],
  fillColor,
  startFret = 1,
}: PatternProps) => {
  const revIntervals = intervals && [...intervals].reverse();

  const calcFret = (fretKey: number) => {
    if (fretKey === 0) {
      return fretWidth / 2 + stroke / 2 + fretWidth * Number(fretKey);
    } else {
      return (
        fretWidth / 2 +
        stroke / 2 +
        fretWidth * Number(fretKey) -
        fretWidth * (startFret - 1)
      );
    }
  };

  return (
    <>
      {[...tab].reverse().map((string, stringIndex) =>
        // string is not a nested array
        !Array.isArray(string) ? (
          // handle string value 'X'
          string === 'x' ? (
            <svg key={`${stringIndex}-${string}`}>
              {/* X svg 2 lines */}
              <line
                x1={fretWidth / 2 + stroke / 2 - circRad / 1.8}
                y1={topSpace + strHeight * stringIndex + circRad / 1.8}
                x2={fretWidth / 2 + stroke / 2 + circRad / 1.8}
                y2={topSpace + strHeight * stringIndex - circRad / 1.8}
                stroke="#000"
                strokeWidth={stroke}
              />
              <line
                x1={fretWidth / 2 + stroke / 2 - circRad / 1.8}
                y1={topSpace + strHeight * stringIndex - circRad / 1.8}
                x2={fretWidth / 2 + stroke / 2 + circRad / 1.8}
                y2={topSpace + strHeight * stringIndex + circRad / 1.8}
                stroke="#000"
                strokeWidth={stroke}
              />
            </svg>
          ) : (
            // circle with text
            <g
              key={`${stringIndex}-${string}`}
              data-test={`string-${stringIndex}`}
            >
              <circle
                // fret
                cx={calcFret(Number(string) || 0)}
                // string
                cy={topSpace + strHeight * stringIndex}
                r={string === '0' ? circRad / 1.5 : circRad}
                fill={Number(string) === 0 ? 'none' : fillColor}
                stroke="#000"
                strokeWidth={stroke}
              />
              {revIntervals &&
                revIntervals.length > 0 &&
                revIntervals[stringIndex] && (
                  <text
                    x={calcFret(Number(string) || 0)}
                    y={topSpace + strHeight * stringIndex + circRad / 4}
                    fontFamily="Arial"
                    fontSize={circRad}
                    textAnchor="middle"
                    fill={Number(string) === 0 ? '#000' : '#fff'}
                  >
                    {revIntervals[stringIndex]}
                  </text>
                )}
            </g>
          )
        ) : (
          // handle nested array
          string.map((fret, fretIndex) => {
            return (
              <circle
                key={`${fretIndex}-${string}`}
                // fret
                cx={fretWidth / 2 + stroke / 2 + fretWidth * Number(fret)}
                // string
                cy={topSpace + strHeight * stringIndex}
                r={fret === '0' ? circRad / 1.5 : circRad}
                fill={fret === '0' ? '#fff' : fillColor}
                stroke="#000"
                strokeWidth={stroke}
              />
            );
          })
        ),
      )}
    </>
  );
};
