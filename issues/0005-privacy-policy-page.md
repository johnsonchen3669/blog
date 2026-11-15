---
title: '隱私權政策頁的內容與揭露範圍'
labels: [wayfinder:grilling]
state: closed
assignee: goose
parent: MAP-adsense.md
blocked_by: []
---

## Question

為站台撰寫隱私權政策頁（AdSense 最低合規），需與使用者當面敲定：

1. **揭露範圍**：只寫 AdSense／個人化廣告相關（Google Cookie、第三方廠商、DART cookie、adssettings.google.com 停用管道），還是連站台其他資料收集（分析工具、外部字型 CDN 等——實際蒐集了什麼需先查證站台現況）一起寫？
2. **頁面語言**：zh-TW 單語或中英雙語（站台 lang 是 zh-TW，但有 hreflang/多語線索）。
3. **路由與入口**：頁面放哪個路由（建議 `/privacy/`）、頁尾與導覽的連結位置。

內容結論供「[上線驗證：廣告請求、審核送件與曝光確認](0008-launch-verify.md)」檢查。

## Resolution

✅ 完成（2026-11-15）。三題定案：

1. **揭露範圍＝全站實際資料流**：不只 AdSense——依研究票（0002）必載三點寫 Cookie／個人化廣告／opt-out 管道（adssettings.google.com、aboutads.info、Google advertising cookies 政策頁），另誠實列出 giscus（GitHub 帳號）、託管平台 server log，並明寫「本站不做什麼」（無分析工具、Pagefind 本機搜尋、字型自託管、不主動蒐集個資）。已查證站台現況：無分析工具、搜尋為 Pagefind、字型 @fontsource 自託管——研究票提醒的「外部字型 CDN」不存在，無需揭露。
2. **語言＝zh-TW 單語**（與站台 `SITE.lang` 一致）。
3. **路由＝`/privacy/`，入口＝頁尾**（`Footer.astro` 加「隱私權政策」連結，不動主導覽）。

**新增/修改**：`src/pages/privacy.mdx`（新頁）、`src/components/base/Footer.astro`（頁尾連結）。

供 0008 檢查：送審前 `/privacy/` 可達、頁尾連結可點、三點必載可 grep（`adssettings.google.com`／`aboutads.info`／Cookie）。
