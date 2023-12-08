import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Scale Library',
};

const Scale = () => {
  return (
    <>
      <div className="flex flex-col items-center">
        <h1 className="mb-4">Scale Library</h1>
        <h3>Major Scale system</h3>
        <ul>
          <li>
            <Link href="/scale/ionian">Ionian</Link>
          </li>
          <li>
            <Link href="/scale/dorian">Dorian</Link>
          </li>
          <li>
            <Link href="/scale/phrygian">Phrygian</Link>
          </li>
          <li>
            <Link href="/scale/lydian">Lydian</Link>
          </li>
          <li>
            <Link href="/scale/mixolydian">Mixolydian</Link>
          </li>
          <li>
            <Link href="/scale/aeolian">Aeolian</Link>
          </li>
          <li>
            <Link href="/scale/locrian">Locrian</Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Scale;
