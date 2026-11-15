---
title: '實作：AdSlot 元件與載入時機整合進版面'
labels: [wayfinder:task]
state: closed
assignee: goose
parent: MAP-adsense.md
blocked_by: [0002-research-adsense-modern-integration, 0003-prototype-ad-placements, 0004-adsense-ad-units]
---

## Question

依「[原型：版位與待命廣告元件的樣張](0003-prototype-ad-placements.md)」定案的樣張與研究票的規範結論實裝（AFK 可做）：

1. 廣告元件（待命 → 進入視窗才 push adsbygoogle），接真發佈商 ID 與各版位 slot ID。
2. 預留空間避免 CLS；四個版位接進對應版面（文章模板、列表每 5 篇穿插、底部定位錨點含關閉鈕）。
3. AdBlock 白名單提示元件（低調、可關閉）。
4. 遵守 repo 的 `AGENTS.md`：變更需通過 `bun run check` / `lint` / `format` / `build`。

完成時記錄：新增的元件與檔案清單、版位接線對照、本地驗證方式。

## Resolution

✅ 完成（commit `8a66d03`，main）。票面第 2 點「底部定位錨點含關閉鈕」與第 3 點 AdBlock 提示已被後續定案取代：0009 改制 sticky rail（非浮動錨點、隨頁面捲動，無需關閉鈕）；0003 Res.5 AdBlock 提示不做。

**新增檔案**

- `src/config/ads.ts` —— `ADS`（enabled／client／5 個 slot）＋`AD_HEIGHTS`（90/280px）。slot ID 為 `TODO-0004-*` 佔位、`enabled: false`（0004 拿到真 ID 後填入並改 `true` 即開始請求）。
- `src/styles/ads.css` —— 變體 A「待命線框」樣式＋sticky rail（僅 `(min-width:1100px) and (min-height:600px) and (hover:hover) and (pointer:fine)` 啟用）＋`@media print` 隱藏。
- `src/scripts/ads-client.ts` —— 待命載入 client（行為見下）。
- `src/components/ads/AdSlot.astro` —— 版位元件（預留框＋Sponsored Links 角標＋待命句）。
- `src/components/ads/AdRail.astro` —— sticky rail（兩個單元上格／下格）。

**版位接線對照**

| placement | slot（0004 後填真 ID） | 接線位置 | 高 |
| --- | --- | --- | --- |
| articleStart | TODO-0004-article-start | RenderPost：post-header 後、post-layout 前 | 90px |
| articleEnd | TODO-0004-article-end | RenderPost：post-layout 後、PostNavigation 前 | 90px |
| listInline | TODO-0004-list-inline | BlogPostList：每 5 篇穿插、末篇後不插（涵蓋 /blog、/series/*、/tags/*，首頁不含） | 90px |
| railSkyTop | TODO-0004-rail-sky-top | AdRail（post-layout 右 margin）上格 | 280px |
| railSkyBottom | TODO-0004-rail-sky-bottom | AdRail 下格 | 280px |

**載入行為**（依 0002 研究結論）

- IntersectionObserver（rootMargin 200px）捲動接近才插入 `<ins class="adsbygoogle">`＋`push({})`，每單元只 push 一次；無 display:none 前置。
- `data-ad-format="auto"`＋`data-full-width-responsive="true"`；預留空間可變寬＋固定高（`--ad-height`，0003 Res.2 防 CLS）。
- 25s 後 `adStatus === 'unfilled'` → 保留空間顯示「此版位目前沒有廣告」；腳本載入失敗（攔截擴充）同此處理，不提示、不打擾。
- `ADS.enabled === false` 時不發任何請求（待命框仍顯示）。

**code-review 後修正**：`min-height`→`height` 固定高、`showCopy`→`showFallback`、內聯 cssText 收進 `.ad-slot__ins`、砍無呼叫端的 `class?` prop、列表 magic 5 命名 `LIST_AD_EVERY`、ADR 0001 加 Amendment（rail 容器採 margin 內絕對定位＝既有 `.post-toc` 同款技術，與 0009 字面「文檔流內」的落差已備案）。

**四道關卡**（2026-11-15）：check 0 errors、lint 過、format 過、build ✓。

**本地驗證**：`vp run dev` 開任一文章或 `/blog`——可見虛線待命框＋Sponsored Links 角標＋待命句；大螢幕（≥1100×600）文章頁右 margin 可見 sticky rail 兩格。0004 填入真 ID＋`enabled: true` 後捲動至版位即發出請求（Network 過濾 `googlesyndication`）。
