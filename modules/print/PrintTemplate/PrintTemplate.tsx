'use client';
import { useState } from 'react';
import { Fretboard } from '@/components/FretboardChart';
import { Button, ButtonVariant } from '@/components/Button';
import styles from './PrintTemplate.module.scss';

export const PrintTemplate = () => {
  const [numChords, setNumChords] = useState(4);

  const count = Math.min(numChords, 4);

  return (
    <div className="w-full max-w-3xl rounded-2xl bg-surface p-8 shadow-sm print:shadow-none">
      <div className="printHidden mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="numChords" className="text-sm text-fg-secondary">
            Number of chord charts:
          </label>
          <input
            id="numChords"
            name="numChords"
            type="number"
            value={numChords}
            onChange={(e) => setNumChords(Number(e.target.value))}
            className="w-16 rounded-full bg-surface-raised px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            min={1}
            max={20}
          />
        </div>
        <Button
          type="button"
          variant={ButtonVariant.TERTIARY}
          pill
          onClick={() => window.print()}
        >
          Print this page
        </Button>
      </div>

      <div
        className={styles.chordsContainer}
        style={{ gridTemplateColumns: `repeat(${count}, 1fr)` }}
      >
        {[...Array(numChords)].map((_, index) => (
          <div key={index} className={styles.chordChart}>
            <Fretboard
              numFrets={4}
              startFret={0}
              height={200}
              width={200}
              title={`Blank chord chart ${index + 1}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
