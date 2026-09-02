# SEO and AEO Review Rubric

Read this reference for a qualitative audit after deterministic build checks.

## Evidence priority

1. Deployed HTTP status, headers, robots, sitemap, and returned HTML.
2. Production build output.
3. Source configuration and content.
4. External audit tools and search-engine observations.

Call out version drift when these layers disagree. Use current primary guidance
from Google Search documentation and Schema.org when validation rules may have
changed.

## Technical SEO

- Crawlability: important content is present in initial HTML; robots and hosting
  controls do not accidentally block it. `User-agent: *` with `Allow: /` counts
  as allowing both normal and AI crawlers; only explicit blocks of major AI
  crawlers (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot,
  Google-Extended, CCBot, Applebot-Extended, Bytespider, meta-externalagent,
  Amazonbot, and peers) contradict an open AI-access policy.
- Indexation: canonical, robots directives, redirects, HTTP status, internal
  links, and sitemap membership agree.
- Page identity: one descriptive title, description, canonical, language, and
  primary heading identify each indexable page.
- Language and market: when a target locale is declared, `<html lang>` and
  JSON-LD `inLanguage` agree with it, indexable canonical pages expose self
  (for example `zh-TW`) and `x-default` hreflang alternates pointing at their
  own canonical, and noindex, redirect, or canonical-less pages declare no
  hreflang at all. A single-language site should not invent alternate locales.
- LLM discoverability: `llms.txt` (when published) starts with a level-1
  heading, carries a Traditional Chinese summary blockquote for zh locales,
  lists the main entries and every published canonical article with useful
  descriptions, and only links absolute site URLs that are canonical,
  indexable, or valid feed endpoints. Link it from pages with
  `rel="describedby"`.
- Structured data: valid JSON-LD uses appropriate types and stable entity IDs;
  article author, dates, image, language, and page relationships match visible
  content. `Person` is the correct top entity for personal sites; add
  `sameAs` profiles and city-level location only when they describe reality —
  never invent an Organization, LocalBusiness, street address, phone, or email
  to satisfy a checklist.
- Discovery: canonical articles and useful collections appear once in the
  sitemap; redirect, error, duplicate, and noindex URLs do not.
- Media: meaningful images have useful alternatives and share images expose
  usable dimensions and descriptions. Indexable pages should expose OG and
  Twitter images with width, height, alt, and matching URLs. Content images
  should be locally hosted, served in a modern format such as WebP, carry
  intrinsic dimensions, and lazy-load. External hotlinked article images lose
  control over availability and caching; prefer local assets.
- Performance: evaluate real Core Web Vitals where data exists. Do not present a
  lab score or unavailable API result as field performance.

## Applicability

Not every checklist item applies to every site. Before reporting a defect,
decide whether the site type can or should satisfy it:

- FAQPage: validate structure only when present; never require fabricated
  questions.
- Organization, LocalBusiness, opening hours, street addresses, phone numbers,
  and contact pages: manual-review items that depend on whether the site
  represents a business or public entity. Personal technical blogs satisfy
  entity needs with `Person` plus public profiles.
- hreflang: only meaningful for genuinely localized content; a monolingual
  site may still expose self plus `x-default` for locale targeting.

## AEO readiness

- The full answer is crawlable without client-side interaction.
- Headings and semantic containers make topic boundaries understandable.
- Important questions receive concise, direct answers before extended detail.
- Claims, examples, dates, authorship, and sources are clear enough to verify.
- Related articles and series provide useful internal context rather than
  duplicate doorway pages.
- Schema reinforces visible meaning; it is not a substitute for answer quality.

Do not promise inclusion in AI answers. Describe these checks as improving
machine comprehension, retrievability, and citation readiness.
