import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Lessons',
  description: 'Introduction to music theory for guitarists',
  openGraph: {
    title: 'GuitarTheory | Lessons',
    description: 'Introduction to music theory for guitarists',
  },
};

const Lessons = () => {
  return (
    <>
      <div className="flex flex-col items-center">
        <h1 className="mb-4">Lessons</h1>
        <Link href="/lesson/intervals">Intro to intervals</Link>
        <Link href="/lesson/movable-shapes">Movable chord shapes</Link>
        <Link href="/lesson/intro-pentatonic-scale">
          Intro to pentatonic scale
        </Link>
        <Link href="/lesson/4-note-voicing">4 note voicing intro</Link>
      </div>
    </>
  );
};

export default Lessons;
