---
title: 'AdSense 後台建立廣告單元、取得版位 ID'
labels: [wayfinder:task]
state: open
assignee: null
parent: MAP-adsense.md
blocked_by: [0001-adsense-account-signup, 0003-prototype-ad-placements]
---

## Question

帳號開通、原型定案後，在 AdSense 後台為各版位建立對應的廣告單元。這是 HITL 任務票：人在後台操作，agent 給逐步清單。清單內容：

1. 依「[原型：版位與待命廣告元件的樣張](0003-prototype-ad-placements.md)」定案的格式與尺寸策略建立各版位廣告單元；共 **5 個單元**：文章開頭、文章結尾、列表穿插、定位錨點上格、定位錨點下格（0003 Resolution）。
2. ~~決定是否關閉「Fill empty in-page ads」~~ **已定案：關閉**（0003 Resolution 第 6 點）——空版位誠實留白，不顯示 Google 內容建議（研究票警訊 (c)）。
3. 廣告標題字串遵守研究票結論（只能用「Advertisements」或「Sponsored Links」）。

完成時記錄（「[實作：AdSlot 元件與載入時機整合進版面](0007-implement-adslot.md)」依賴這張對照表）：每個版位的廣告單元名稱、`data-ad-slot` ID、格式、發佈商 ID。
