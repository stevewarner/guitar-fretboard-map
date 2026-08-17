import { Metadata } from 'next';
import { getLesson } from '@/modules/lesson/lessons';

// Stub pages (header only, no content yet) are marked noindex so thin pages
// don't get crawled — driven by each lesson's own `indexed` flag in
// modules/lesson/lessons.ts rather than a per-call-site override, so
// flipping a lesson to real content is a one-line data change, not a page.tsx
// edit. Defaults to noindex for an unrecognized slug (lesson === undefined).
const STUB_ROBOTS = { index: false, follow: true };

export function buildLessonMetadata(
  partSlug: string,
  lessonSlug: string,
): Metadata {
  const lesson = getLesson(partSlug, lessonSlug);
  const title = lesson?.title ?? 'Lesson';
  const path = lesson?.href ?? `/lesson/${partSlug}/${lessonSlug}`;

  return {
    title,
    alternates: { canonical: path },
    openGraph: { title: `GuitarTheory | ${title}` },
    robots: lesson?.indexed ? undefined : STUB_ROBOTS,
  };
}
