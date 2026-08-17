import { Suspense } from 'react';
import { SectionLabel } from '@/components/SectionLabel';
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
      <SectionLabel>Tools / Chord ID</SectionLabel>
      <h1 className="mb-2 mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
        What <span className="text-accent">chord</span> is this?
      </h1>
      <p className="max-w-2xl text-sm text-fg-secondary">
        Tap the strings and frets you&rsquo;re fretting. We&rsquo;ll match the
        notes against every quality in the library.
      </p>
      <div className="mt-8">
        <Suspense
          fallback={<p className="text-sm text-fg-secondary">Loading…</p>}
        >
          <FreeformChordIdentifier />
        </Suspense>
      </div>
    </div>
  );
}
