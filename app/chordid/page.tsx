import { Suspense } from 'react';
import { FreeformChordIdentifier } from '@/modules/chordid/FreeformChordIdentifier';

export const metadata = {
  title: 'What chord is this?',
  description:
    'Build a chord shape on the fretboard and identify what it is called.',
  alternates: { canonical: '/chordid' },
};

export default function ChordIdPage() {
  return (
    <div>
      <h1 className="mb-6">What chord is this?</h1>
      <Suspense>
        <FreeformChordIdentifier />
      </Suspense>
    </div>
  );
}
