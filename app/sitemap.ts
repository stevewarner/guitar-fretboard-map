import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/app/utils/site';
import { SCALE_SYSTEMS } from '@/modules/scale/data/systems';
import { getAllQualities } from '@/modules/chordv2/db/queries';

const LESSON_SLUGS = [
  'intervals',
  'intro-pentatonic-scale',
  'movable-shapes',
  '4-note-voicing',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const qualities = await getAllQualities();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'yearly', priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.8 },
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

  const chordPages: MetadataRoute.Sitemap = qualities.map((q) => ({
    url: `${SITE_URL}/chord/${encodeURIComponent(q.symbol)}`,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const scalePages: MetadataRoute.Sitemap = SCALE_SYSTEMS.flatMap((system) =>
    system.modes.map((mode) => ({
      url: `${SITE_URL}/scale/${system.slug}/${mode.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  );

  const lessonPages: MetadataRoute.Sitemap = LESSON_SLUGS.map((slug) => ({
    url: `${SITE_URL}/lesson/${slug}`,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticPages, ...chordPages, ...scalePages, ...lessonPages];
}
