import { useContext, useReducer } from 'react';
import Pattern from './Pattern';
import { FretboardContext, reducer } from './contexts';

type Props = {
  numFrets: number;
  showOpenNotes?: boolean;
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
};

const Fretboard = ({
  children,
  numFrets,
  showOpenNotes = false,
  options,
  small = false,
  styles = '',
  title = '',
}: Props) => {
  const initialState = useContext(FretboardContext);

  const modState = { ...initialState, numFrets, showOpenNotes, ...options };

  const { fbHeight, fbWidth, fretWidth, strHeight, stroke, topSpace } =
    modState;

  const openFret = showOpenNotes ? fretWidth : 0;

  const [state, dispatch] = useReducer(reducer, modState);

  const handleScroll = (event) => {
    dispatch({type: 'update scrollPos', payload: event.target.scrollLeft})
  }

  //   if (showOpenNotes) numFrets++

  return (
    <FretboardContext.Provider value={{state, dispatch}}>
      <div 
        className={`max-w-full overflow-scroll ${styles}`} 
        onScroll={(e) => handleScroll(e)}
      >
        <svg
          className={`mx-auto my-0 ${small ? 'stroke-[2]' : 'stroke-[4]'}`}
          width={fbWidth + stroke}
          height={fbHeight + topSpace * 2}
        >
          <title>{title}</title>
          <rect
            x={stroke / 2 + openFret}
            y={topSpace}
            width={fretWidth * numFrets}
            height={fbHeight}
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
              className="stroke-black"
            />
          ))}
          {children}
        </svg>
      </div>
    </FretboardContext.Provider>
  );
};

export { Fretboard, Pattern };
