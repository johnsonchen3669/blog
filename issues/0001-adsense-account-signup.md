---
title: '申請 AdSense 帳號並完成網域驗證'
labels: [wayfinder:task]
state: open
assignee: null
parent: MAP-adsense.md
blocked_by: []
---

## Question

把 <https://johnsonchen.dev/>（johnsonchen-field-notes）申請 Google AdSense、通過網域驗證並送交審核。這是 HITL 任務票：人在 Google 後台操作，agent 給逐步清單並即時答疑。大致路徑：

1. 用 Google 帳號到 adsense.google.com 開通 AdSense。
2. 新增網站 `https://johnsonchen.dev/`。
3. 網域驗證：依「[研究：AdSense 現代整合的官方規範與 Astro 實作選項](0002-research-adsense-modern-integration.md)」的驗證章節結論選用程式碼片段或 ads.txt 方式。
4. 完成帳號基本設定（付款 profile 等）並提交網站審核。

完成時記錄（後續票依賴這些事實）：發佈商 ID、採用的驗證方式、審核提交時間、後台可建立廣告單元的時間點。

## Progress

- 2026-11-15：發佈商 ID 取得：`ca-pub-4122726849294037`（帳號類型 Individual、付款國家台灣）。驗證方式採 **(A) AdSense 程式碼片段**——已進 `src/layouts/BaseLayout.astro` `<head>`（`is:inline`，AdSense 要求保留）；ads.txt 同步上 `public/ads.txt`（0006 一併解）。
- 2026-11-15：整合已部署上線並驗證 ✅——驗證片段在 `<head>`（首頁 HTML 確認 `adsbygoogle.js?client=ca-pub-4122726849294037`）、`https://johnsonchen.dev/ads.txt` 可讀（0006 已關）、`/privacy/` 可達。付款 profile 作法已說明（先填姓名/地址/電話；US$10 解鎖收款方式再填電匯）。
- 待回報（HITL）：① 後台按「驗證」→「要求審核」的審核提交時間；② 後台可建廣告單元的時間點。審核期間 Auto ads 維持 OFF。
