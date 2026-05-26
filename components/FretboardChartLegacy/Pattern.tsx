import { useContext } from 'react';
import { FretboardContext } from './contexts';
import { TabProp } from '@/types';

type Props = {
  tab: TabProp;
  fillColor: string;
  startFret?: number;
};

export const Pattern = ({ tab = [], fillColor, startFret = 1 }: Props) => {
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
        !Array.isArray(string) ? (
          string === 'x' ? (
            <svg key={`${stringIndex}-${string}`}>
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
              cx={calcFret(Number(string))}
              cy={topSpace + strHeight * stringIndex}
              r={string === 0 && showOpenNotes ? circRad / 1.5 : circRad}
              fill={Number(string) === 0 && showOpenNotes ? 'none' : fillColor}
              stroke="#000"
              strokeWidth={stroke}
            />
          )
        ) : (
          string.map((fret, fretIndex) => (
            <circle
              key={`${fretIndex}-${string}`}
              cx={fretWidth / 2 + stroke / 2 + fretWidth * Number(fret)}
              cy={topSpace + strHeight * stringIndex}
              r={fret === 0 && showOpenNotes ? circRad / 1.5 : circRad}
              fill={fret === 0 && showOpenNotes ? '#fff' : fillColor}
              stroke="#000"
              strokeWidth={stroke}
            />
          ))
        ),
      )}
    </>
  );
};

