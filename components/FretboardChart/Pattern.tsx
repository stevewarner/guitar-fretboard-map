import { useContext } from 'react';
import { FretboardContext } from './contexts';

// <Fretboard numFrets={4}>
// <Pattern tab={['x', 3, 2, 0, 1, 0]} />
// tab={[[2,4], [1,2,4], [1,3,4]]}
// </Fretboard>

type Props = {
  tab: any[];
  fillColor: string;
  startFret?: number;
};

const Pattern = ({ tab = [], fillColor, startFret = 1 }: Props) => {
  const { fretWidth, strHeight, stroke, topSpace, circRad, showOpenNotes } =
    useContext(FretboardContext);

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
            <circle
              key={`${stringIndex}-${string}`}
              // fret
              cx={calcFret(Number(string))}
              // string
              cy={topSpace + strHeight * stringIndex}
              r={string === 0 && showOpenNotes ? circRad / 1.5 : circRad}
              fill={Number(string) === 0 && showOpenNotes ? 'none' : fillColor}
              stroke="#000"
              strokeWidth={stroke}
            />
          )
        ) : (
          // handle nested array
          string.map((fret, fretIndex) => {
            return (
              <circle
                key={`${fretIndex}-${string}`}
                // fret
                cx={fretWidth / 2 + stroke / 2 + fretWidth * fret}
                // string
                cy={topSpace + strHeight * stringIndex}
                r={fret === 0 && showOpenNotes ? circRad / 1.5 : circRad}
                fill={fret === 0 && showOpenNotes ? '#fff' : fillColor}
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

export default Pattern;
