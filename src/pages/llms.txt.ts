import { SITE } from '~/config'
import {
  getAllBlogPosts,
  getBlogPostPath,
  getSeriesSummaries,
} from '~/utils/blog'
import { withBasePath } from '~/utils/path'

export const prerender = true

const absoluteUrl = (path: string) =>
  new URL(withBasePath(path), SITE.website).href

const formatPostLine = (
  post: Awaited<ReturnType<typeof getAllBlogPosts>>[number]
) => {
  const description = post.data.description.trim()
  return `- [${post.data.title}](${absoluteUrl(getBlogPostPath(post))})${
    description ? `：${description}` : ''
  }`
}

export async function GET() {
  const posts = await getAllBlogPosts()
  const publishablePosts = posts.filter((post) => !post.data.redirect)
  const series = getSeriesSummaries(publishablePosts)
  const seriesPosts = new Set(
    series.flatMap((item) => item.posts.map((post) => post.id))
  )
  const standalonePosts = publishablePosts.filter(
    (post) => !seriesPosts.has(post.id)
  )

  const lines: string[] = [
    `# ${SITE.title}`,
    '',
    `> ${SITE.description}`,
    '',
    '一個位於台灣桃園的個人技術網站，內容以繁體中文撰寫，聚焦前端開發實作、TypeScript 型別設計與 Angular 學習路線，並整理可直接應用於專案的範例、除錯紀錄與架構思考。',
    '',
    '## 主要入口',
    '',
    `- [首頁](${absoluteUrl('/')})：網站簡介與最新文章。`,
    `- [Blog](${absoluteUrl('/blog/')})：所有文章的完整索引。`,
    `- [Series](${absoluteUrl('/series/')})：依主題整理的系列文章。`,
    `- [Tags](${absoluteUrl('/tags/')})：依標籤分類的文章。`,
    `- [RSS](${absoluteUrl('/rss.xml')})：訂閱最新文章。`,
    '',
    '## 系列',
    '',
  ]

  series.forEach((item) => {
    const description = item.description.trim()
    lines.push(
      `- [${item.title}](${absoluteUrl(item.path)})${
        description ? `：${description}` : ''
      }（${item.count} 篇）`
    )
  })

  if (standalonePosts.length > 0) {
    lines.push('', '## 獨立文章', '')
    standalonePosts.forEach((post) => lines.push(formatPostLine(post)))
  }

  series.forEach((item) => {
    lines.push('', `## ${item.title}`, '')
    item.posts.forEach((post) => lines.push(formatPostLine(post)))
  })

  lines.push(
    '',
    '## 授權與聯絡',
    '',
    `- 內容作者：${SITE.author}。`,
    `- GitHub：${SITE.profiles.join('、')}。`,
    '- 文章內容以繁體中文撰寫，引用時請保留出處與原文連結。',
    ''
  )

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
