'use client';
import { useState } from 'react';
import { Fretboard } from '@/components/FretboardChartV3';
import styles from './PrintTemplate.module.scss';

export const PrintTemplate = () => {
  const [numChords, setNumChords] = useState(4);

  const count = Math.min(numChords, 4);

  return (
    <>
      <span className="printHidden">
        Number of chord charts:{' '}
        <input
          id="numChords"
          name="numChords"
          type="number"
          value={numChords}
          onChange={(e) => setNumChords(Number(e.target.value))}
          className="mb-4 border p-2"
          min={1}
          max={20}
        />
      </span>

      <div
        className={styles.chordsContainer}
        style={{ gridTemplateColumns: `repeat(${count}, 1fr)` }}
      >
        {[...Array(numChords)].map((_, index) => (
          <div key={index} className={styles.chordChart}>
            <Fretboard numFrets={4} startFret={0} height={200} width={200} />
          </div>
        ))}
      </div>
    </>
  );
};
