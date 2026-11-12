import type { MetadataRoute } from 'next'
import { site } from '@/lib/constants'
import { projects } from '@/lib/data/projects'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: 'monthly', priority: 1 },
    ...projects.map((p) => ({
      url: `${site.url}/projects/${p.id}`,
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
  ]
}
