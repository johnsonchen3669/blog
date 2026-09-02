import type { Features, Site, Ui } from './types'

export const SITE: Site = {
  website: 'https://johnsonchen.dev/',
  base: '/',
  title: 'Johnson Chen',
  description:
    '前端開發實作、TypeScript 型別設計與 Angular 學習路線，整理可直接應用於專案的範例、除錯紀錄與架構思考。',
  author: 'Johnson Chen',
  lang: 'zh-TW',
  ogLocale: 'zh_TW',
  timezone: 'Asia/Taipei',
  profiles: ['https://github.com/johnsonchen3669'],
  location: {
    locality: 'Taoyuan City',
    countryCode: 'TW',
  },
  imageDomains: ['cdn.bsky.app', 'images.unsplash.com'],
}

export const UI: Ui = {
  internalNavs: [
    { path: '/blog', title: 'Blog', displayMode: 'alwaysText', text: 'Blog' },
    {
      path: '/series',
      title: 'Series',
      displayMode: 'alwaysText',
      text: 'Series',
    },
  ],
  socialLinks: [
    {
      link: 'https://github.com/johnsonchen3669',
      title: 'Johnson Chen on GitHub',
      displayMode: 'alwaysIcon',
      icon: 'i-uil-github-alt',
    },
  ],
  navBarLayout: {
    left: [],
    right: ['internalNavs', 'searchButton', 'themeButton', 'rssLink'],
    mergeOnMobile: false,
  },
  tabbedLayoutTabs: false,
  groupView: { maxGroupColumns: 2, showGroupItemColorOnHover: false },
  githubView: {
    monorepos: [],
    mainLogoOverrides: [],
    subLogoMatches: [],
  },
  externalLink: { newTab: false, cursorType: '', showNewTabIcon: false },
  postMetaStyle: 'minimal',
}

export const FEATURES: Features = {
  slideEnterAnim: false,
  ogImage: false,
  toc: [
    true,
    {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
      displayPosition: 'right',
      displayMode: 'content',
    },
  ],
  share: false,
  giscus: false,
  search: [
    true,
    {
      includes: ['blog'],
      filter: true,
      navHighlight: true,
      batchLoadSize: [true, 5],
      maxItemsPerPage: [true, 5],
    },
  ],
}
