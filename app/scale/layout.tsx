import { SCALE_SYSTEMS } from '@/modules/scale/data/systems';
import { ScalesNav } from '@/modules/scale/ScalesNav';

export default function ScalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col gap-8 md:flex-row">
      {/* The scale-system nav renders before the page content in the DOM
          (below), so the root layout's "Skip to main content" link lands
          here rather than at the actual scale content — this second,
          page-scoped skip link gets keyboard/screen-reader users past it too. */}
      <a
        href="#scale-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-fg"
      >
        Skip to scale content
      </a>
      <aside className="shrink-0 md:w-44">
        <ScalesNav systems={SCALE_SYSTEMS} />
      </aside>
      <div
        id="scale-content"
        tabIndex={-1}
        className="min-w-0 flex-1 outline-none"
      >
        {children}
      </div>
    </div>
  );
}
