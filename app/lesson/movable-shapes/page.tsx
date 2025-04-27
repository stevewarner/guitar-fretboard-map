import { Metadata } from 'next';
import TriadShapes from './triad-shapes';

export const metadata: Metadata = {
  title: 'Movable Chord Shapes',
  description: 'Movable chord shape positions across the fretboard',
  openGraph: {
    title: 'GuitarTheory | Movable Chord Shapes',
    description: 'Movable chord shape positions across the fretboard',
  },
};

const MovableShapes = () => {
  return (
    <>
      <div className="flex flex-col items-center">
        <h1 className="mb-4">Moveable Chord Shapes</h1>

        <TriadShapes />
      </div>
    </>
  );
};

export default MovableShapes;
