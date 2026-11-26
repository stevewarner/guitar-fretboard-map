import Link from 'next/link';
import type { ReactNode } from 'react';
import { LESSON_PARTS } from '@/modules/lesson/lessons';

interface Props {
  // Visible h2. Omit it for a section the page title already introduces (the
  // chord/scale detail panels) and pass `ariaLabel` instead.
  title?: string;
  ariaLabel?: string;
  // Lessons that teach what this section shows, as "part-slug/lesson-slug".
  // Titles come from LESSON_PARTS so a renamed lesson can't go stale here.
  lessons?: string[];
  className?: string;
  children: ReactNode;
}

function resolveLesson(path: string) {
  const [partSlug, lessonSlug] = path.split('/');
  const part = LESSON_PARTS.find((p) => p.slug === partSlug);
  const lesson = part?.lessons.find((l) => l.slug === lessonSlug);
  return lesson ? { href: `/lesson/${path}`, title: lesson.title } : null;
}

// One section of a chord or scale detail page: an optional heading, the
// content, then a "Related lessons" row linking out to the lessons that
// explain it.
export function PageSection({
  title,
  ariaLabel,
  lessons,
  className = '',
  children,
}: Props) {
  const lessonLinks = (lessons ?? []).flatMap((path) => {
    const lesson = resolveLesson(path);
    return lesson ? [lesson] : [];
  });

  return (
    <section
      aria-label={title ? undefined : ariaLabel}
      className={`flex flex-col gap-4 ${className}`}
    >
      {title && (
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      )}
      {children}
      {lessonLinks.length > 0 && (
        <div className="mt-2 flex flex-col items-start gap-1.5 text-sm sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-5">
          <span className="text-xs font-semibold text-fg-secondary">
            Related lessons
          </span>
          {lessonLinks.map((lesson) => (
            <Link key={lesson.href} href={lesson.href} className="underline">
              {lesson.title}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
