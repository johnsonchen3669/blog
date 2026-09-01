import { z } from 'astro/zod'

/* Pages*/
export const pageSchema = z.object({
  title: z
    .string()
    .default('')
    .describe(
      'Sets the page title, formatted with `SITE.title` as `<pageTitle> - <siteTitle>` for metadata and automatic OG image generation. If undefined or empty, only `<siteTitle>` is displayed, and OG image generation is skipped.'
    ),
  subtitle: z
    .string()
    .default('')
    .describe(
      'Provides a page subtitle. If provided, it will be displayed below the title. If not needed, leave the field as an empty string or delete it.'
    ),
  description: z
    .string()
    .default('')
    .describe(
      'Provides a brief description, used in meta tags for SEO and sharing purposes. If not needed, leave the field as an empty string or delete it, and the `SITE.description` will be used directly.'
    ),
  toc: z
    .boolean()
    .default(false)
    .describe(
      'Controls whether the table of contents (TOC) is generated for the page.'
    ),
  ogImage: z
    .union([z.string(), z.boolean()])
    .default(true)
    .describe(
      'Specifies the Open Graph (OG) image for social media sharing. To auto-generate OG image, delete the field or set to `true`. To disable it, set the field to `false`. To use a custom image, provide the full filename from `/public/og-images/`.'
    ),
})

export type PageSchema = z.infer<typeof pageSchema>

/* Posts */
export const postSchema = z.object({
  title: z
    .string()
    .max(60)
    .describe(
      "**Required**. Sets the post title, limited to **60 characters**. This follows Moz's recommendation, ensuring approximately 90% of titles display correctly in SERPs and preventing truncation on smaller screens or social platforms. [Learn more](https://moz.com/learn/seo/title-tag)."
    ),
  subtitle: z
    .string()
    .default('')
    .describe(
      'Provides a post subtitle. If provided, it will be displayed below the title. If not needed, leave the field as an empty string or delete it.'
    ),
  description: z
    .string()
    .default('')
    .describe(
      'Provides a brief description, used in meta tags for SEO and sharing purposes. If not needed, leave the field as an empty string or delete it, and the `SITE.description` will be used directly.'
    ),
  slug: z
    .string()
    .optional()
    .describe(
      'Overrides the default URL segment used for this post. Recommended for new posts that need descriptive, SEO-friendly URLs.'
    ),
  series: z
    .string()
    .optional()
    .describe(
      'Groups the post into a series. Recommended for grouped tutorials or multi-part posts. If omitted, the post is treated as a standalone article unless inferred by folder structure.'
    ),
  order: z
    .number()
    .int()
    .positive()
    .optional()
    .describe(
      'Records the intended lesson number for a series. Article lists are sorted by publication date.'
    ),
  tags: z
    .array(z.string().min(1))
    .default([])
    .describe(
      'Defines the post tags used for filtering, navigation and topic grouping. Use short, stable names to keep tag URLs manageable.'
    ),
  pubDate: z.coerce
    .date()
    .describe(
      '**Required**. Specifies the publication date. See supported formats [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse#examples).'
    ),
  lastModDate: z
    .union([z.coerce.date(), z.literal('')])
    .optional()
    .describe(
      'Tracks the last modified date. If not needed, leave the field as an empty string or delete it.'
    ),
  minutesRead: z
    .number()
    .optional()
    .describe(
      'Provides an estimated reading time in minutes. To auto-generate, delete the field; to hide it on the page, enter 0'
    ),
  radio: z
    .boolean()
    .default(false)
    .describe(
      'Indicates if the post includes audio content or links to an external audio source. If `true`, an icon will be added to the post item in the list.'
    ),
  video: z
    .boolean()
    .default(false)
    .describe(
      'Indicates if the post includes video content or links to an external video source. If `true`, an icon will be added to the post item in the list.'
    ),
  platform: z
    .string()
    .default('')
    .describe(
      'Specifies the platform where the audio or video content is published. If provided, the platform name will be displayed. If not needed, leave the field as an empty string or delete it.'
    ),
  ogImage: z
    .union([z.string(), z.boolean()])
    .default(true)
    .describe(
      'Specifies the Open Graph (OG) image for social media sharing. To auto-generate OG image, delete the field or set to `true`. To disable it, set the field to `false`. To use a custom image, provide the full filename from `/public/og-images/`.'
    ),
  toc: z
    .boolean()
    .default(true)
    .describe(
      'Controls whether the table of contents (TOC) is generated for the post.'
    ),
  share: z
    .boolean()
    .default(true)
    .describe('Controls whether social sharing is available for the post.'),
  giscus: z
    .boolean()
    .default(true)
    .describe('Controls whether Giscus comments are available for the post.'),
  search: z
    .boolean()
    .default(true)
    .describe(
      'Defines a URL to redirect the post. If not needed, delete the field or set to `false`'
    ),
  redirect: z
    .url({ error: 'Invalid url.' })
    .optional()
    .describe('Defines a URL to redirect the post.'),
  draft: z
    .boolean()
    .default(false)
    .describe(
      'Marks the post as a draft. If `true`, it is only visible in development and excluded from production builds.'
    ),
})

export type PostSchema = z.infer<typeof postSchema>
