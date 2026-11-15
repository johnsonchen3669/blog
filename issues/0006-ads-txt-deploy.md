---
title: 'ads.txt 與部署管線的整合'
labels: [wayfinder:task]
state: open
assignee: null
parent: MAP-adsense.md
blocked_by: [0001-adsense-account-signup]
---

## Question

拿到發佈商 ID 後（AFK 可做）：

1. 在 `public/ads.txt` 放入 google.com 那行（格式依「[研究：AdSense 現代整合的官方規範與 Astro 實作選項](0002-research-adsense-modern-integration.md)」的 ads.txt 章節結論）。
2. 查證 repo 的實際部署目標（repo 同時有 `vercel.json` 與 Pages 部署 workflow，哪個是生效的？）並確認部署觸發方式。
3. 部署後驗證 `https://johnsonchen.dev/ads.txt` 可連線且內容正確。

完成時記錄：ads.txt 生效 URL、實際部署平台、部署觸發方式。
