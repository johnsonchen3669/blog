import { getCollection } from 'astro:content'

import { SITE } from '~/config'

import type { CollectionEntry } from 'astro:content'

export function parseTuple(
  tuple: boolean | [boolean, number] | undefined,
  name: string
) {
  if (!tuple || !Array.isArray(tuple) || !tuple[0]) return undefined
  const value = tuple[1]
  if (Number.isInteger(value) && value > 0) return value
  throw new Error(`'${name}' must be a positive integer.`)
}

function getDateKey(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value])
  )
  return `${values.year}-${values.month}-${values.day}`
}

export function isPublished(pubDate: Date, now = new Date()) {
  return pubDate.toISOString().slice(0, 10) <= getDateKey(now, SITE.timezone)
}

export async function getFilteredPosts(): Promise<CollectionEntry<'blog'>[]> {
  return await getCollection('blog', ({ data }) =>
    import.meta.env.PROD ? !data.draft && isPublished(data.pubDate) : true
  )
}

export function getSortedPosts(posts: CollectionEntry<'blog'>[]) {
  return posts.sort(
    (left, right) => right.data.pubDate.valueOf() - left.data.pubDate.valueOf()
  )
}
