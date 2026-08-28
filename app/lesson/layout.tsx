import { LessonsNav } from '@/modules/lesson/LessonsNav';
import { LessonPager } from '@/modules/lesson/LessonPager';

export default function LessonsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col gap-8 md:flex-row">
      {/* The lesson list nav renders before the lesson content in the DOM
          (below), so the root layout's "Skip to main content" link lands
          here rather than at the actual lesson — this second, page-scoped
          skip link gets keyboard/screen-reader users past it too. */}
      <a
        href="#lesson-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-fg"
      >
        Skip to lesson content
      </a>
      <aside className="shrink-0 md:w-64">
        <LessonsNav />
      </aside>
      <div
        id="lesson-content"
        tabIndex={-1}
        className="flex min-w-0 flex-1 flex-col outline-none"
      >
        {/* Every lesson page is a bare fragment, so these are each page's
        top-level elements (h2s, paragraphs, chart grids, ...) — space-y here
        is the one place that sets section spacing for every lesson page. */}
        <div className="mb-8 space-y-8">{children}</div>
        <LessonPager />
      </div>
    </div>
  );
}
