import { SITE } from '~/config'
import { withBasePath } from '~/utils/path'

export const prerender = true

export function GET() {
  const sitemap = new URL(withBasePath('/sitemap.xml'), SITE.website).href
  const body = `User-agent: *\nAllow: /\nSitemap: ${sitemap}\n`

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
