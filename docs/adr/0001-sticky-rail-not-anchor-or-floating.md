# 第四版位採 sticky rail，不用官方 anchor 廣告或浮動錨點

AdSense 政策明文禁止 floating box script（自製浮動框放廣告），而 Google 官方的 anchor／vignette 廣告只透過 Auto Ads 提供（本專案已選手動版位，範圍外）。查證 Ray（israynotarray.com）實站後確認：他的「定位錨點」是頁內 in-flow 容器＋CSS `position:sticky` 的側欄 rail（僅 ≥1100×600 且 fine pointer 的大螢幕啟用），全站沒有任何 `position:fixed` 或浮動覆蓋廣告。本專案照此方案：維持四個版位，第四版位＝sticky rail。

## Considered Options

- **(a) 放棄第四版位**（只留三個版位）——不必，sticky rail 是合規的錨點替代且有 Ray 長期實站實證。
- **(b) 純頁內不動版位**（頁尾上方固定區域）——合規但放棄了錨點效果；sticky rail 是 (b) 的 in-flow 容器＋大螢幕 sticky，閱讀干擾更小。
- **(c) 官方 anchor 廣告格式**——查證不成立：anchor／vignette 屬 Auto Ads，手動廣告單元沒有 anchor 格式。

## Consequences

- sticky 需要版面留白：文章版面右 margin 放 rail（左 margin 是 TOC）；寬度不足的斷點整段回流頁內或省略。
- 小螢幕（<1100px、觸控）一律回流為普通頁內區塊，無錨點效果——刻意的取捨。
- 禁止任何形式的 `position:fixed`、浮動覆蓋、可關閉浮動框放廣告；未來有人想「優化」成浮動錨點時，先讀本 ADR。
