import { useContext } from 'react';
import { FretboardContext } from './contexts';

// <Fretboard numFrets={4}>
// <Pattern tab={['x', 3, 2, 0, 1, 0]} />
// tab={[[2,4], [1,2,4], [1,3,4]]}
// </Fretboard>

type Props = {
  tab: (string | number)[];
  fillColor: string;
};

const Pattern = ({ tab = [], fillColor }: Props) => {
  const { fretWidth, strHeight, stroke, topSpace, circRad, showOpenNotes } =
    useContext(FretboardContext);

  return (
    <>
      {tab
        .slice(0) // need to make a copy of arr before reverse otherwise each render will reverse
        .reverse()
        .map((fret, index) =>
          !Array.isArray(fret) ? (
            typeof fret === 'string' ? (
              <svg key={`${index}-${fret}`}>
                <line
                  x1={fretWidth / 2 + stroke / 2 - circRad / 1.8}
                  y1={topSpace + strHeight * index + circRad / 1.8}
                  x2={fretWidth / 2 + stroke / 2 + circRad / 1.8}
                  y2={topSpace + strHeight * index - circRad / 1.8}
                  stroke="#000"
                  strokeWidth={stroke}
                />
                <line
                  x1={fretWidth / 2 + stroke / 2 - circRad / 1.8}
                  y1={topSpace + strHeight * index - circRad / 1.8}
                  x2={fretWidth / 2 + stroke / 2 + circRad / 1.8}
                  y2={topSpace + strHeight * index + circRad / 1.8}
                  stroke="#000"
                  strokeWidth={stroke}
                />
              </svg>
            ) : (
              <circle
                key={`${index}-${fret}`}
                // fret
                cx={fretWidth / 2 + stroke / 2 + fretWidth * fret}
                // string
                cy={topSpace + strHeight * index}
                r={fret === 0 && showOpenNotes ? circRad / 1.5 : circRad}
                fill={fret === 0 && showOpenNotes ? '#fff' : fillColor}
                stroke="#000"
                strokeWidth={stroke}
              />
            )
          ) : (
            // TODO handle nested array
            console.log('array')
          )
        )}

      {/* <circle
        cx={fretWidth / 2 + stroke / 2 + fretWidth}
        cy={topSpace + strHeight * 5}
        r={circRad}
        fill="blue"
        stroke="#000"
        strokeWidth={stroke}
      />
      <circle
        cx={fretWidth / 2 + stroke / 2 + fretWidth * 3}
        cy={topSpace + strHeight * 5}
        r={circRad}
        fill="red"
        stroke="#000"
        strokeWidth={stroke}
      />
      <circle
        cx={fretWidth / 2 + stroke / 2}
        cy={topSpace + strHeight * 4}
        r={circRad}
        fill="red"
        stroke="#000"
        strokeWidth={stroke}
      />
      <circle
        cx={fretWidth / 2 + stroke / 2 + fretWidth}
        cy={topSpace + strHeight * 4}
        r={circRad}
        fill="red"
        stroke="#000"
        strokeWidth={stroke}
      />
      <circle
        cx={fretWidth / 2 + stroke / 2 + fretWidth * 3}
        cy={topSpace + strHeight * 4}
        r={circRad}
        fill="red"
        stroke="#000"
        strokeWidth={stroke}
      />
      <circle
        cx={fretWidth / 2 + stroke / 2}
        cy={topSpace + strHeight * 3}
        r={circRad}
        fill="red"
        stroke="#000"
        strokeWidth={stroke}
      />
      <circle
        cx={fretWidth / 2 + stroke / 2 + fretWidth * 2}
        cy={topSpace + strHeight * 3}
        r={circRad}
        fill="red"
        stroke="#000"
        strokeWidth={stroke}
      /> */}
    </>
  );
};

export default Pattern;
