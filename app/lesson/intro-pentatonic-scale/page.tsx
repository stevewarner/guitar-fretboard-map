import { Metadata } from 'next';
import {
  Fretboard as FretboardV2,
  Pattern as PatternV2,
} from '@/components/FretboardChartV2';

export const metadata: Metadata = {
  title: 'Intro to Pentatonic Scale',
  description: 'Introduction to the pentatonic scale',
  openGraph: {
    title: 'GuitarTheory | Intro to Pentatonic Scale',
    description: 'Introduction to the pentatonic scale',
  },
};

const IntroPentatonic = () => {
  return (
    <>
      <div className="flex flex-col items-center">
        <h1 className="mb-4">Intro to pentatonic scale</h1>

        <h2>Major pentatonic scale</h2>
        <p>
          The major pentatonic scale is a 5 note scale. It is missing the half
          steps (4th and 7th intervals) of the major scale.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <FretboardV2 numFrets={4} startFret={1} height={400} width={400}>
            <PatternV2
              tab={[
                [2, 4],
                [1, 4],
                [1, 4],
                [1, 3],
                [2, 4],
                [2, 4],
              ]}
              intervals={[
                [1, 2],
                [3, 5],
                [6, 1],
                [2, 3],
                [5, 6],
                [1, 2],
              ]}
              fillColor="#000"
            />
          </FretboardV2>

          <FretboardV2 numFrets={4} startFret={1} height={400} width={400}>
            <PatternV2
              tab={[
                [1, 4],
                [1, 3],
                [1, 3],
                [1, 3],
                [1, 4],
                [1, 4],
              ]}
              intervals={[
                [6, 1],
                [2, 3],
                [5, 6],
                [1, 2],
                [3, 5],
                [6, 1],
              ]}
              fillColor="#000"
            />
          </FretboardV2>
        </div>

        <h2>Minor pentatonic scale</h2>
        <p>
          The minor pentatonic scale is a 5 note scale without the 2nd and 6th
          intervals.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <FretboardV2 numFrets={4} startFret={1} height={400} width={400}>
            <PatternV2
              tab={[
                [1, 4],
                [1, 3],
                [1, 3],
                [1, 3],
                [1, 4],
                [1, 4],
              ]}
              intervals={[
                [1, 'b3'],
                [4, 5],
                ['b7', 1],
                ['b3', 4],
                [5, 'b7'],
                [1, 'b3'],
              ]}
              fillColor="#000"
            />
          </FretboardV2>

          <FretboardV2 numFrets={4} startFret={1} height={400} width={400}>
            <PatternV2
              tab={[
                [2, 4],
                [2, 4],
                [1, 4],
                [1, 4],
                [2, 4],
                [2, 4],
              ]}
              intervals={[
                ['b7', 1],
                ['b3', 4],
                [5, 'b7'],
                [1, 'b3'],
                [4, 5],
                ['b7', 1],
              ]}
              fillColor="#000"
            />
          </FretboardV2>
        </div>
      </div>
    </>
  );
};

export default IntroPentatonic;
