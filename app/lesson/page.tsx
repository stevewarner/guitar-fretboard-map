import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Lessons',
};

const Lessons = () => {
  return (
    <>
      <div className="flex flex-col items-center">
        <h1 className="mb-4">Lessons</h1>
        <Link href="/lesson/4-note-voicing">4 note voicing intro</Link>
      </div>
    </>
  );
};

export default Lessons;
