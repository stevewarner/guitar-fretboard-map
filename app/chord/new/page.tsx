'use client';
import { Suspense } from 'react';
import NewChordForm from '@/components/NewChordForm';
import { ChordType } from '@/types';
import { useSearchParams } from 'next/navigation';

const ChordForm = () => {
  const searchParams = useSearchParams();

  // get tab startFret and numFrets from query params
  const tab = searchParams?.get('tab') || '';
  const startFret = searchParams?.get('startFret') || '';
  const numFrets = searchParams?.get('numFrets') || '';

  return (
    <NewChordForm
      initFormValues={
        {
          tab_id: tab,
          start_fret: Number(startFret),
          num_frets: Number(numFrets),
        } as ChordType
      }
    />
  );
};

const NewChord = () => {
  return (
    <>
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Add a new chord
        </h1>
        <p className="mt-2 text-lg leading-8 text-gray-600">
          Submit a new chord to the chord database
        </p>

        <Suspense>
          <ChordForm />
        </Suspense>
      </div>
    </>
  );
};

export default NewChord;
