'use client';
import { useContext } from 'react';
import Pattern from './Pattern';
import { FretboardContext } from './contexts';

type Props = {
  numFrets: number;
  showOpenNotes?: boolean;
  startFret?: number;
  small?: boolean;
  styles?: string;
  title?: string;
  options?: {
    fbHeight: number;
    fbWidth: number;
    fretWidth: number;
    strHeight: number;
    stroke: number;
    topSpace: number;
    circRad: number;
  };
  children?: React.ReactNode;
  id?: string;
};

const Fretboard = ({
  children,
  numFrets,
  showOpenNotes = false,
  startFret,
  options,
  small = false,
  styles = '',
  title = '',
  id,
}: Props) => {
  const initialState = useContext(FretboardContext);

  const modState = { ...initialState, numFrets, showOpenNotes, ...options };

  const { fbHeight, fbWidth, fretWidth, strHeight, stroke, topSpace } =
    modState;

  const openFret = showOpenNotes ? fretWidth : 0;

  // if (showOpenNotes) numFrets++;

  return (
    <FretboardContext.Provider value={modState}>
      <div className={`max-w-full overflow-x-scroll ${styles}`}>
        <svg
          id={id}
          className={`mx-auto my-0 overflow-visible ${
            small ? 'stroke-[2]' : 'stroke-[4]'
          }`}
          strokeWidth="2"
          width={fbWidth + stroke}
          height={
            fbHeight + topSpace * 2 + (startFret && startFret > 1 ? 30 : 0)
          }
          // TODO viewBox should be canculated and width/height inherited
          // viewBox={`0 0 140 140`}
        >
          <title>{title}</title>
          <rect
            x={stroke / 2 + openFret}
            y={topSpace}
            width={fretWidth * numFrets}
            height={fbHeight}
            fill="none"
            stroke="black"
            className="fill-white	stroke-black"
            // rx="8" // border radius
            // ry="8"
          />
          {/* strings */}
          {[...Array(4)].map((x, index) => (
            <line
              key={`string-${index}`}
              x1={openFret}
              y1={strHeight * (index + 1) + topSpace}
              x2={fretWidth * numFrets + stroke + openFret}
              y2={strHeight * (index + 1) + topSpace}
              stroke="black"
              className="stroke-black"
            />
          ))}
          {/* frets */}
          {[...Array(numFrets - 1)].map((x, index) => (
            <line
              key={`string-${index}`}
              x1={fretWidth * (index + 1) + stroke / 2 + openFret}
              y1={topSpace}
              x2={fretWidth * (index + 1) + stroke / 2 + openFret}
              y2={fbHeight + topSpace}
              stroke="black"
              className="stroke-black"
            />
          ))}

          {children}
          {startFret && startFret > 1 && (
            <text
              x={fretWidth + openFret / 2 - 5}
              y={strHeight * (5 + 1) + topSpace}
              fontFamily="Arial"
              fontSize="20" // subract 5 from x to center text
            >
              {startFret}
            </text>
          )}
        </svg>
      </div>
    </FretboardContext.Provider>
  );
};

export { Fretboard, Pattern };
