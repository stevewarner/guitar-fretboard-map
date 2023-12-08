'use client';
// import { Metadata } from 'next';
import { ChangeEvent, useState } from 'react';
import { Fretboard, Pattern } from '@/components/FretboardChart';

const numFrets = 13;
const fbHeight = 360;
const fbWidth = 400;
const stroke = 4;

// export const metadata: Metadata = {
//   title: 'Lydian',
// };

const Lydian = () => {
  const [highlightRoot, toggleHighlightRoot] = useState(false);
  const [currPosition, setCurrPosition] = useState('E');
  return (
    <>
      <div className="flex flex-col items-center">
        <h1 className="mb-4">Lydian</h1>

        <label>
          Highlight root:
          <input
            type="checkbox"
            name="highlightRoot"
            onChange={() => toggleHighlightRoot((prev) => !prev)}
          />
        </label>

        <div>
          <label htmlFor="position">Chord shape position:</label>
          <select
            name="position"
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setCurrPosition(e.target.value)
            }
          >
            <option value="E">E shape</option>
            <option value="D">D shape</option>
            <option value="C">C shape</option>
            <option value="A">A shape</option>
            <option value="G">G shape</option>
          </select>
        </div>

        <Fretboard
          numFrets={numFrets}
          styles="mx-4 md:mx-0 py-8"
          options={{
            fbHeight: fbHeight,
            strHeight: fbHeight / 5,
            fretWidth: fbWidth / 4,
            fbWidth: (fbWidth / 4) * numFrets,
            stroke: stroke,
            circRad: fbHeight / 20,
            topSpace: fbHeight / 20 + stroke / 2,
          }}
        >
          <Pattern
            // full major scale
            tab={[
              [0, 2, 4, 6, 7, 9, 11, 12],
              [1, 2, 4, 6, 7, 9, 11],
              [1, 2, 4, 6, 8, 9, 11],
              [1, 3, 4, 6, 8, 9, 11],
              [0, 2, 4, 5, 7, 9, 11, 12],
              [0, 2, 4, 6, 7, 9, 11, 12],
            ]}
            fillColor="#000"
          />

          {currPosition === 'E' && (
            <>
              <Pattern
                // chord highlight
                tab={[[0], [2], [2], [1], [0], [0]]}
                fillColor="blue"
              />
              <rect
                x={2}
                y={0}
                width={500}
                height={400}
                fill="none"
                stroke="red"
                strokeWidth="4"
                strokeDasharray="10,10"
              />
              <text x="0" y="-15" fill="black">
                E Shape
              </text>
            </>
          )}

          {currPosition === 'D' && (
            <>
              <Pattern
                // chord highlight
                tab={[[], [], [2], [4], [5], [4]]}
                fillColor="blue"
              />
              <rect
                x={202}
                y={0}
                width={400}
                height={400}
                fill="none"
                stroke="red"
                strokeWidth="4"
                strokeDasharray="10,10"
              />
              <text x="200" y="-15" fill="black">
                D Shape
              </text>
            </>
          )}
          {currPosition === 'C' && (
            <>
              <Pattern
                // chord highlight
                tab={[[], [7], [6], [4], [5], [4]]}
                fillColor="blue"
              />
              <rect
                x={402}
                y={0}
                width={400}
                height={400}
                fill="none"
                stroke="red"
                strokeWidth="4"
                strokeDasharray="10,10"
              />
              <text x="400" y="-15" fill="black">
                C Shape
              </text>
            </>
          )}
          {currPosition === 'A' && (
            <>
              <Pattern
                // chord highlight
                tab={[[], [7], [9], [9], [9], [7]]}
                fillColor="blue"
              />
              <rect
                x={702}
                y={0}
                width={400}
                height={400}
                fill="none"
                stroke="red"
                strokeWidth="4"
                strokeDasharray="10,10"
              />
              <text x="700" y="-15" fill="black">
                A Shape
              </text>
            </>
          )}
          {currPosition === 'G' && (
            <>
              <Pattern
                // chord highlight
                tab={[[12], [11], [9], [9], [9], [12]]}
                fillColor="blue"
              />
              <rect
                x={902}
                y={0}
                width={400}
                height={400}
                fill="none"
                stroke="red"
                strokeWidth="4"
                strokeDasharray="10,10"
              />
              <text x="900" y="-15" fill="black">
                G Shape
              </text>
            </>
          )}

          {highlightRoot && (
            <Pattern
              // root
              tab={[[0, 12], [7], [2], [9], [5], [0, 12]]}
              fillColor="#ff0000"
            />
          )}
        </Fretboard>
      </div>
    </>
  );
};

export default Lydian;
