---
title: 'Google AdSense 變現之路'
labels: [wayfinder:map]
state: open
assignee: null
parent: null
blocked_by: []
---

## Destination

把手動版位＋待命載入的 Google AdSense 整合進 johnsonchen-field-notes 部落格（Astro 7，<https://johnsonchen.dev/>）並部署上線。終點是**站台開始向 Google 請求廣告**：四個版位（文章開頭、文章結尾、文章列表每 5 篇穿插、側欄 sticky rail）就位、隱私權政策頁與 ads.txt 達成最低合規，並含 AdSense 帳號申請與後台設定的逐步指引。Google 審核的結果與時程不計入終點。

## Notes

- 領域：Astro 7 靜態部落格 `johnsonchen-field-notes`（repo：`~/Desktop/workspace/projects/blog`）。
- 本 effort **帶實作**（使用者要求「帶我完成」，覆寫 wayfinder 只規劃的預設）：決策定案後，實裝票由 agent 動手。
- 遵守 repo 的 `AGENTS.md`：變更需通過 `bun run check` / `lint` / `format` / `build`。
- 開發指令用 Vite+：`vp run dev` / `vp run build`（`vp dev` 直連模式與 Astro content sync 有相容問題，用 `vp run` 系列）。
- 技能：票面類型指名的技能必載（research → research；prototype → prototype；grilling → grilling ＋ domain-modeling）。
- 術語決議即時寫入根目錄 `GLOSSARY.md`。
- 追蹤器運作方式見 [issues/README.md](README.md)。
- ~~已知環境 bug：`.githooks/commit-msg` 未轉傳 `"$1"`~~ ✅ 2026-11-14 已修（`.git/hooks` 與 `package.json` 兩處，commit `b6821b0`，實測好／壞訊息與真實 commit 均正確）。
- ~~shell 環境無 GitHub 憑證~~ ✅ 2026-11-14 已設定 SSH key（ed25519，remote 已切 SSH）並推送成功；`research/adsense-integration` 分支已上傳（不開 PR）。

## Decisions so far

<!-- one line per closed ticket：票名連票檔＋一行摘要 -->

- [研究：AdSense 現代整合的官方規範與 Astro 實作選項](0002-research-adsense-modern-integration.md)：待命載入合規但必須捲動接近才插入 `<ins>`＋push（禁 display:none 前置）；生態無 Astro 專用套件，自製 `AdSlot.astro`＋原生 script；ads.txt 單行格式、生效需數天以上；隱私揭露必載三點；CLS 靠預留空間；自製浮動框違規——已衍生「底部定位錨點的合規界線與去留」。
- [底部定位錨點的合規界線與去留](0009-anchor-placement-compliance.md)：照 Ray 實站方案定案——第四版位＝側欄 sticky rail 廣告（in-flow 容器＋`position:sticky`，僅大螢幕啟用），非浮動框；官方 anchor 格式屬 Auto Ads 此路不通；載入一律待命懶載入 `auto`＋full-width-responsive。
- [原型：版位與待命廣告元件的樣張](0003-prototype-ad-placements.md)：變體 A「待命線框」定稿；尺寸＝90px 橫幅／rail 280px×2、文案三句定稿、列表穿插全列表（首頁不含）、**AdBlock 提示不做**、rail 兩個廣告單元、Fill empty in-page ads 關閉；ADR 0001 已開。
- [實作：AdSlot 元件與載入時機整合進版面](0007-implement-adslot.md)：五個版位實裝完成（commit `8a66d03`）——AdSlot/AdRail＋待命載入 client＋`src/config/ads.ts` 佔位設定；真 ID 由 0004 填入＋`enabled: true` 即開始請求；ADR 0001 附 Amendment（rail margin 定位技術備案）。
- [隱私權政策頁的內容與揭露範圍](0005-privacy-policy-page.md)：`/privacy/` zh-TW 單頁完成——揭露範圍＝全站實際資料流（AdSense 必載三點＋giscus＋託管 log＋「不做什麼」清單）、入口頁尾；送審前最低合規就緒。
- [ads.txt 與部署管線的整合](0006-ads-txt-deploy.md)：實際部署＝GitHub Pages（push `main` 觸發）、`vercel.json` 僅 CORS；`public/ads.txt` 已上線驗證（HTTP 200、內容逐字正確）；Google 端爬取生效需數天～數週。

## Not yet specified

- 審核等待期的站台狀態：送審期間廣告空間如何呈現、未過審或審核延遲時的重試路徑 —— 等「申請 AdSense 帳號並完成網域驗證」實際走過才看得到。


## Out of scope

- 侵入式版位：覆蓋式廣告、強制倒數、自動播放有聲影片廣告、內文中斷插入 —— 讀者體驗底線，對齊 Ray 的哲學「盡量不影響閱讀」。
- AdSense Auto Ads 自動版位 —— 已選手動版位＋待命載入，版位控制權優先於省事。
- CMP / Consent Mode 同意橫幅 —— 先最低合規；有歐盟流量再另開新 effort。
- 收益優化（版位 A/B 測試、RPM/CPC 分析、成效看板）與其他收益管道（Buy Me A Coffee、Portaly）—— 終點是「開始請求廣告」，收益優化在終點之後。
