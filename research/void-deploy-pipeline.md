# Void 部署一條龍研究（票 0010）

- 查證日期：2026-11-15
- 方法：web-search（DuckDuckGo）＋官方來源直接抓取（GitHub repo README/文件、npm registry、void.cloud、Cloudflare Blog）
- 來源等級標記：**[官方]** = VoidZero／Void／Cloudflare／npm／GitHub repo 一手來源；**[二手]** = 媒體／Wiki 轉述

## 結論速覽

**Void 確有其物**：VoidZero（Vite、Vitest、Rolldown、Oxc 出品方）推出的「full-stack framework + deployment CLI + platform」，口號 **"Build with Vite. Deploy with Void."**，部署目標是 **Cloudflare Workers**。2026-10-15 由 Cloudflare 官方部落格正式發表，目前 npm 版本 1.9.1、MIT 授權、高度活躍。它在「git push → 建置 → 上線」裡負責**建置之後到上線為止的整段**（build → 資源配置 → DB migration → 部署 → 回傳 URL），並可生成 GitHub Actions workflow 做到 push 即部署。與 Astro 的關係是**管線層整合**（Vite plugin 介入），**不取代 Astro 自帶 build**；官方有 Astro 專屬整合文件（需 Astro 7+）。

---

## 1. 正確名稱與來源

| 項目 | 內容 |
|---|---|
| 官方名稱 | **Void**（產品）；npm 套件名 `void` |
| 出品方 | **VoidZero Inc.**（Vite 團隊公司；2026-06 被 Cloudflare 收購 [二手]，現為 Cloudflare 旗下） |
| 官方網站 | https://void.cloud **[官方]** |
| Repo | https://github.com/voidzero-dev/void **[官方]**（README 標題即 "Void — Build with Vite. Deploy with Void."） |
| 公告 | Cloudflare Blog《Deploy with Void》2026-10-15 https://blog.cloudflare.com/deploy-with-void/ **[官方]** |
| npm | https://www.npmjs.com/package/void **[官方]**（registry 描述："Full-stack framework and deployment CLI for Cloudflare Workers, powered by Vite."，homepage: void.cloud） |

**名稱混淆提醒**（務必分辨）：
- **VoidZero**（公司，voidzero.dev）≠ **Void**（產品，void.cloud）。公司官網在 voidzero.dev，產品官網在 void.cloud。
- npm 套件名 `void` 建立於 2014-05（registry metadata）**[官方]**——名稱早於產品存在，屬沿用舊名；現行 1.x 版本線才是 VoidZero 的 Void，安裝認明 homepage `https://void.cloud`。
- 另有一個無關的開源 AI 編輯器也叫 Void（voideditor）；本票語境（Vite 團隊、部署一條龍）明確指向 VoidZero 的 Void。

## 2. 定位：在「git push → 建置 → 上線」裡扮演哪一段

Void 不是單一工具，是三個開源元件 **[官方，GitHub README]**：

1. **Void SDK**——full-stack 框架層：file-based API routes、SSR 頁面、typed APIs（DB／storage／AI），型別從 DB query 一路帶到 UI。React／Vue／Svelte／Solid 皆可用，也可只用資源 API、保留既有框架。
2. **Void CLI**——部署一條龍的核心：`npx void deploy` 一條指令完成 **build（用 Vite）→ 自動配置 Cloudflare 資源 → 套用 DB migrations → 部署 → 印出正式 URL**；另有 logs、rollback、資源管理。建立在新版 `cf CLI` 之上，對 coding agent 友善（repo 內附 agent skills、自動生成 AGENTS.md）。
3. **Void Platform**——裝在自家 Cloudflare 帳號的團隊部署平台（多租戶、權限、資源上限、用量報表、需核准的部署請求）；不用平台可直接部署到自己的 Cloudflare 帳號。

在管線中的位置 **[官方，docs/guide/deployment.md]**：
- **建置段**：以 Vite（Vite+ 工具鏈）建置——但 Astro 專案例外，見第 4 節。
- **上線段**：`void deploy` 部署到 Cloudflare Workers（免費方案可跑 native apps）或 Void Platform。
- **git push 一條龍**：`void init --github` 生成 GitHub Actions workflow（Cloudflare 目標需 repo secret `CLOUDFLARE_API_TOKEN`）；Void Platform 可用 GitHub App 做到 **push 即部署、不需 workflow 檔**（managed GitHub builds）。
- 也可 `target` 輸出 Node.js／Bun／Deno standalone server 自行部署（此時拿不到 D1/KV/R2 等 Cloudflare 資源）。

一句話：**Void 負責「建置完成後的資源配置＋部署上線」整段，並補上 git-push 觸發的 CI 接線；不是 CI 系統本身，也不是取代 Vite 的建置工具。**

## 3. 成熟度

| 面向 | 狀況 |
|---|---|
| 版本 | npm `void` latest = **1.9.1**（2026-11-14）**[官方]**；semver 1.x，未見 beta／rc dist-tag，但官方亦未宣告 stable／LTS |
| 發布節奏 | 極快：1.6.2（11-05）→ 1.7.0（11-09）→ 1.8.0（11-12）→ 1.9.0／1.9.1（11-14）**[官方]**——約一週多個 minor，介面仍在快速變動 |
| 授權 | **MIT**（GitHub LICENSE 與 npm 一致）**[官方]** |
| 活躍度 | repo 3,999 commits、686 stars、83 forks、29 open issues、12 open PRs（查證當下）**[官方]** |
| 生產使用 | Cloudflare 公告稱 VoidZero 自己「過去數個月已在生產環境使用 Void SDK／CLI／Platform」**[官方]** |
| 已知缺口 | framework mode（含 Astro）下 **Void-managed auth 尚未支援**，官方建議暫用 Better Auth **[官方]** |

判定：**正式發佈但屬「剛滿月」的新產品**（公告 2026-10-15，距查證日約 1 個月），版本 1.x、迭代快、生產驗證僅數個月。適合關注與實驗，關鍵路徑採用前建議釘版本。

## 4. 與 Astro 7 的整合

官方專屬文件：https://void.cloud/integrations/frameworks/astro（repo: `docs/integrations/frameworks/astro.md`）**[官方]**。結論：**管線層整合——不取代 Astro 自帶 build**。原文："Astro keeps its own build and Cloudflare integration; Void plugs into its Vite configuration."

- **需求**：Astro **7+**（Void 需要 Vite 8）＋ Cloudflare config 加 `compatibility_flags: ["nodejs_als"]`。
- **接法**：`astro.config.mjs` 裡掛 `@astrojs/cloudflare` adapter（`configPath: './.void-wrangler.jsonc'`）＋ Vite plugin `voidPlugin()`（來自 `void` 套件）；另建 `void.config.ts`（Cloudflare 名稱、compatibility 設定）。
- **分工**：**build 仍由 Astro 負責**；Void 提供的是資源層（`void/db`、`void/kv`、storage、AI、cron、queues、typed env）＋ migrations ＋ `void deploy` 部署。DB／KV 等存取需在頁面／API route 加 `export const prerender = false`。
- **注意**：`void/env` 取代 `astro:env`；client 公開值一律 `VITE_*`（Astro 的 `PUBLIC_*` 只在直接 `import.meta.env` 存取時照舊）；raw bindings 用 `cloudflare:workers` 的 `env`。
- **官方／社群範例**：官方文件本身就是完整 setup 範例（含 DB query 程式碼）；repo 另有 `playground/`。DeepWiki 有第三方整理 **[二手]**。查不到獨立的 example repo 或社群教學（搜尋結果有限）。

## 5. 周邊影響（本部落格周邊設施逐項）

前提：Astro 模式下 build 管線保留 Astro 自帶 build（第 4 節 [官方]），因此**建置期產物大致不受 Void 影響**；改變的是「部署到哪裡／怎麼 serve」。以下逐項，標註查證與推論：

| 項目 | 影響 | 依據 |
|---|---|---|
| **Pagefind 搜尋** | **推測不影響**（建置後索引、產出在 dist 內隨站部署）；官方文件查不到任何 Pagefind 提及 | [推論] Pagefind 於 Astro build 後執行、產物為靜態檔；Void/Cloudflare 靜態資產會 serve 它。需實測確認 Worker 路由不攔截 `/pagefind/*` |
| **圖片最佳化** | **不影響** Astro `astro:assets`（建置期處理）；Void 本身無圖片最佳化功能（storage 是 R2 物件儲存） | [官方] Void docs 無圖片最佳化功能；[推論] Astro 建置期管線不變 |
| **RSS** | **不影響**（Astro 端點／靜態路由的建置期產物） | [推論] 同上，build 保留 |
| **giscus** | **不影響**（純前端 script） | [推論] 與部署層無關 |
| **AdSense 驗證片段** | **不影響**（`<meta>`／script 在 layout 輸出內）；但驗證針對網域，換部署網域時需重新走驗證 | [推論] |
| **ads.txt** | **推測不影響**：放 `public/ads.txt` 即隨靜態資產在根路徑 serve；官方文件證實 `public/` 內檔案（`404.html`、`_headers`、`_redirects`）會被部署並 serve | [官方] docs/guide/ssg.md 提及 `public/` 靜態檔行為；[推論] ads.txt 同理。注意：若 app 有 middleware／edge rules，所有請求會走 Worker，需實測 ads.txt 不被路由吃掉 |
| **自訂網域** | **支援**。直接部署到自家 Cloudflare 帳號時 custom application domains 為「Supported」（Cloudflare Workers custom domains／`routes` 設定，Void 保留 wrangler 的 `routes`／`workers_dev`／`preview_urls`）；Void Platform 需安裝時加 `--custom-domains` | [官方] docs/guide/self-hosted-platform.md 對比表、docs/integrations/cloudflare.md |

**整體判斷**：上述周邊全部是「Astro build 期／純前端／根路徑靜態檔」性質，在 Void 的 Astro 整合模式下理論上原樣保留；真正要驗證的是**靜態資產 serve 行為**（Pagefind 資料檔、ads.txt）與**自訂網域遷移**（DNS、AdSense 重新驗證）。官方文件對 Pagefind／ads.txt／AdSense／giscus 均**查不到**直接說明，以上標 [推論] 者建議在 branch 實測後再定案。

---

## 附錄：名詞對照

- **VoidZero**（公司）：Vite／Vitest／Rolldown／Oxc／Vite+ 出品方，2026-06 被 Cloudflare 收購。官網 https://voidzero.dev
- **Void**（產品）：full-stack framework＋deploy CLI＋team platform，跑在 Cloudflare Workers。官網 https://void.cloud
- **Vite+**：VoidZero 的整合工具鏈（Vite、Rolldown、Oxlint、Oxfmt、Vitest）；Void 專案預設工具鏈

## 來源清單

1. **[官方]** GitHub `voidzero-dev/void` README — https://github.com/voidzero-dev/void
2. **[官方]** Void 文件：Astro 整合 — https://void.cloud/integrations/frameworks/astro（repo 路徑 `docs/integrations/frameworks/astro.md`）
3. **[官方]** Void 文件：Deployment — https://void.cloud/guide/deployment（repo `docs/guide/deployment.md`）
4. **[官方]** Void 文件：SSG — https://void.cloud/guide/ssg（repo `docs/guide/ssg.md`）
5. **[官方]** Void 文件：Self-hosted Platform（部署功能對比表）— https://void.cloud/guide/self-hosted-platform
6. **[官方]** Void 文件：Cloudflare 整合 — https://void.cloud/integrations/cloudflare
7. **[官方]** Cloudflare Blog《Deploy with Void》2026-10-15 — https://blog.cloudflare.com/deploy-with-void/
8. **[官方]** npm registry `void` — https://registry.npmjs.org/void / https://www.npmjs.com/package/void
9. **[官方]** VoidZero 官網 — https://voidzero.dev/
10. **[二手]** Heise《Cloudflare acquires VoidZero》2026-06-04 — https://www.heise.de/en/news/Cloudflare-acquires-VoidZero-Team-behind-Vite-switches-completely-11319023.html
11. **[二手]** DeepWiki：void repo Meta-Framework Integrations — https://deepwiki.com/voidzero-dev/void/3.3-meta-framework-integrations
