import NewChordForm from '@/components/NewChordForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add a new chord',
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

        <NewChordForm />
      </div>
    </>
  );
};

export default NewChord;
