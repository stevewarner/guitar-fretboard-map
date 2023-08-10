import { useContext, useEffect, useState } from 'react';
import { FretboardContext } from './contexts';

// <Fretboard numFrets={4}>
// <Pattern tab={['x', 3, 2, 0, 1, 0]} />
// tab={[[2,4], [1,2,4], [1,3,4]]}
// </Fretboard>

type Props = {
  tab: any[];
  fillColor: string;
};

const lick = [
  '5-0', '5-2', '4-2', '4-4', '3-2', '3-4', '3-6', '2-4', 
  '2-6', '1-5', '1-7', '1-9', '0-7', '0-9', '0-12'
];

// comes from fb width divided by lick length (on line 35) originally 81.5
const factor = 50;
const salmon = '#ff6760';
const skyblue = '#6090ff';

const Pattern = ({ tab = [], fillColor }: Props) => {
  // const { fretWidth, strHeight, stroke, topSpace, circRad, showOpenNotes, scrollPos } =
  //   useContext(FretboardContext);

  const {state, dispatch} = useContext(FretboardContext);

  const { fretWidth, strHeight, stroke, topSpace, circRad, showOpenNotes, scrollPos } = 
    state;

  const [currNote, setCurrNote] = useState(0);

  const printNoteID = (event) => { 
    console.log(event.target.dataset.nid) 
    console.log(event.target.parentNode.width.baseVal.value);
  }

  const setFill = (fret, nid) => {
    return lick[currNote] === nid ? skyblue
         : lick.includes(nid) ? salmon
         : fret === 0 && showOpenNotes ? '#fff' 
         : fillColor;
  }

  const updateCurrNote = (position) => {
    let newCurrent = Math.floor(position / factor);
    if (position == 670) {
      newCurrent++;
    }
    setCurrNote(newCurrent);
  }


  useEffect(() => {
    updateCurrNote(scrollPos);
    console.log(scrollPos);
  }, [scrollPos])

  return (
    <>
      {tab
        .slice(0) // need to make a copy of arr before reverse otherwise each render will reverse
        .reverse()
        .map((string, stringIndex) =>
          // string is not a nested array
          !Array.isArray(string) ? (
            // handle string value 'X'
            typeof string === 'string' ? (
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
                // fret
                cx={fretWidth / 2 + stroke / 2 + fretWidth * string}
                // string
                cy={topSpace + strHeight * stringIndex}
                r={string === 0 && showOpenNotes ? circRad / 1.5 : circRad}
                fill={string === 0 && showOpenNotes ? '#fff' : fillColor}
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
                  data-nid={`${stringIndex}-${fret}`}
                  // fret
                  cx={fretWidth / 2 + stroke / 2 + fretWidth * fret}
                  // string
                  cy={topSpace + strHeight * stringIndex}
                  r={fret === 0 && showOpenNotes ? circRad / 1.5 : circRad}
                  fill={setFill(fret, `${stringIndex}-${fret}`)}
                  stroke="#000"
                  strokeWidth={stroke}
                  onClick={(e) => {printNoteID(e)}}
                />
              );
            })
          )
        )}
    </>
  );
};

export default Pattern;
