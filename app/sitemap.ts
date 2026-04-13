import type { MetadataRoute } from 'next';
import { getAllProductSlugs, getAllCategorySlugs } from '@/lib/queries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE = 'https://theresidentialist.com';

  const [products, categories] = await Promise.all([
    getAllProductSlugs(),
    getAllCategorySlugs(),
  ]);

  const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE}/products/${p.category_slug}/${p.product_slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const categoryUrls: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE}/products/${c.slug}`,
    lastModified: new Date(c.updated_at),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  const staticUrls: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/products`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/methodology`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE}/about`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/terms`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  return [...staticUrls, ...categoryUrls, ...productUrls];
}
