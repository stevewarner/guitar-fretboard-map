import { LessonsNav } from '@/modules/lesson/LessonsNav';
import { LessonPager } from '@/modules/lesson/LessonPager';

export default function LessonsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col gap-8 md:flex-row">
      <aside className="shrink-0 md:w-64">
        <LessonsNav />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Every lesson page is a bare fragment, so these are each page's
        top-level elements (h2s, paragraphs, chart grids, ...) — space-y here
        is the one place that sets section spacing for every lesson page. */}
        <div className="mb-8 space-y-8">{children}</div>
        <LessonPager />
      </div>
    </div>
  );
}
