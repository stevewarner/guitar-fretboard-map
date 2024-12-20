import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About',
};

const About = () => {
  return (
    <>
      <div className="flex flex-col items-center">
        <h1 className="mb-4">About</h1>
        <p>
          I made this site to be a helpful tool for guitarists. If you are a
          beginner looking up <Link href="/chord">chords</Link> or intermediate
          guitarist learning <Link href="/scale">modes</Link>, you can use these
          tools to help visualize what you are learning.
        </p>
      </div>
    </>
  );
};

export default About;
