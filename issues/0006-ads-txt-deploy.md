---
title: 'ads.txt 與部署管線的整合'
labels: [wayfinder:task]
state: closed
assignee: goose
parent: MAP-adsense.md
blocked_by: [0001-adsense-account-signup]
---

## Question

拿到發佈商 ID 後（AFK 可做）：

1. 在 `public/ads.txt` 放入 google.com 那行（格式依「[研究：AdSense 現代整合的官方規範與 Astro 實作選項](0002-research-adsense-modern-integration.md)」的 ads.txt 章節結論）。
2. 查證 repo 的實際部署目標（repo 同時有 `vercel.json` 與 Pages 部署 workflow，哪個是生效的？）並確認部署觸發方式。
3. 部署後驗證 `https://johnsonchen.dev/ads.txt` 可連線且內容正確。

完成時記錄：ads.txt 生效 URL、實際部署平台、部署觸發方式。

## Progress

- 2026-11-15：部署查證結論——真正部署是 GitHub Pages（`.github/workflows/ci.yml`），`vercel.json` 僅 giscus CORS 設定；`public/` 原樣進靜態輸出，故放 `public/ads.txt` 兩個平台都生效。已建檔：`google.com, pub-4122726849294037, DIRECT, f08c47fec0942fa0`。
- 2026-11-15：部署後 curl 驗證 ✅ `https://johnsonchen.dev/ads.txt` HTTP 200、內容 `google.com, pub-4122726849294037, DIRECT, f08c47fec0942fa0` 與本票建檔一致。Google 端生效需爬取（數天～數週，AdSense 後台可 Check for updates）。

## Resolution

✅ 完成（2026-11-15）：

1. **ads.txt 內容**：單行 `google.com, pub-4122726849294037, DIRECT, f08c47fec0942fa0`，放 `public/ads.txt`（格式依研究票 0002 結論）。
2. **實際部署平台＝GitHub Pages**（`.github/workflows/ci.yml`，push `main` 觸發）；`vercel.json` 僅 giscus CORS 設定，Vercel 有同步部署但非主要目標。`public/` 原樣進靜態輸出，單一檔案兩平台都生效。
3. **生效 URL 已驗證**：<https://johnsonchen.dev/ads.txt>（HTTP 200、內容逐字正確）。

遺留（不阻塞關票）：Google 端爬取生效需數天～數週，AdSense 後台可用 Check for updates 確認。
