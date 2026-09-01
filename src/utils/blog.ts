import { withBasePath } from './path'
import {
  comparePostsByPublishedDate,
  getFilteredPosts,
  getSortedPosts,
} from './data'

import { BLOG_SERIES_MAP } from '~/content/blog/series'

import type { CollectionEntry } from 'astro:content'
import type { BlogSeriesMeta } from '~/content/blog/series'

export type BlogPost = CollectionEntry<'blog'>

export interface BlogSeriesSummary extends BlogSeriesMeta {
  count: number
  path: string
  posts: BlogPost[]
  latestPubDate: Date
}

export interface BlogTagSummary {
  name: string
  slug: string
  count: number
  path: string
}

function toTitleCase(value: string) {
  return value
    .split('-')
    .filter(Boolean)
    .map((word) => {
      if (word.length <= 3) return word.toUpperCase()
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

export function normalizeTaxonomyValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_/\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function normalizeRouteParam(value: string) {
  return value
    .replace(/\\/g, '/')
    .split('/')
    .map((segment) => normalizeTaxonomyValue(segment))
    .filter(Boolean)
    .join('/')
}

export function getSeriesPath(slug: string) {
  return withBasePath(`/series/${slug}/`)
}

export function getTagPath(slug: string) {
  return withBasePath(`/tags/${slug}/`)
}

export function getBlogPostLegacyRouteParam(post: BlogPost) {
  const filePath = post.filePath?.replace(/\\/g, '/')

  if (!filePath) return post.id

  return filePath
    .replace(/^src\/content\/blog\//, '')
    .replace(/^blog\//, '')
    .replace(/\.(md|mdx)$/, '')
}

export function getBlogPostSlug(post: BlogPost) {
  const legacyParam = getBlogPostLegacyRouteParam(post)
  const normalizedId = normalizeRouteParam(post.id)

  if (!normalizedId || normalizedId === legacyParam)
    return legacyParam.split('/').filter(Boolean).pop() ?? legacyParam

  return normalizedId.split('/').filter(Boolean).pop() ?? normalizedId
}

export function getBlogPostRouteParam(post: BlogPost) {
  const legacyParam = getBlogPostLegacyRouteParam(post)
  const normalizedId = normalizeRouteParam(post.id)

  if (!normalizedId || normalizedId === legacyParam) return legacyParam

  const seriesSlug = getPostSeriesSlug(post)
  if (seriesSlug && !normalizedId.startsWith(`${seriesSlug}/`))
    return `${seriesSlug}/${normalizedId}`

  return normalizedId
}

export function getBlogPostPath(post: BlogPost) {
  return withBasePath(`/blog/${getBlogPostRouteParam(post)}/`)
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const posts = await getFilteredPosts()
  return getSortedPosts(posts) as BlogPost[]
}

export function getPostSeriesSlug(post: BlogPost) {
  if (post.data.series) return normalizeTaxonomyValue(post.data.series)

  const [first, second] = getBlogPostLegacyRouteParam(post).split('/')
  if (first && second) return normalizeTaxonomyValue(first)

  return undefined
}

export function getPostSeriesMeta(post: BlogPost) {
  const slug = getPostSeriesSlug(post)
  if (!slug) return undefined

  const found = BLOG_SERIES_MAP.get(slug)
  if (found) return found

  return {
    slug,
    title: toTitleCase(slug),
    description: '',
    icon: 'i-ri-article-line',
  } satisfies BlogSeriesMeta
}

export function getPostTags(post: BlogPost) {
  const explicitTags = post.data.tags ?? []
  const fallbackTags = getPostSeriesMeta(post)?.defaultTags ?? []
  const tags = explicitTags.length > 0 ? explicitTags : fallbackTags

  return Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean))).map(
    (tag) => ({
      name: tag,
      slug: normalizeTaxonomyValue(tag),
      path: getTagPath(normalizeTaxonomyValue(tag)),
    })
  )
}

export function getSortedSeriesPosts(posts: BlogPost[]) {
  return [...posts].sort(comparePostsByPublishedDate)
}

export function getSeriesSummaries(posts: BlogPost[]) {
  const grouped = new Map<string, BlogPost[]>()

  posts.forEach((post) => {
    const seriesSlug = getPostSeriesSlug(post)
    if (!seriesSlug) return

    const items = grouped.get(seriesSlug) ?? []
    items.push(post)
    grouped.set(seriesSlug, items)
  })

  return Array.from(grouped.entries())
    .map(([slug, items]) => {
      const meta = BLOG_SERIES_MAP.get(slug) ?? {
        slug,
        title: toTitleCase(slug),
        description: '',
        icon: 'i-ri-article-line',
      }

      const sortedPosts = getSortedSeriesPosts(items)

      return {
        ...meta,
        count: items.length,
        path: getSeriesPath(slug),
        posts: sortedPosts,
        latestPubDate: sortedPosts[0].data.pubDate,
      } satisfies BlogSeriesSummary
    })
    .sort(
      (left, right) =>
        right.latestPubDate.valueOf() - left.latestPubDate.valueOf() ||
        left.title.localeCompare(right.title, 'zh-Hant')
    )
}

export function getTagSummaries(posts: BlogPost[]) {
  const grouped = new Map<string, BlogTagSummary>()

  posts.forEach((post) => {
    getPostTags(post).forEach((tag) => {
      const existing = grouped.get(tag.slug)
      if (existing) {
        existing.count += 1
        return
      }

      grouped.set(tag.slug, {
        name: toTitleCase(tag.name),
        slug: tag.slug,
        count: 1,
        path: tag.path,
      })
    })
  })

  return Array.from(grouped.values()).sort(
    (left, right) =>
      right.count - left.count || left.name.localeCompare(right.name, 'zh-Hant')
  )
}

export async function getSeriesBySlug(seriesSlug: string) {
  const posts = await getAllBlogPosts()
  const normalizedSeriesSlug = normalizeTaxonomyValue(seriesSlug)
  const summary = getSeriesSummaries(posts).find(
    (item) => item.slug === normalizedSeriesSlug
  )

  return summary
}

export async function getPostsByTag(tagSlug: string) {
  const posts = await getAllBlogPosts()
  const normalizedTagSlug = normalizeTaxonomyValue(tagSlug)

  return posts.filter((post) =>
    getPostTags(post).some((tag) => tag.slug === normalizedTagSlug)
  )
}
