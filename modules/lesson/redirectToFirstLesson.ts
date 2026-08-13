import { permanentRedirect } from 'next/navigation';
import { getLessonPart } from '@/modules/lesson/lessons';

// Part URLs (e.g. /lesson/foundations) aren't real pages — only the lessons
// underneath are. Landing on a part slug directly bounces into its first
// lesson, same as /lesson itself bounces into the first lesson overall.
export function redirectToFirstLesson(partSlug: string): never {
  const first = getLessonPart(partSlug)?.lessons[0];
  permanentRedirect(first ? `/lesson/${partSlug}/${first.slug}` : '/lesson');
}
