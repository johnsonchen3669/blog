#!/usr/bin/env node

import { readdir, readFile } from 'node:fs/promises'
import { relative, resolve, sep } from 'node:path'

// ---------------------------------------------------------------------------
// CLI
//
// Generic audits stay non-strict: only structural correctness is enforced.
// Project scripts opt in to market-specific rules with --locale and
// --require-* flags (see package.json `seo:audit`).
// ---------------------------------------------------------------------------

const args = process.argv.slice(2)

const readOption = (name) => {
  const index = args.indexOf(name)
  if (index === -1) return undefined
  const value = args[index + 1]
  if (value === undefined || value.startsWith('--')) return true
  return value
}
const hasFlag = (name) => args.includes(name)

const dirValue = readOption('--dir')
const outputDir = resolve(typeof dirValue === 'string' ? dirValue : 'dist')

const localeOption = readOption('--locale')
const requirements = {
  locale: typeof localeOption === 'string' ? localeOption : undefined,
  hreflang: hasFlag('--require-hreflang'),
  llms: hasFlag('--require-llms'),
  ogImage: hasFlag('--require-og-image'),
  optimizedImages: hasFlag('--require-optimized-images'),
  aiAccess: hasFlag('--require-ai-access'),
}

const errors = []
const warnings = []
const notApplicable = []
const passed = []
const documents = []
const stats = { hreflang: 0, ogImage: 0, optimizedImages: 0 }

const addError = (file, message) => errors.push({ file, message })
const addWarning = (file, message) => warnings.push({ file, message })
const addNotApplicable = (message) => notApplicable.push({ message })
const addPassed = (message) => passed.push({ message })

// Characters that differ between Traditional and Simplified Chinese; enough
// distinct markers implies Traditional Chinese (zh-TW / zh-Hant) content.
const TRADITIONAL_MARKERS =
  /[這學術網態與開發記錄體檔於時問題會來間點線圖區們後應該說對]/g

// Crawlers used by major AI providers. A wildcard `Allow: /` policy already
// covers them; they only need individual attention when explicitly blocked.
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'CCBot',
  'Applebot-Extended',
  'Bytespider',
  'meta-externalagent',
  'Amazonbot',
]

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = resolve(directory, entry.name)
      return entry.isDirectory() ? walk(path) : [path]
    })
  )
  return files.flat()
}

const extract = (html, pattern) => pattern.exec(html)?.[1]?.trim()
const count = (html, pattern) => Array.from(html.matchAll(pattern)).length

function routeFromFile(file) {
  const path = relative(outputDir, file).split(sep).join('/')
  if (path === 'index.html') return '/'
  if (path.endsWith('/index.html')) return `/${path.slice(0, -10)}`
  return `/${path}`
}

function parseJsonLd(file, html) {
  const scripts = Array.from(
    html.matchAll(
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    )
  )

  if (scripts.length === 0) {
    addError(file, 'Missing JSON-LD structured data')
    return []
  }

  return scripts.flatMap((match) => {
    try {
      return [JSON.parse(match[1])]
    } catch (error) {
      addError(file, `Invalid JSON-LD: ${error.message}`)
      return []
    }
  })
}

const graphNodes = (blocks) =>
  blocks.flatMap((block) =>
    Array.isArray(block?.['@graph']) ? block['@graph'] : [block]
  )

function inspectHtml(file, html) {
  const route = routeFromFile(file)
  const visibleHtml = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/\sdata-code="[^"]*"/gi, '')
    .replace(/\sdata-code='[^']*'/gi, '')
  const redirect = /<meta\b[^>]*http-equiv=["']refresh["']/i.test(html)
  const robots = extract(
    html,
    /<meta\b[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i
  )
  const noindex = /(?:^|,)\s*noindex\s*(?:,|$)/i.test(robots || '')
  const canonical = extract(
    html,
    /<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i
  )
  const hreflangAlternates = Array.from(html.matchAll(/<link\b[^>]*>/gi))
    .map((match) => match[0])
    .filter((tag) => /rel=["']alternate["']/i.test(tag))
    .map((tag) => ({
      hreflang: extract(tag, /hreflang=["']([^"']+)["']/i),
      href: extract(tag, /href=["']([^"']+)["']/i),
    }))
    .filter((alternate) => alternate.hreflang)

  if (redirect) {
    if (!noindex) addError(file, 'Redirect document must be noindex')
    if (!canonical) addError(file, 'Redirect document needs a target canonical')
    if (hreflangAlternates.length > 0)
      addError(file, 'Redirect documents must not declare hreflang alternates')
    return { file, route, redirect, noindex, canonical, isArticle: false }
  }

  const title = extract(html, /<title>([\s\S]*?)<\/title>/i)
  const description = extract(
    html,
    /<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i
  )
  const lang = extract(html, /<html\b[^>]*lang=["']([^"']+)["']/i)
  const ogTitle = extract(
    html,
    /<meta\b[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i
  )
  const ogDescription = extract(
    html,
    /<meta\b[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i
  )
  const ogImage = extract(
    html,
    /<meta\b[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i
  )
  const ogImageWidth = extract(
    html,
    /<meta\b[^>]*property=["']og:image:width["'][^>]*content=["']([^"']*)["']/i
  )
  const ogImageHeight = extract(
    html,
    /<meta\b[^>]*property=["']og:image:height["'][^>]*content=["']([^"']*)["']/i
  )
  const ogImageAlt = extract(
    html,
    /<meta\b[^>]*property=["']og:image:alt["'][^>]*content=["']([^"']*)["']/i
  )
  const twitterTitle = extract(
    html,
    /<meta\b[^>]*name=["']twitter:title["'][^>]*content=["']([^"']*)["']/i
  )
  const twitterDescription = extract(
    html,
    /<meta\b[^>]*name=["']twitter:description["'][^>]*content=["']([^"']*)["']/i
  )
  const twitterImage = extract(
    html,
    /<meta\b[^>]*name=["']twitter:image["'][^>]*content=["']([^"']*)["']/i
  )

  if (!title) addError(file, 'Missing or empty title')
  if (!description) addError(file, 'Missing or empty meta description')
  if (!lang) addError(file, 'Missing document language')
  if (!noindex && !canonical)
    addError(file, 'Indexable page is missing canonical')
  if (count(visibleHtml, /<h1\b[^>]*>/gi) !== 1)
    addError(file, 'Page must contain exactly one h1')
  if (!ogTitle || !ogDescription)
    addError(file, 'Missing Open Graph title or description')
  if (!twitterTitle || !twitterDescription)
    addError(file, 'Missing Twitter title or description')
  if (
    /<meta\b[^>]*property=["']article:modified_time["'][^>]*content=["']\s*["']/i.test(
      html
    )
  )
    addError(file, 'article:modified_time must not be empty')

  const images = Array.from(visibleHtml.matchAll(/<img\b[^>]*>/gi)).map(
    (match) => match[0]
  )
  for (const image of images) {
    if (!/\balt=["'][^"']+["']/i.test(image))
      addError(file, 'Image is missing meaningful alt text')
  }

  const nodes = graphNodes(parseJsonLd(file, html))
  const article = nodes.find((node) => node?.['@type'] === 'BlogPosting')
  if (article) {
    for (const field of [
      'headline',
      'description',
      'datePublished',
      'author',
      'publisher',
      'mainEntityOfPage',
      'inLanguage',
    ]) {
      if (!article[field]) addError(file, `BlogPosting is missing ${field}`)
    }
    if ('dateModified' in article && !article.dateModified)
      addError(file, 'BlogPosting dateModified must not be empty')
  }

  // FAQ schema is optional; only validate when a page actually declares it.
  const faqPage = nodes.find((node) => node?.['@type'] === 'FAQPage')
  if (faqPage) {
    const questions = Array.isArray(faqPage.mainEntity)
      ? faqPage.mainEntity
      : []
    if (questions.length === 0)
      addError(file, 'FAQPage declares no mainEntity questions')
    for (const question of questions) {
      if (question?.['@type'] !== 'Question' || !question.name) {
        addError(
          file,
          'FAQPage mainEntity must contain Question entries with name'
        )
      } else if (!question.acceptedAnswer?.text) {
        addError(
          file,
          `FAQ question "${question.name}" is missing acceptedAnswer text`
        )
      }
    }
    addPassed(`FAQPage schema is valid (${questions.length} questions)`)
  }

  // --- Locale rules (opt-in via --locale) ---
  if (requirements.locale) {
    if (lang !== requirements.locale)
      addError(
        file,
        `html lang must be "${requirements.locale}" (found "${lang || 'missing'}")`
      )
    for (const node of nodes) {
      if (!node || !('inLanguage' in node)) continue
      if (node.inLanguage !== requirements.locale)
        addError(
          file,
          `JSON-LD ${node['@type']} inLanguage must be "${requirements.locale}" (found "${node.inLanguage}")`
        )
    }
  }

  // --- hreflang rules (opt-in via --require-hreflang) ---
  if (noindex && hreflangAlternates.length > 0)
    addError(file, 'noindex pages must not declare hreflang alternates')
  if (requirements.hreflang && !noindex && canonical) {
    const before = errors.length
    const selfLocale = requirements.locale || lang
    const self = hreflangAlternates.find(
      (alternate) => alternate.hreflang === selfLocale
    )
    const xDefault = hreflangAlternates.find(
      (alternate) => alternate.hreflang === 'x-default'
    )
    if (!self)
      addError(
        file,
        `Indexable page is missing self hreflang (${selfLocale || 'locale unknown; pass --locale'})`
      )
    else if (self.href !== canonical)
      addError(file, `hreflang ${selfLocale} must point to the canonical URL`)
    if (!xDefault)
      addError(file, 'Indexable page is missing x-default hreflang')
    else if (xDefault.href !== canonical)
      addError(file, 'hreflang x-default must point to the canonical URL')
    if (errors.length === before) stats.hreflang++
  }

  // --- Social image rules (opt-in via --require-og-image) ---
  if (requirements.ogImage && !noindex) {
    const before = errors.length
    if (!ogImage) addError(file, 'Indexable page is missing og:image')
    if (!twitterImage) addError(file, 'Indexable page is missing twitter:image')
    if (ogImage) {
      if (!ogImageWidth || !ogImageHeight)
        addError(file, 'og:image is missing width or height dimensions')
      if (!ogImageAlt) addError(file, 'og:image is missing alt text')
      if (twitterImage && twitterImage !== ogImage)
        addError(file, 'twitter:image must match og:image')
    }
    if (errors.length === before) stats.ogImage++
  }

  // --- Optimized image rules (opt-in via --require-optimized-images) ---
  if (requirements.optimizedImages) {
    for (const image of images) {
      const before = errors.length
      const src = extract(image, /(?:\b|data-)src=["']([^"']+)["']/i)
      const srcset = extract(image, /srcset=["']([^"']+)["']/i)
      const label = src || 'unknown source'
      if (src && /^https?:\/\//i.test(src))
        addError(file, `Image must be locally hosted: ${label}`)
      const isWebp =
        (src && src.toLowerCase().endsWith('.webp')) ||
        (srcset && srcset.toLowerCase().includes('.webp'))
      if (!isWebp) addError(file, `Image is not served as WebP: ${label}`)
      if (!/\bwidth=["'][^"']+["']/i.test(image))
        addError(file, `Image is missing width: ${label}`)
      if (!/\bheight=["'][^"']+["']/i.test(image))
        addError(file, `Image is missing height: ${label}`)
      if (!/\bloading=["']lazy["']/i.test(image))
        addError(file, `Image is not lazy loaded: ${label}`)
      if (errors.length === before) stats.optimizedImages++
    }
  }

  return {
    file,
    route,
    redirect,
    noindex,
    canonical,
    isArticle: Boolean(article),
  }
}

function inspectSitemap(file, xml) {
  const urls = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((match) =>
    match[1].trim()
  )
  const urlSet = new Set(urls)
  if (urls.length !== urlSet.size)
    addError(file, 'Sitemap contains duplicate URLs')

  const indexableCanonicals = new Map()
  for (const document of documents) {
    if (!document.canonical || document.noindex || document.redirect) continue
    const existing = indexableCanonicals.get(document.canonical)
    if (existing)
      addError(
        document.file,
        `Canonical is duplicated by ${relative(outputDir, existing)}`
      )
    indexableCanonicals.set(document.canonical, document.file)
    if (!urlSet.has(document.canonical))
      addError(document.file, 'Indexable canonical is missing from sitemap')
  }

  const origin = urls[0] ? new URL(urls[0]).origin : undefined
  if (origin) {
    for (const document of documents) {
      if (!document.noindex && !document.redirect) continue
      const sourceUrl = new URL(document.route, `${origin}/`).href
      if (urlSet.has(sourceUrl))
        addError(document.file, 'Noindex or redirect URL appears in sitemap')
    }
  }

  for (const url of urls) {
    if (!indexableCanonicals.has(url))
      addWarning(file, `Sitemap URL has no matching canonical document: ${url}`)
  }

  return { urls, urlSet, origin }
}

function inspectRobots(file, content) {
  const groups = new Map()
  let currentUserAgents = []
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.split('#')[0].trim()
    const match = /^(user-agent|allow|disallow)\s*:\s*(.*)$/i.exec(line)
    if (!match) continue
    const [, field, value] = match
    if (field.toLowerCase() === 'user-agent') {
      const agent = value.trim()
      if (!groups.has(agent)) groups.set(agent, { allow: [], disallow: [] })
      currentUserAgents = [agent]
      continue
    }
    for (const agent of currentUserAgents) {
      const group = groups.get(agent)
      if (!group) continue
      if (field.toLowerCase() === 'allow') group.allow.push(value.trim())
      else group.disallow.push(value.trim())
    }
  }

  const wildcard = groups.get('*')
  if (!wildcard) {
    addError(file, 'robots.txt has no default user-agent policy')
    return
  }
  const siteAllowed = wildcard.allow.some((rule) => rule === '/')
  const siteBlocked =
    wildcard.disallow.some((rule) => rule === '/') && !siteAllowed
  if (siteBlocked)
    addError(file, 'robots.txt wildcard policy blocks the whole site')
  else addPassed('robots.txt wildcard policy allows site crawling')

  if (!/^Sitemap:\s*https?:\/\//im.test(content))
    addError(file, 'robots.txt has no absolute sitemap URL')

  if (requirements.aiAccess) {
    const blocked = AI_CRAWLERS.filter((agent) => {
      const group = groups.get(agent)
      if (!group) return false
      return (
        group.disallow.some((rule) => rule === '/') &&
        !group.allow.some((rule) => rule === '/')
      )
    })
    if (blocked.length > 0)
      addError(
        file,
        `AI crawlers are blocked by robots.txt: ${blocked.join(', ')}`
      )
    else
      addPassed(
        'Major AI crawlers are allowed (wildcard policy or explicit Allow rules)'
      )
  }
}

function inspectLlmsTxt(file, content) {
  const lines = content.split(/\r?\n/)
  const firstContentLine = lines.find((line) => line.trim().length > 0)
  if (!/^#\s+\S/.test(firstContentLine || ''))
    addError(file, 'llms.txt must start with a level-1 heading')
  else addPassed('llms.txt starts with a level-1 heading')

  if (!lines.slice(0, 15).some((line) => /^>\s*\S/.test(line)))
    addError(file, 'llms.txt is missing a summary blockquote')
  else addPassed('llms.txt has a summary blockquote')

  if (requirements.locale && /^zh/i.test(requirements.locale)) {
    const markers = new Set(content.match(TRADITIONAL_MARKERS) ?? [])
    if (markers.size < 5)
      addError(
        file,
        'llms.txt does not appear to contain Traditional Chinese text for a zh locale'
      )
    else
      addPassed(
        `llms.txt contains Traditional Chinese text (${markers.size} distinct markers)`
      )
  }
}

function inspectLlmsUrls(llmsFile, content, sitemap) {
  const validUrls = new Set()
  const addValid = (url) => {
    if (!url) return
    const withoutHash = url.split('#')[0]
    validUrls.add(withoutHash)
    if (withoutHash.endsWith('/')) validUrls.add(withoutHash.replace(/\/$/, ''))
    else validUrls.add(`${withoutHash}/`)
  }

  if (sitemap) sitemap.urls.forEach((url) => addValid(url))
  for (const document of documents) {
    if (document.noindex || document.redirect || !document.canonical) continue
    addValid(document.canonical)
  }
  // Feed endpoints are valid llms.txt targets even though they are not in
  // the sitemap.
  if (sitemap?.origin) {
    addValid(new URL('rss.xml', `${sitemap.origin}/`).href)
    addValid(new URL('atom.xml', `${sitemap.origin}/`).href)
  }

  const origin = sitemap?.origin
  if (!origin) {
    addWarning(
      llmsFile,
      'Cannot validate llms.txt URLs without a sitemap origin'
    )
    return
  }

  const urls = Array.from(content.matchAll(/https?:\/\/[^\s)\]>"']+/g)).map(
    (match) => match[0]
  )
  const llmsUrls = new Set()
  const addLlmsUrl = (url) => {
    llmsUrls.add(url)
    if (url.endsWith('/')) llmsUrls.add(url.replace(/\/$/, ''))
    else llmsUrls.add(`${url}/`)
  }
  for (const url of urls) {
    try {
      const parsed = new URL(url)
      addLlmsUrl(`${parsed.origin}${parsed.pathname}`)
    } catch {
      // Malformed URLs are reported by the siteUrls validation below.
    }
  }
  const siteUrls = urls
    .map((url) => {
      try {
        return new URL(url)
      } catch {
        return null
      }
    })
    .filter((url) => url && url.origin === origin)

  const invalid = siteUrls.filter(
    (url) => !validUrls.has(`${url.origin}${url.pathname}`)
  )
  if (invalid.length > 0)
    for (const url of invalid)
      addError(
        llmsFile,
        `llms.txt links to a non-canonical or non-indexable URL: ${url.href}`
      )
  else
    addPassed(
      `llms.txt site URLs (${siteUrls.length}) are canonical and indexable`
    )

  const missingArticles = documents.filter(
    (document) =>
      document.isArticle &&
      !document.noindex &&
      !document.redirect &&
      document.canonical &&
      !llmsUrls.has(document.canonical)
  )
  for (const document of missingArticles)
    addError(
      document.file,
      'Published article canonical URL is missing from llms.txt'
    )
  if (missingArticles.length === 0)
    addPassed('llms.txt lists every published article canonical URL')
}

try {
  const files = await walk(outputDir)
  const htmlFiles = files.filter((file) => file.endsWith('.html'))
  const sitemapFile = files.find((file) => file.endsWith('/sitemap.xml'))
  const robotsFile = files.find((file) => file.endsWith('/robots.txt'))
  const llmsFile = files.find((file) => file.endsWith('/llms.txt'))

  if (htmlFiles.length === 0) addError(outputDir, 'No HTML files found')
  for (const file of htmlFiles)
    documents.push(inspectHtml(file, await readFile(file, 'utf8')))

  let sitemap
  if (!sitemapFile) addError(outputDir, 'Missing sitemap.xml')
  else
    sitemap = inspectSitemap(sitemapFile, await readFile(sitemapFile, 'utf8'))

  if (!robotsFile) addError(outputDir, 'Missing robots.txt')
  else inspectRobots(robotsFile, await readFile(robotsFile, 'utf8'))

  if (requirements.llms) {
    if (!llmsFile) addError(outputDir, 'Missing llms.txt')
    else {
      const content = await readFile(llmsFile, 'utf8')
      inspectLlmsTxt(llmsFile, content)
      inspectLlmsUrls(llmsFile, content, sitemap)
    }
  }

  addNotApplicable(
    'FAQPage schema is optional; it is validated only when a page declares it'
  )
  addNotApplicable(
    'Business, contact, and location signals (Organization, LocalBusiness, contact points) depend on publishing policy; review manually when the site represents a business or public entity'
  )
  if (requirements.hreflang && stats.hreflang > 0)
    addPassed(
      `hreflang self + x-default verified on ${stats.hreflang} indexable canonical pages`
    )
  if (requirements.ogImage && stats.ogImage > 0)
    addPassed(
      `OG/Twitter images with dimensions, alt, and matching URLs verified on ${stats.ogImage} indexable pages`
    )
  if (requirements.optimizedImages && stats.optimizedImages > 0)
    addPassed(
      `${stats.optimizedImages} content images verified (meaningful alt, dimensions, lazy loading, local WebP)`
    )
} catch (error) {
  addError(outputDir, error.message)
}

for (const finding of errors)
  console.error(
    `ERROR ${relative(process.cwd(), finding.file)}: ${finding.message}`
  )
for (const finding of warnings)
  console.warn(
    `WARN  ${relative(process.cwd(), finding.file)}: ${finding.message}`
  )
for (const finding of notApplicable)
  console.log(`NOTE  (not applicable) ${finding.message}`)
for (const finding of passed) console.log(`PASS  ${finding.message}`)

console.log(
  `SEO audit: ${documents.length} HTML files, ${errors.length} errors, ${warnings.length} warnings, ${notApplicable.length} not applicable, ${passed.length} passed`
)
if (errors.length > 0) process.exitCode = 1
