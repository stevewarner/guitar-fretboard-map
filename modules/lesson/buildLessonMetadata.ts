import { Metadata } from 'next';
import { getLesson } from '@/modules/lesson/lessons';

// Stub pages (header only, no content yet) are marked noindex so thin pages
// don't get crawled — pass indexable: true lesson-by-lesson as real content
// lands, rather than removing this default.
const STUB_ROBOTS = { index: false, follow: true };

export function buildLessonMetadata(
  partSlug: string,
  lessonSlug: string,
  { indexable = false }: { indexable?: boolean } = {},
): Metadata {
  const lesson = getLesson(partSlug, lessonSlug);
  const title = lesson?.title ?? 'Lesson';
  const path = lesson?.href ?? `/lesson/${partSlug}/${lessonSlug}`;

  return {
    title,
    alternates: { canonical: path },
    openGraph: { title: `GuitarTheory | ${title}` },
    robots: indexable ? undefined : STUB_ROBOTS,
  };
}
