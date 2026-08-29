import { JsonLd } from '@/components/JsonLd';
import { breadcrumbList, learningResource } from '@/app/utils/structuredData';
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
      {/* Only real-content lessons have a description — a stub has nothing
          accurate to put in LearningResource yet, same gating buildLessonMetadata
          already applies via `indexed` for the meta description/robots tag. */}
      {lesson.description && (
        <JsonLd
          data={learningResource({
            name: lesson.title,
            description: lesson.description,
            path: lesson.href,
            partName: lesson.partTitle,
            partPath: `/lesson/${lesson.partSlug}`,
          })}
        />
      )}
      <h1 className="mb-4">{lesson.title}</h1>
    </>
  );
}
