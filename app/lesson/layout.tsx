import { LessonsNav } from '@/modules/lesson/LessonsNav';
import { LessonPager } from '@/modules/lesson/LessonPager';

export default function LessonsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col gap-8 md:flex-row">
      <aside className="shrink-0 md:w-44">
        <LessonsNav />
      </aside>
      <div className="min-w-0 flex-1">
        {children}
        <LessonPager />
      </div>
    </div>
  );
}
