import Link from 'next/link';

export const Footer = () => (
  <footer className="printHidden border-t border-line bg-surface-raised">
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-8 sm:flex-row sm:justify-between sm:px-16">
      <div className="flex flex-col gap-2">
        <Link href="/about" className="text-sm text-fg-secondary hover:text-fg">
          About
        </Link>
        <Link
          href="/feedback"
          className="text-sm text-fg-secondary hover:text-fg"
        >
          Send me a message
        </Link>
      </div>
      <div className="flex flex-col gap-2 sm:items-end">
        <Link
          href="/chordid"
          className="text-sm text-fg-secondary hover:text-fg"
        >
          What chord is this?
        </Link>
        <Link
          href="/fretboard"
          className="text-sm text-fg-secondary hover:text-fg"
        >
          Fretboard Playground
        </Link>
        <Link href="/print" className="text-sm text-fg-secondary hover:text-fg">
          Print
        </Link>
      </div>
    </div>
  </footer>
);
