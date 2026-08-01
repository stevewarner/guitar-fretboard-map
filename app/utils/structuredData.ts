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
