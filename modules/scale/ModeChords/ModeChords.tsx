import Link from 'next/link';
import { Fretboard, Pattern } from '@/components/FretboardChart';
import { ChordType } from '@/types';
import { DiatonicChord } from '@/modules/scale/utils/scaleUtils';

interface ModeChordsProps {
  chords: DiatonicChord[];
  chordData: ChordType[];
}

export function ModeChords({ chords, chordData }: ModeChordsProps) {
  const byName = new Map(chordData.map((c) => [c.name.toLowerCase(), c]));

  return (
    <section className="mt-12">
      <h2 className="mb-4">Chords</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {chords.map((chord) => {
          const match = byName.get(chord.name.toLowerCase());
          return (
            <Link
              key={chord.degree}
              href={`/chord/${encodeURIComponent(chord.name)}`}
              className="flex flex-col items-center gap-1 rounded border border-current px-3 py-2 hover:bg-surface-sunken"
            >
              <span className="font-mono text-xs text-fg-secondary">
                {chord.romanNumeral}
                {chord.quality}
              </span>
              <span className="text-sm font-medium">{chord.name}</span>
              {match && (
                <Fretboard
                  numFrets={match.num_frets}
                  startFret={match.start_fret}
                  height={110}
                  width={110}
                >
                  <Pattern
                    tab={match.tab}
                    startFret={match.start_fret}
                    fillColor="#000"
                  />
                </Fretboard>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
