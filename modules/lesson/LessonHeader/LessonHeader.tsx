import { JsonLd } from '@/components/JsonLd';
import { breadcrumbList } from '@/app/utils/structuredData';
import { getLesson } from '@/modules/lesson/lessons';

interface LessonHeaderProps {
  partSlug: string;
  lessonSlug: string;
}

export function LessonHeader({ partSlug, lessonSlug }: LessonHeaderProps) {
  const lesson = getLesson(partSlug, lessonSlug);
  if (!lesson) return null;

  return (
    <>
      <JsonLd
        data={breadcrumbList([
          { name: 'Home', path: '/' },
          { name: 'Lessons', path: '/lesson' },
          { name: lesson.partTitle, path: `/lesson/${lesson.partSlug}` },
          { name: lesson.title, path: lesson.href },
        ])}
      />
      <h1 className="mb-4">{lesson.title}</h1>
    </>
  );
}
