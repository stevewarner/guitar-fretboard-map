import Link from 'next/link';

export const Footer = () => (
  <footer className="border-t border-line bg-surface-raised">
    <div className="mx-auto max-w-6xl px-4 py-8 text-center sm:px-6">
      <Link href="/feedback" className="text-sm text-fg-secondary hover:text-fg">
        Send me a message
      </Link>
    </div>
  </footer>
);
