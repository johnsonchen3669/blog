---
name: seo-aeo-audit
description: Audit and improve a website's technical SEO and AEO readiness using source code, built HTML, sitemaps, robots rules, structured data, and representative live responses. Use for SEO reviews, indexation problems, metadata or schema changes, crawlability checks, and pre-deployment SEO verification; do not use for keyword-volume research or backlink campaigns.
---

# SEO and AEO Audit

Establish which layer is being evaluated: repository source, current build output,
or the deployed site. Do not treat differences between those layers as a single
site defect.

## Workflow

1. Read the site's framework configuration, content model, shared head/layout,
   routes, deployment target, and build scripts.
2. Build the production site when the user has authorized implementation or
   verification. For this repository, run `bun run build` from the repository
   root.
3. Run the deterministic build audit:

   ```bash
   bun run seo:audit
   ```

   The project script enables the zh-TW market rules via strict flags:

   ```bash
   node .agents/skills/seo-aeo-audit/scripts/audit-built-site.mjs --dir dist \
     --locale zh-TW --require-hreflang --require-llms --require-og-image \
     --require-optimized-images --require-ai-access
   ```

   To inspect another output directory with the generic, non-strict rules:

   ```bash
   node .agents/skills/seo-aeo-audit/scripts/audit-built-site.mjs --dir <output>
   ```

   Strict flags are opt-in. `--locale` enforces `<html lang>` and JSON-LD
   `inLanguage`; `--require-hreflang` enforces self and `x-default` alternates
   on indexable canonical pages; `--require-llms` enforces an `llms.txt`
   summary whose site URLs are canonical and indexable; `--require-og-image`
   enforces OG/Twitter images with dimensions and alt on indexable pages;
   `--require-optimized-images` enforces content images with meaningful alt,
   intrinsic dimensions, lazy loading, and modern local formats such as WebP;
   `--require-ai-access` enforces that robots.txt does not block major AI
   crawlers. A wildcard `User-agent: *` with `Allow: /` already satisfies the
   AI-access rule; individual AI crawlers only matter when explicitly blocked.

4. Inspect representative home, article, collection, noindex, redirect, and 404
   pages. Verify the generated sitemap and robots response rather than assuming
   source configuration produced the intended output.
5. When a public URL is in scope, compare HTTP status, redirects, robots,
   sitemap, and rendered metadata with the local build. External Lighthouse or
   PageSpeed results are supplementary; network or quota failures are not site
   failures.
6. Before making qualitative AEO claims, read
   [the SEO/AEO rubric](references/seo-aeo-rubric.md). Report evidence and avoid
   claiming that a markup change guarantees rankings or AI citations.

## Decisions and boundaries

- Prioritize crawl/indexation contradictions, wrong canonicals, invalid or
  misleading structured data, missing primary metadata, and inaccessible
  content over cosmetic score improvements.
- Structured data must describe visible page content. Do not add FAQ, review,
  author, or freshness claims that the page does not substantiate.
- Preserve the site's intended crawler policy. Do not invent an AI-bot allow or
  deny list without an explicit publishing or training-policy decision.
- Treat title and description length as review signals, not universal character
  limits, especially for CJK text.
- Diagnose only when asked for a review. Apply fixes only when the request
  authorizes changes, then rebuild and rerun the audit.

## Report format

Lead with the result. Group findings by blocking errors, warnings, and verified
strengths. For every issue, identify the affected URL or file, observable
evidence, impact, and smallest appropriate fix. State which checks could not be
run.

The audit script reports four result categories:

- `ERROR`: blocking defects that must be fixed.
- `WARN`: review signals that need human judgment.
- `NOTE (not applicable)`: checks that do not apply to this site and were
  skipped. FAQPage schema is validated only when a page declares it;
  Organization, LocalBusiness, business contact, and location signals are
  publishing-policy decisions and are never forced onto personal sites.
- `PASS`: verified strengths with evidence counts.

Locale and market rules (for example `--locale zh-TW`) apply only when the
project script passes them; the generic audit stays non-strict by default.
