import type { MetadataRoute } from 'next';
import { modules } from '@/data/modules';
import { getSiteUrl } from '@/lib/site';

const base = getSiteUrl();

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ['', '/solutions/companies', '/solutions/individuals', '/modules', '/wellbeing', '/pricing', '/about', '/contact', '/legal', '/privacy'];

  return [
    ...staticPages.map((path) => ({ url: `${base}${path}`, lastModified: new Date() })),
    ...modules.map((module) => ({
      url: `${base}/modules/${module.slug}`,
      lastModified: new Date(),
    })),
  ];
}
