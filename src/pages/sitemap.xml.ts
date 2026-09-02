import { SITE } from '~/config'
import {
  getAllBlogPosts,
  getBlogPostPath,
  getSeriesSummaries,
  getTagSummaries,
} from '~/utils/blog'
import { withBasePath } from '~/utils/path'

export const prerender = true

interface SitemapEntry {
  loc: string
  lastmod?: string
}

const escapeXml = (value: string) =>
  value.replace(/[<>&'"]/g, (character) => {
    const entities: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      "'": '&apos;',
      '"': '&quot;',
    }

    return entities[character]
  })

const absoluteUrl = (path: string) =>
  new URL(withBasePath(path), SITE.website).href

export async function GET() {
  const posts = await getAllBlogPosts()
  const entries = new Map<string, SitemapEntry>()
  const addEntry = (path: string, lastmod?: Date) => {
    const loc = absoluteUrl(path)
    entries.set(loc, {
      loc,
      ...(lastmod && { lastmod: lastmod.toISOString() }),
    })
  }

  addEntry('/')
  addEntry('/blog/')
  addEntry('/series/')
  addEntry('/tags/')

  posts.forEach((post) => {
    addEntry(getBlogPostPath(post), post.data.lastModDate || post.data.pubDate)
  })

  getSeriesSummaries(posts).forEach((series) => {
    addEntry(series.path, series.latestPubDate)
  })

  getTagSummaries(posts)
    .filter((tag) => tag.count > 1)
    .forEach((tag) => addEntry(tag.path))

  const urls = Array.from(entries.values())
    .sort((left, right) => left.loc.localeCompare(right.loc))
    .map(
      ({ loc, lastmod }) =>
        `<url><loc>${escapeXml(loc)}</loc>${
          lastmod ? `<lastmod>${escapeXml(lastmod)}</lastmod>` : ''
        }</url>`
    )
    .join('')
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
