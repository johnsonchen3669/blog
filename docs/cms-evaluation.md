# Pages CMS 導入評估

本文件記錄為本站導入 CMS 後台的評估結果。結論：採用 **Pages CMS**（免費、開源、Git-based），只需要在 repo 加入 `.pages.yml`，不需要新增任何部署，也不需改動既有的內容管線與 CI。

## 1. 評估背景與需求

- 目標：可用瀏覽器（含手機）編輯文章 frontmatter 與內文。
- 硬性限制：網站是 **Astro 靜態輸出 + GitHub Pages**（GitHub Actions 建置 `dist`），不能為了後台而改成 SSR。
- 內容現況：`src/content/blog/{typescript,angular-training}/*.md` 共 45 篇，frontmatter 由 `src/content/schema.ts` 定義，內文使用純 Markdown 與 `> [!NOTE]` callouts。

## 2. 現況盤點

| 項目 | 現況 |
| --- | --- |
| 建置 | `astro build` → `dist` → GitHub Pages（`.github/workflows/ci.yml`），每日台北 20:00 排程重建 |
| 內容 | `src/content/blog/<series>/day-<n>.md`（45 篇）、`src/pages/**/*.mdx` |
| Frontmatter | `postSchema`（`src/content/schema.ts`）；實際使用：`title, description, slug, series, order, tags, pubDate, lastModDate, ogImage, toc, share, giscus, search` |
| Markdown 管線 | `plugins/index.ts`（remark-directive(-sugar)、imgattr、math、rehype-callouts/katex/autolink/external-links/wrap-all） |
| 草稿／排程 | `src/utils/data.ts` 於 `import.meta.env.PROD` 時過濾 `draft` 與未到 `pubDate` 的文章 |
| 圖片 | `src/assets/blog/<series>/*.webp`，文章以相對路徑引用，由 Astro 產生 `srcset` 與雜湊檔名 |

## 3. Pages CMS 評估

### 3.1 產品特性

- 開源（MIT）、免費；官方託管版為 `app.pagescms.org`，也可自架（Vercel 免費方案，或 Docker + PostgreSQL）。
- 只支援 GitHub。
- 直接編輯 repo 內的檔案，沒有 CMS 資料庫、沒有 API：內容的唯一真相仍是 git 與 Markdown。
- 官方定位為靜態網站的最小 CMS，明確支援 Astro。

### 3.2 導入流程

1. 前往 `app.pagescms.org`，以 GitHub 登入。
2. 安裝 Pages CMS GitHub App，只授權 `johnsonchen3669/blog`。
3. 開啟此 repo（`.pages.yml` 已存在時會直接載入設定）。
4. 開始編輯；存檔即對 `main` 產生 commit。

### 3.3 與現有流程的相容性

CMS 只是另一種寫檔方式，因此：

- `src/content.config.ts`（glob loader）、`src/content/schema.ts`、`plugins/index.ts`、Pagefind、RSS、sitemap、OG 產圖 **全部不需修改**。
- 存檔 → commit `main` → 觸發現行 `ci.yml`（`astro check`、eslint、prettier、build）→ GitHub Pages 部署。
- 每日 20:00 的排程重建不受影響。

### 3.4 已知限制

- 無 editorial workflow（沒有 Draft／In review／Ready 狀態機，也沒有 PR 關卡），存檔即上線。
- 依賴第三方託管服務與其 GitHub App 授權。
- 富文本編輯器仍可能對 Markdown 做正規化，需要用「無修改儲存零 diff」驗證把關。

## 4. 草稿與發布流程

草稿過濾邏輯在**建置端**，不在 CMS，因此 CMS 只要提供對應欄位即可：

| 情境 | 在後台的操作 | 結果 |
| --- | --- | --- |
| 撰寫中 | 開啟「草稿」 | commit 進 `main`，但正式站不輸出（列表／RSS／sitemap／Pagefind 都沒有） |
| 預約上線 | 關閉「草稿」+ 發布日期填未來日期 | 日期到之前不上線，之後由每日 20:00 重建自動發布 |
| 立即發布 | 關閉「草稿」+ 發布日期填當天 | 存檔 → CI → 部署 |
| 預覽 | 本機 `bun run dev` | 草稿可見，並顯示草稿提示 |

遠端／手機預覽的選項與取捨見第 6 節。

## 5. 圖片流程

結論：**使用 CMS 上傳仍可保有 Astro 圖片最佳化**，條件是圖片必須落在 `src/assets`，且寫入文章的路徑是相對路徑。

- 目前 `.pages.yml` 的 `blog-assets` 媒體來源即為此設定：`input: src/assets/blog`、`output: ../../../assets/blog`，並指定給 `body` 欄位使用。
- 上傳新圖會落在 `src/assets/blog/<slug>.webp`，文章內插入 `![alt](../../../assets/blog/<slug>.webp)`，建置時由 Astro 輸出 `dist/_astro/<name>.<hash>.webp` 與 `srcset`。
- 相對路徑只在文章固定位於 `src/content/blog/<series>/<file>.md`（深 3 層）時正確；若未來調整目錄深度，必須同步修改 `media.output` 前綴。
- 若要改用 `public/`（`blog-public` 媒體來源，`output: /images/blog`），路徑不受深度影響，但**不會**經過 Astro 影像處理，需自行壓縮並失去 `srcset`。

## 6. 儲存行為實測（忠實度測試）

測試方式：在後台開啟既有文章後**不做任何修改**直接儲存，檢查產生的 commit diff。

### 已測：`typescript/day-1.md`（`7a49bbf`）、`typescript/day-2.md`（`6236429`）

`day-2` 額外涵蓋 `> [!NOTE]` callouts 與相對路徑圖片引用。

| 觀察到的改寫 | 影響 | 處理 |
| --- | --- | --- |
| `description: "..."` 的引號被移除 | 無（YAML 等價） | 接受 |
| 空的 `lastModDate: ''` 被移除 | 無（schema 為 optional union，空字串與缺少鍵在 `RenderPost.astro` 都視為 undefined） | 接受；`lastModDate` 已改為 `date` 型別以避免無效字串造成建置失敗 |
| 內文連續空行被收斂成一個 | 僅空白差異，不影響版面 | 接受 |
| 檔案結尾不再有換行（與 `.editorconfig` 的 `insert_final_newline` 慣例不同） | 無功能影響，但之後手改檔案可能再產生一次 diff | 接受（若要完全避免，需把 `body` 改成 `code` 欄位，犧牲所見即所得） |
| 其餘內文：段落、清單、程式碼區塊、`> [!NOTE]` callouts、圖片相對路徑 | **完全一致（零改寫）** | — |

**結論**：`rich-text` body 欄位可以保留，不需要退到 `code`。後台的改寫僅限於 YAML 等價的引號、空白正規化與空欄位省略，文章的語意與結構不受影響。

### 待測

- 圖片上傳後的落地路徑與插入語法（見第 5 節）。

## 7. 預覽選項

| 方案 | 手機／遠端 | 內容範圍 | 需要新增 | 備註 |
| --- | --- | --- | --- | --- |
| 本機 `bun run dev` | ✗ | 含草稿 | 無 | 目前的作法，驗證足夠 |
| 本機 dev server + 通道（Cloudflare Tunnel／Tailscale） | ✓ | 含草稿 | 常開機器 | 會把本機服務曝露到網路 |
| Pages CMS action → `workflow_dispatch` 預覽 | ✓ | 單篇或全站 | 1 個 workflow 檔 | 與後台整合，按鈕在文章頁 |
| 第三方 PR preview | ✓ | 含草稿 | 一個部署 | **與「直接 commit `main`」不相容** |
| 常設預覽站（`PUBLIC_PREVIEW=true`） | ✓ | 含草稿 | 一個免費部署 | 需加 noindex 與存取保護 |

若要在預覽中顯示草稿，只需在 `src/utils/data.ts` 的過濾條件加入環境變數旗標（目前過濾只有這一處）：

```ts
const isPreview = import.meta.env.PUBLIC_PREVIEW === 'true'
// 條件改為：!import.meta.env.PROD || isPreview ? true : !draft && isPublished(...)
```

正式站不使用該旗標；任何含草稿的預覽都必須加上 `noindex` 並避免公開連結外流。

## 8. 風險與對策

| 風險 | 對策 |
| --- | --- |
| 富文本編輯器改寫既有 Markdown | 以「無修改儲存零 diff」驗證；必要時把 `body` 改成 `code` 欄位（純文字編輯） |
| schema 未管理的鍵被刪除 | `settings.content.merge: true` |
| 空的 `lastModDate` 會被移除 | 無功能影響；欄位已改為 `date` 型別以避免無效字串造成建置失敗 |
| 後台儲存會做輕度 Markdown 正規化（空行、檔尾換行） | 已知行為，記錄於第 6 節；若不可接受則把 `body` 改為 `code` 欄位 |
| 圖片相對路徑與目錄深度綁定 | 文件載明規則；改變目錄結構時同步更新 `media.output` |
| 後台更名檔案導致連結失效 | `operations.rename: false`，不開放更名 |
| 無審核流程 | 以「草稿 + 排程」兩層防護；若日後需要審核，改用原生支援 editorial workflow 的 Sveltia CMS |

## 9. 結論

Pages CMS 能用最低成本滿足需求：瀏覽器與手機可編輯、內容仍是 repo 內的 Markdown、零部署變更、零建置流程變更。導入步驟與設定見根目錄 `.pages.yml` 與 `README.md` 的「內容管理」章節。
