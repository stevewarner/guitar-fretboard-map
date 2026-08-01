import { Metadata } from 'next';
import { TriadShapes } from './triad-shapes';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbList } from '@/app/utils/structuredData';

export const metadata: Metadata = {
  title: 'Movable Chord Shapes',
  description:
    'Movable major and minor triad shapes you can slide anywhere on the fretboard to play any key.',
  alternates: { canonical: '/lesson/movable-shapes' },
  openGraph: {
    title: 'GuitarTheory | Movable Chord Shapes',
    description:
      'Movable major and minor triad shapes you can slide anywhere on the fretboard to play any key.',
  },
};

const MovableShapes = () => {
  return (
    <>
      <JsonLd
        data={breadcrumbList([
          { name: 'Home', path: '/' },
          { name: 'Lessons', path: '/lesson' },
          { name: 'Movable Chord Shapes', path: '/lesson/movable-shapes' },
        ])}
      />
      <div className="flex flex-col items-center">
        <h1 className="mb-4">Moveable chord shapes</h1>

        <TriadShapes />
      </div>
    </>
  );
};

export default MovableShapes;
