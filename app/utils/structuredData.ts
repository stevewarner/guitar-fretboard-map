import { SITE_URL } from '@/app/utils/site';

export type BreadcrumbItem = { name: string; path: string };

export function breadcrumbList(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'GuitarTheory',
    url: SITE_URL,
  };
}

// Lessons are educational content, not a reference-term lookup like
// definedTerm below, so they get their own type. Plain `LearningResource`
// rather than combined with `Article`: Article implies journalistic fields
// (author, datePublished) this site doesn't track, and per
// docs/GEO_STRATEGY.md item 14, schema should only describe what's actually
// on the page. `isPartOf` mirrors the real, visible relationship shown in
// the left nav and breadcrumb (a lesson belongs to one of the 5 course
// parts), not a fabricated hierarchy.
export function learningResource({
  name,
  description,
  path,
  partName,
  partPath,
}: {
  name: string;
  description: string;
  path: string;
  partName: string;
  partPath: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name,
    description,
    url: `${SITE_URL}${path}`,
    learningResourceType: 'Lesson',
    isPartOf: {
      '@type': 'Course',
      name: partName,
      url: `${SITE_URL}${partPath}`,
    },
  };
}

export function definedTerm({
  name,
  description,
  termSetName,
  termSetPath,
}: {
  name: string;
  description: string;
  termSetName: string;
  termSetPath: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name,
    description,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: termSetName,
      url: `${SITE_URL}${termSetPath}`,
    },
  };
}
