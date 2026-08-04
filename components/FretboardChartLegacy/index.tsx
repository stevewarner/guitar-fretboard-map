'use client';
import { useContext, useId } from 'react';
import { Pattern } from './Pattern';
import { FretboardContext } from './contexts';
import {
  DEFAULT_HEIGHT,
  DEFAULT_FRET_WIDTH,
  STROKE,
  NUM_STRINGS,
} from './constants';

// Horizontal fretboard. Use FretboardChart for all new features.

type Props = {
  numFrets: number;
  height?: number;
  fretWidth?: number;
  showOpenNotes?: boolean;
  startFret?: number;
  styles?: string;
  title?: string;
  id?: string;
  children?: React.ReactNode;
};

const Fretboard = ({
  children,
  numFrets,
  height = DEFAULT_HEIGHT,
  fretWidth = DEFAULT_FRET_WIDTH,
  showOpenNotes = false,
  startFret,
  styles = '',
  title = '',
  id,
}: Props) => {
  const base = useContext(FretboardContext);
  const titleId = useId();

  const strHeight = height / (NUM_STRINGS - 1);
  const circRad = height / 20;
  const topSpace = circRad + STROKE / 2;
  const fbWidth = fretWidth * numFrets;
  const openFret = showOpenNotes ? fretWidth : 0;

  const state = {
    ...base,
    numFrets,
    showOpenNotes,
    fbHeight: height,
    fbWidth,
    strHeight,
    fretWidth,
    stroke: STROKE,
    circRad,
    topSpace,
  };

  return (
    <FretboardContext.Provider value={state}>
      <div className={`max-w-full overflow-x-scroll ${styles}`} tabIndex={-1}>
        <svg
          id={id}
          role="img"
          aria-labelledby={titleId}
          className="mx-auto my-0 overflow-visible stroke-[4]"
          strokeWidth={STROKE}
          width={fbWidth + STROKE}
          height={height + topSpace * 2 + (startFret && startFret > 1 ? 30 : 0)}
        >
          <title id={titleId}>{title}</title>
          <rect
            x={STROKE / 2 + openFret}
            y={topSpace}
            width={fretWidth * numFrets}
            height={height}
            fill="none"
            className="fill-white stroke-black"
          />
          {/* strings */}
          {[...Array(NUM_STRINGS - 2)].map((_, index) => (
            <line
              key={`string-${index}`}
              x1={openFret}
              y1={strHeight * (index + 1) + topSpace}
              x2={fretWidth * numFrets + STROKE + openFret}
              y2={strHeight * (index + 1) + topSpace}
              className="stroke-black"
            />
          ))}
          {/* frets */}
          {[...Array(numFrets - 1)].map((_, index) => (
            <line
              key={`fret-${index}`}
              x1={fretWidth * (index + 1) + STROKE / 2 + openFret}
              y1={topSpace}
              x2={fretWidth * (index + 1) + STROKE / 2 + openFret}
              y2={height + topSpace}
              className="stroke-black"
            />
          ))}

          {children}

          {startFret && startFret > 1 && (
            <text
              x={fretWidth + openFret / 2 - 5}
              y={topSpace + height + 24}
              fontFamily="Arial"
              fontSize="20"
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
