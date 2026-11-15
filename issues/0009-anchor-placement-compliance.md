---
title: '底部定位錨點的合規界線與去留'
labels: [wayfinder:grilling]
state: closed
assignee: goose
parent: MAP-adsense.md
blocked_by: []
---

## Question

研究票警訊：AdSense 政策明文禁止 floating box script 放廣告，且浮動框貼近導覽易觸 accidental clicks（[acceptable modifications](https://support.google.com/adsense/answer/48182)）。這對目的地的第四版位「底部定位錨點」（對齊 Ray 的浮動版位設計）構成合規疑慮。與使用者 grilling 定案去留：

1. **(a) 放棄第四版位**：維持三個版位（文章開頭、文章結尾、列表穿插）。
2. **(b) 改為非浮動頁內版位**：底部定位錨點改為頁尾上方的固定頁內區域（不 sticky、不覆蓋內容），仍是四個版位。
3. **(c) 查證官方 anchor 格式後再定**：先確認 AdSense 是否提供官方 anchor 廣告格式與手動取得方式（若只屬 Auto Ads——已在範圍外——則此路不通）。

定案後同步更新地圖的 Destination 與「[原型：版位與待命廣告元件的樣張](0003-prototype-ad-placements.md)」的樣張範圍。

## Resolution

**定案：照 Ray 的實際實作走——第四版位維持，但改為「側欄 sticky rail 廣告」，不是浮動框。**（使用者：「ray 是用哪個，我就先照那方案去做」）

逆向 Ray 站（israynotarray.com）實作確認的事實：

- **Ray 的「定位錨點」＝ CSS `position:sticky` 的側欄 rail 廣告**（`railSkyTop` / `railSkyBottom` 兩個手動廣告單元，`sticky top:6rem` / `sticky top-24`），置於文檔流內的側欄容器中，**全站沒有任何 `position:fixed` 或浮動覆蓋式廣告**。
- sticky 僅在大螢幕啟用：`@media (min-width:1100px) and (min-height:600px) and (hover:hover) and (pointer:fine)`；小螢幕回流為一般頁內區塊。
- 廣告以自製 `AdSlot` 元件待命懶載入：先渲染「廣告版位已待命，捲動至版位後開始」佔位，捲動接近才插入 `<ins class="adsbygoogle">`＋`push({})`，格式 `data-ad-format="auto"`＋`data-full-width-responsive="true"`。

為何合規：floating box script 禁令針對的是**腳本驅動的浮動／覆蓋框**（follow scroll、蓋住內容、貼近導覽易觸 accidental clicks）。`position:sticky` 是純 CSS 佈局——容器在文檔流內、不覆蓋內容、不貼浮於導覽之上；Ray 長期實站即以此法營運 AdSense。

選項取捨：

- **(c) 查證結果**：官方 anchor／vignette 廣告屬 **Auto Ads**（已在範圍外），手動廣告單元無 anchor 格式 → (c) 此路不通。
- **(a) 放棄**不必——有合規的錨點替代（Ray 實證）。
- **(b) 頁內不動版位**偏保守；Ray 方案＝(b) 的 in-flow 容器＋大螢幕 sticky，閱讀干擾更小且維持「錨點」效果，故採 Ray 式 sticky rail。

連帶定案（樣張與實作的共同規格）：

1. 第四版位命名「**sticky rail 廣告**」：側欄／內容區旁的 in-flow 容器＋`position:sticky; top:6rem`，僅大螢幕（≥1100×600、fine pointer）啟用 sticky，其餘斷點回流為頁內區塊；rail 佔位高度對齊 Ray：280px（視窗高 ≥600px 時 500–600px）。
2. **禁止** `position:fixed`、`transform` 動畫浮動、覆蓋內容、可關閉浮動框——不合規，不做。
3. 廣告載入一律走待命懶載入（0002 Resolution）：捲動接近才 `<ins>`＋`push({})`，格式 `auto`＋full-width-responsive。
4. 版面前提於 0003 樣張驗證：若文章版面無側欄欄位，rail 改放內容區兩側留白（寬度不足時整段省略第四版位），不得擠壓正文欄寬。
