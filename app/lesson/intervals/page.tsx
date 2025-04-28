import { Metadata } from 'next';
import {
  Fretboard as FretboardV2,
  Pattern as PatternV2,
} from '@/components/FretboardChartV2';

export const metadata: Metadata = {
  title: 'Intro to Intervals',
  description:
    'Introduction to the intervals of the major scale and chromatic scale',
  openGraph: {
    title: 'GuitarTheory | Intro to Intervals',
    description:
      'Introduction to the intervals of the major scale and chromatic scale',
  },
};

const Intervals = () => {
  return (
    <>
      <div className="flex flex-col items-center">
        <h1 className="mb-4">Intro to intervals</h1>

        <h2>Diatonic scale</h2>
        <p>
          The major scale is a diatonic scale consisting of 7 notes (or
          intervals)
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <FretboardV2 numFrets={4} startFret={1} height={400} width={400}>
            <PatternV2
              tab={[[2, 4], [1, 2, 4], [1, 3, 4], [], [], []]}
              intervals={[[1, 2], [3, 4, 5], [6, 7, 1], [], [], []]}
              fillColor="#000"
            />
          </FretboardV2>

          <FretboardV2 numFrets={5} startFret={1} height={400} width={400}>
            <PatternV2
              tab={[[1, 3, 5], [1, 3, 5], [2, 3], [], [], []]}
              intervals={[[1, 2, 3], [4, 5, 6], [7, 1], [], [], []]}
              fillColor="#000"
            />
          </FretboardV2>
        </div>

        <h2>Chromatic scale</h2>
        <p>The chromatic scale consists of all 12 notes</p>
        <div className="flex flex-wrap justify-center gap-4">
          <FretboardV2 numFrets={5} startFret={1} height={400} width={400}>
            <PatternV2
              tab={[[2, 3, 4, 5], [1, 2, 3, 4, 5], [1, 2, 3, 4], [], [], []]}
              intervals={[
                [1, 'b2', 2, 'b3'],
                [3, 4, '#4', 5, 'b6'],
                [6, 'b7', 7, 1],
                [],
                [],
                [],
              ]}
              fillColor="#000"
            />
          </FretboardV2>

          <FretboardV2 numFrets={5} startFret={1} height={400} width={400}>
            <PatternV2
              tab={[[1, 2, 3, 4, 5], [1, 2, 3, 4, 5], [1, 2, 3], [], [], []]}
              intervals={[
                [1, 'b2', 2, 'b3', 3],
                [4, '#4', 5, 'b6', 6],
                ['b7', 7, 1],
                [],
                [],
                [],
              ]}
              fillColor="#000"
            />
          </FretboardV2>
        </div>
      </div>
    </>
  );
};

export default Intervals;
