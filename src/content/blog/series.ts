import type { Icon } from '~/types'

export interface BlogSeriesMeta {
  slug: string
  title: string
  description: string
  icon: Icon
  featured?: boolean
  defaultTags?: string[]
}

export const BLOG_SERIES: BlogSeriesMeta[] = [
  {
    slug: 'angular-training',
    title: 'Angular 鐵人賽',
    description: '30 篇整理 Angular 從基礎語法到實作觀念的系列文章。',
    icon: 'i-vscode-icons-file-type-angular',
    featured: true,
    defaultTags: ['angular', 'angular-training'],
  },
]

export const BLOG_SERIES_MAP = new Map(
  BLOG_SERIES.map((series) => [series.slug, series])
)
