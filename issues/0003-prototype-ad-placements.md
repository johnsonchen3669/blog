---
title: '原型：版位與待命廣告元件的樣張'
labels: [wayfinder:prototype]
state: closed
assignee: goose
parent: MAP-adsense.md
blocked_by: []
---

## Question

做一個便宜、粗糙、可互動的樣張，讓使用者對「版位＋待命載入＋AdBlock 提示」有具體的東西可以反應。範圍：

- 文章開頭與結尾的廣告框
- 文章列表每 5 篇穿插一個廣告（涵蓋哪些列表——`/blog`、`/series`、首頁——在此一併定案）
- 第四版位依「[底部定位錨點的合規界線與去留](0009-anchor-placement-compliance.md)」的 Resolution 呈現＝**sticky rail 廣告**（照 Ray 方案）：in-flow 容器＋`position:sticky; top:6rem`，僅大螢幕（≥1100×600、fine pointer）啟用 sticky，小螢幕回流頁內區塊；rail 佔位高 280px（視窗高 ≥600px 時 500–600px）；禁止 fixed／浮動覆蓋。若文章版面無側欄，rail 放內容區兩側留白，寬度不足整段省略。
- 各版位的格式與尺寸策略（auto／可變寬＋固定高／固定尺寸）在此一併定案
- 「待命」狀態視覺（對齊 Ray 部落格的「廣告版位已待命，捲動至版位後開始」），與進入視窗後的廣告框佔位
- AdBlock 白名單提示的低調版（可關閉、不擋內容；文案、偵測方式與出現時機在此一併定案）

不接真 AdSense，用假資料／佔位框。產出以 asset 連結掛在票上。載入行為的細節須對照「[研究：AdSense 現代整合的官方規範與 Astro 實作選項](0002-research-adsense-modern-integration.md)」的 Resolution：捲動接近才插入 `<ins>`＋push、禁用 display:none 前置。

## 樣張（已就緒，待使用者挑變體）

程式碼：`src/components/prototype/ad-placements/`（PROTOTYPE 標記、dev-only、掛在既有頁面，定案後整個資料夾刪除；樣張實作含假待命載入生命週期 waiting→loading→filled，真實 `<ins>`＋`push` 留給 0007）。

執行：`vp run dev` 後開文章頁（任一 `/blog/<slug>/`）或列表頁（`/blog/`、`/series/<slug>/`、`/tags/<tag>/`），網址加 `?variant=A|B|C`（或用底部黑色 pill 切換器／鍵盤 ← →）。

三個結構截然不同的變體：

| 變體 | 版位框 | 尺寸策略 | rail | AdBlock 提示 |
|---|---|---|---|---|
| **A 待命線框**（Ray 式極簡） | 虛線細框＋角落小標 Sponsored Links | auto＋full-width-responsive，可變寬＋固定高（90px／rail 280px） | 右 margin sticky，280px×2 疊放 | 頁尾一行 mono 小字 |
| **B 標示面板**（高明確度） | 實線框＋Advertisements 標題列＋? 說明 | 固定尺寸矩形思維（336×280／rail 300×250×2） | 右 margin sticky，面板卡×2 | 結尾說明列（含隱私權連結） |
| **C 無框融入**（最低調） | 無框、頂部色帶＋小標 | auto＋full-width-responsive，可變寬＋固定高（72px／rail 160×600 塔） | 右 margin sticky，單一 600px 塔 | 右下浮動小 pill |

待定案項（挑完變體即可定）：①版位格式與尺寸策略＝該變體的策略；②AdBlock 提示文案／時機＝該變體的形式（偵測方式：`adsbox` bait 元素＋切換器手動模擬兩用）。

已先定案：列表穿插涵蓋所有走 `BlogPostList` 的列表（`/blog`、`/series/*`、`/tags/*`）；**首頁無文章列表，不含穿插版位**。

## Resolution

**定案：變體 A「待命線框」勝出**（grilling 逐項定案如下）：

1. **版位變體＝A 待命線框**：虛線細框＋角落小標 Sponsored Links、可變寬＋固定高——Ray 式極簡，最符合「盡量不影響閱讀」底線。
2. **格式與尺寸策略**：`data-ad-format="auto"`＋`data-full-width-responsive="true"`，容器可變寬＋固定高預留空間防 CLS——文章開頭／結尾／列表穿插＝90px 高橫幅；定位錨點 rail＝280px 高×2（上格／下格）。
3. **文案定稿**：角標「Sponsored Links」（合規僅 Advertisements／Sponsored Links）、待命句「廣告版位已待命，捲動至版位後開始。」、無廣告句「此版位目前沒有廣告」（unfilled 時保留空間不收合，防 CLS 位移）。
4. **列表穿插涵蓋**：所有走 `BlogPostList` 的列表（`/blog`、`/series/*`、`/tags/*`）；首頁無文章列表，不含。
5. **AdBlock 白名單提示：不做**（使用者：「不用提醒，不要干擾別人」）——已自 MAP 與範圍移除；樣張中的提示變體僅留作對照，實裝不含。
6. **定位錨點＝兩個廣告單元**（上格／下格，照 Ray 的 `railSkyTop`/`railSkyBottom`），收益報表分開看；「Fill empty in-page ads」後台一律**關閉**（見 0004）。

樣張程式（`src/components/prototype/ad-placements/`）為 throwaway 主證：實裝（0007）時把變體 A fold 進真實程式碼，變體 B/C 與切換器移出 main（throwaway branch）。
