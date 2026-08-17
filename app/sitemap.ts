import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/app/utils/site';
import { SCALE_SYSTEMS } from '@/modules/scale/data/systems';
import { getAllQualities } from '@/modules/chordv2/db/queries';
import { PC_TO_NOTE } from '@/app/utils/constants';
import { LESSONS } from '@/modules/lesson/lessons';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const qualities = await getAllQualities();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'yearly', priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.8 },
    {
      url: `${SITE_URL}/how-to-read-charts`,
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    { url: `${SITE_URL}/chord`, changeFrequency: 'monthly', priority: 0.7 },
    {
      url: `${SITE_URL}/chord?mode=open`,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/chord?mode=slash`,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    { url: `${SITE_URL}/chordid`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/fretboard`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/feedback`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  // One URL per root, not the bare /chord/{quality} URL — the page's own
  // canonical tag (app/chord/[quality]/page.tsx) always includes ?root=
  // (defaulting to A when absent), so submitting the bare URL put the
  // sitemap at odds with the page's own declared canonical. See
  // docs/SEO_IMPROVEMENTS.md's 2026-08-06 interim check-in.
  const chordPages: MetadataRoute.Sitemap = qualities.flatMap((q) =>
    PC_TO_NOTE.map((root) => ({
      url: `${SITE_URL}/chord/${encodeURIComponent(q.symbol)}?root=${encodeURIComponent(root)}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  );

  const scalePages: MetadataRoute.Sitemap = SCALE_SYSTEMS.flatMap((system) =>
    system.modes.map((mode) => ({
      url: `${SITE_URL}/scale/${system.slug}/${mode.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  );

  // Only lessons flagged `indexed` in modules/lesson/lessons.ts — the rest
  // are still header-only stubs, noindexed by buildLessonMetadata, and
  // submitting a noindex URL here is a bad signal to Google. Priority 0.7
  // matches /chord's index rather than the 0.6 given to individual chord/
  // scale detail pages: lessons are the site's flagship content, not a
  // lower-value page than the browse index.
  const lessonPages: MetadataRoute.Sitemap = LESSONS.filter(
    (l) => l.indexed,
  ).map((l) => ({
    url: `${SITE_URL}${l.href}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...chordPages, ...scalePages, ...lessonPages];
}
