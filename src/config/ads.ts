// Google AdSense 手動版位設定（0007 實裝；決策脈絡見 issues/MAP-adsense.md 與 docs/adr/0001）。
// 0004 後台建單元完成後：填入發佈商 ID 與五個 slot ID，並將 enabled 改為 true——
// 站台即開始向 Google 請求廣告（wayfinder 終點）。
export const ADS = {
  /** 啟用真實廣告請求；false 時版位只顯示待命框，不發任何網路請求。 */
  enabled: false,
  /** 發佈商 ID（ca-pub-…）。TODO(0004)：換成真的發佈商 ID。 */
  client: 'ca-pub-XXXXXXXXXXXXXXXX',
  /** 各版位的廣告單元 slot ID。TODO(0004)：後台建單元後依對照表填入。 */
  slots: {
    articleStart: 'TODO-0004-article-start',
    articleEnd: 'TODO-0004-article-end',
    listInline: 'TODO-0004-list-inline',
    railSkyTop: 'TODO-0004-rail-sky-top',
    railSkyBottom: 'TODO-0004-rail-sky-bottom',
  },
} as const

export type AdPlacement = keyof typeof ADS.slots

/** 各版位預留高度（px；0003 定案：可變寬＋固定高防 CLS）。 */
export const AD_HEIGHTS: Record<AdPlacement, number> = {
  articleStart: 90,
  articleEnd: 90,
  listInline: 90,
  railSkyTop: 280,
  railSkyBottom: 280,
}
