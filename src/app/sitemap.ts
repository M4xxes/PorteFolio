import type { MetadataRoute } from 'next'
import { site } from '@/lib/constants'
import { projects } from '@/lib/data/projects'

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['', '/projects', '/about', '/contact'].map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: 'monthly' as const,
    priority: path === '' ? 1 : 0.8,
  }))
  const projectPages = projects.map((p) => ({
    url: `${site.url}/projects/${p.id}`,
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }))
  return [...pages, ...projectPages]
}
