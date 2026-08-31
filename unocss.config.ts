import { defineConfig, presetAttributify, presetWind3 } from 'unocss'
import presetIcons from '@unocss/preset-icons'
import { transformerDirectives, transformerVariantGroup } from 'unocss'

import { BLOG_SERIES } from './src/content/blog/series'
import { UI } from './src/config'

const configuredIcons = [
  ...UI.internalNavs.flatMap((item) => ('icon' in item ? [item.icon] : [])),
  ...UI.socialLinks.flatMap((item) => ('icon' in item ? [item.icon] : [])),
  ...BLOG_SERIES.map((series) => series.icon),
]

export default defineConfig({
  content: {
    filesystem: ['./src/**/*.{astro,html,js,ts,md,mdx}'],
  },
  theme: {
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      lgp: '1128px',
      xl: '1280px',
    },
  },
  shortcuts: [
    [
      /^(\w+)-transition$/,
      ([, property]) =>
        `transition-${property === 'op' ? 'opacity' : property} duration-200 ease-out`,
    ],
    [
      'focus-ring',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    ],
  ],
  presets: [
    presetWind3(),
    presetAttributify(),
    presetIcons({
      collectionsNodeResolvePath: process.cwd(),
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  safelist: [
    ...configuredIcons,
    'i-ri-menu-2-fill',
    'i-ri-arrow-up-line',
    'i-ri-search-line',
    'i-ri-rss-line',
    'i-ri-sun-line',
    'i-ri-moon-line',
  ],
})
