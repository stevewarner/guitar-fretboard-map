'use client';
import { useState } from 'react';
import {
  Fretboard as FretboardV2,
  Pattern as PatternV2,
} from '@/components/FretboardChartV2';

const TriadShapes = () => {
  const [isMajor, toggleIsMajor] = useState(true);

  return (
    <>
      <div className="inline-flex rounded-md" role="group">
        <button
          type="button"
          className={`${isMajor ? 'bg-gray-900 text-white hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-s-lg border border-gray-900 px-4 py-2 text-sm font-medium text-gray-900 focus:z-10`}
          onClick={() => toggleIsMajor(true)}
        >
          Major
        </button>
        <button
          type="button"
          className={`${!isMajor ? 'bg-gray-900 text-white hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-e-lg border border-l-0 border-gray-900 px-4 py-2 text-sm font-medium text-gray-900`}
          onClick={() => toggleIsMajor(false)}
        >
          Minor
        </button>
      </div>

      <p>6th string / 1st finger</p>
      <FretboardV2 numFrets={4} startFret={1} height={400} width={400}>
        <PatternV2
          tab={isMajor ? [1, 3, 3, 2, 1, 1] : [1, 3, 3, 1, 1, 1]}
          intervals={isMajor ? [1, 5, 1, 3, 5, 1] : [1, 5, 1, 'b3', 5, 1]}
          fillColor="#000"
        />
      </FretboardV2>

      <p>4th string / 1st finger</p>
      <FretboardV2 numFrets={4} startFret={1} height={400} width={400}>
        <PatternV2
          tab={isMajor ? ['x', 'x', 1, 3, 4, 3] : ['x', 'x', 1, 3, 4, 2]}
          intervals={isMajor ? [, , 1, 5, 1, 3] : [, , 1, 5, 1, 'b3']}
          fillColor="#000"
        />
      </FretboardV2>

      <p>5th string / 4th finger</p>
      <FretboardV2 numFrets={4} startFret={1} height={400} width={400}>
        <PatternV2
          tab={isMajor ? ['x', 4, 3, 1, 2, 1] : ['x', 4, 2, 1, 2, 'x']}
          intervals={isMajor ? [, 1, 3, 5, 1, 3] : [, 1, 'b3', 5, 1, '']}
          fillColor="#000"
        />
      </FretboardV2>

      <p>5th string / 1st finger</p>
      <FretboardV2 numFrets={4} startFret={1} height={400} width={400}>
        <PatternV2
          tab={isMajor ? ['x', 1, 3, 3, 3, 1] : ['x', 1, 3, 3, 2, 1]}
          intervals={isMajor ? [, 1, 5, 1, 3, 5] : [, 1, 5, 1, 'b3', 5]}
          fillColor="#000"
        />
      </FretboardV2>

      <p>1st string / 4th finger</p>
      <FretboardV2 numFrets={4} startFret={1} height={400} width={400}>
        <PatternV2
          tab={isMajor ? ['x', 'x', 1, 1, 1, 4] : ['x', 'x', 1, 4, 4, 4]}
          intervals={isMajor ? [, , 5, 1, 3, 1] : [, , 5, 'b3', 5, 1]}
          fillColor="#000"
        />
      </FretboardV2>

      <p>6th string / 4th finger</p>
      <FretboardV2 numFrets={4} startFret={1} height={400} width={400}>
        <PatternV2
          tab={isMajor ? [4, 3, 1, 1, 1, 'x'] : [4, 2, 1, 1, 'x', 'x']}
          intervals={isMajor ? [1, 3, 5, 1, 3, ''] : [1, 'b3', 5, 1, '', '']}
          fillColor="#000"
        />
      </FretboardV2>
    </>
  );
};

export default TriadShapes;
