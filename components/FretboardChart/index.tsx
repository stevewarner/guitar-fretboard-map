import { useContext } from 'react';
import Pattern from './Pattern';
import { FretboardContext } from './contexts';
import styles from './styles.module.scss';

// some sizing properties like stroke are defined in styles, css in js could fix?

type Props = {
  numFrets: number;
  showOpenNotes: boolean;
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
}: Props) => {
  const initialState = useContext(FretboardContext);

  const modState = { ...initialState, numFrets, showOpenNotes, ...options };

  const { fbHeight, fbWidth, fretWidth, strHeight, stroke, topSpace } =
    modState;

  const openFret = showOpenNotes ? fretWidth : 0;

  //   if (showOpenNotes) numFrets++

  return (
    <FretboardContext.Provider value={modState}>
      <div className={styles.container}>
        <svg width={fbWidth + stroke} height={fbHeight + topSpace * 2}>
          <title>Fretboard</title>
          <rect
            x={stroke / 2 + openFret}
            y={topSpace}
            width={fretWidth * numFrets}
            height={fbHeight}
            className={styles.rect}
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
              className={styles.line}
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
              className={styles.line}
            />
          ))}
          {children}
        </svg>
      </div>
    </FretboardContext.Provider>
  );
};

export { Fretboard, Pattern };
