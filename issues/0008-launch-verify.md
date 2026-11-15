---
title: '上線驗證：廣告請求、審核送件與曝光確認'
labels: [wayfinder:task]
state: open
assignee: null
parent: MAP-adsense.md
blocked_by: [0005-privacy-policy-page, 0006-ads-txt-deploy, 0007-implement-adslot]
---

## Question

部署上線後驗證終點達成（HITL：人確認 AdSense 後台，agent 驗證站台）：

1. 瀏覽器 devtools 確認 adsbygoogle 請求發出、四個版位正常渲染（含待命→載入行為）。
2. AdSense 後台送審（若「[申請 AdSense 帳號並完成網域驗證](0001-adsense-account-signup.md)」尚未送）。
3. 行動裝置與桌機各檢查一次：CLS、閱讀體驗底線、AdBlock 提示表現。
4. 最低合規檢查：隱私權政策頁可達、ads.txt 可達。

終點定義：**站台開始向 Google 請求廣告**。Google 審核的結果與時程不計入終點。

## Progress

- 2026-11-15：靜態檢查先行 ✅（部署後 curl 線上）：
  - 隱私權政策頁可達：`/privacy/` HTTP 200；頁尾入口連結 `href="/privacy/"` 在首頁可點。
  - 三點必載 grep 3/3（advertising cookies／aboutads.info／停用個人化廣告）。
  - ads.txt 可達且內容正確（0006 已關）。
  - 網域驗證片段在 `<head>`（首頁 HTML 確認）。
  - CLS／閱讀體驗底線：版位固定高（`height: var(--ad-height)`）＋unfilled 保留空間；版心與文章頁一致（820px，commit `c5cd45b`）；桌機 1280／手機 375 截圖驗收通過（CDP 模擬視窗，無水平溢出）。
- 待辦（依序）：① 0004 填真 slot ID＋`enabled: true` 後，devtools 確認 adsbygoogle 請求發出、五個廣告單元待命→載入行為；② AdSense 後台送審（若 0001 尚未送）；③ 曝光確認後關票。
