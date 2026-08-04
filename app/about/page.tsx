import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About',
  alternates: { canonical: '/about' },
};

const About = () => {
  return (
    <div className="max-w-xl">
      <h1 className="mb-6">About</h1>

      <p className="mb-4">
        GuitarTheory is a chord and scale reference for guitarists, with
        diagrams, tools, and lessons that teach you to think in intervals
        instead of tab positions.
      </p>

      <p className="mb-4">
        As an intermediate guitar player, do you feel like you&apos;ve hit a
        plateau? You can learn songs from tabs and you know a scale shape or
        two, but you can&apos;t improvise and you&apos;re stuck in one position
        on the neck.
      </p>

      <p className="mb-8">
        Music theory closes that gap. You start to understand what is actually
        happening in the songs you play, and instead of memorizing new shapes
        for every key, the patterns you already know start working everywhere on
        the neck.
      </p>

      <p className="mb-2 text-sm font-medium">Learn</p>
      <ul className="mb-6 flex flex-col gap-1">
        <li>
          <Link
            href="/lesson"
            className="text-sm text-fg-secondary hover:text-fg"
          >
            Lessons
          </Link>
          : a structured path from intervals to modes
        </li>
        <li>
          <Link
            href="/scale"
            className="text-sm text-fg-secondary hover:text-fg"
          >
            Scales
          </Link>
          : all positions, labeled with interval numbers
        </li>
        <li>
          <Link
            href="/chord"
            className="text-sm text-fg-secondary hover:text-fg"
          >
            Chords
          </Link>
          : browse by quality and root note
        </li>
      </ul>

      <p className="mb-2 text-sm font-medium">Tools</p>
      <ul className="mb-8 flex flex-col gap-1">
        <li>
          <Link
            href="/chordid"
            className="text-sm text-fg-secondary hover:text-fg"
          >
            Chord Identifier
          </Link>
          : build a shape, find out what it&apos;s called
        </li>
        <li>
          <Link
            href="/fretboard"
            className="text-sm text-fg-secondary hover:text-fg"
          >
            Fretboard Playground
          </Link>
          : free-form note exploration
        </li>
        <li>
          <Link
            href="/print"
            className="text-sm text-fg-secondary hover:text-fg"
          >
            Print
          </Link>
          : printable diagrams
        </li>
      </ul>

      <p className="text-sm text-fg-secondary">
        <Link href="/feedback" className="underline hover:text-fg">
          Send me a message
        </Link>{' '}
        if you have questions or feedback.
      </p>
    </div>
  );
};

export default About;
