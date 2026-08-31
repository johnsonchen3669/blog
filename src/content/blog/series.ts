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
    title: 'Angular 新手練功日誌：從零到職場冒險',
    description: '30 篇整理 Angular 從基礎語法到實作觀念的系列文章。',
    icon: 'i-vscode-icons-file-type-angular',
    featured: true,
    defaultTags: ['angular', 'angular-training'],
  },
  {
    slug: 'typescript',
    title: '從 JavaScript 到 TypeScript：30 天建立 AI 時代的型別思維',
    description:
      '用 30 天從 JavaScript 走進 TypeScript，建立能與 AI 協作、也能自行驗證的型別思維。',
    icon: 'i-vscode-icons-file-type-typescript-official',
    featured: true,
    defaultTags: ['typescript', 'javascript', 'ai'],
  },
]

export const BLOG_SERIES_MAP = new Map(
  BLOG_SERIES.map((series) => [series.slug, series])
)
