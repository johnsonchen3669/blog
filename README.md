# Johnson Chen — Field Notes

Johnson Chen 的個人技術網站，記錄前端開發、TypeScript 型別思維與 Angular 實作。

## 開發環境

- Node.js 22
- Bun 1.4
- Astro 7

所有套件安裝與驗證建議透過 Docker 執行，避免污染主機環境：

```bash
docker volume create myblog_bun_modules
docker run --rm -v myblog_bun_modules:/workspace/node_modules oven/bun:1.4.0 chown -R 1000:1000 /workspace/node_modules
docker run --rm --user 1000:1000 -e HOME=/tmp/bun-home -e ASTRO_TELEMETRY_DISABLED=1 \
  -v "$PWD":/workspace -v myblog_bun_modules:/workspace/node_modules \
  -w /workspace oven/bun:1.4.0 bun install --frozen-lockfile
```

將最後一段指令的 `bun install --frozen-lockfile` 換成以下命令即可執行檢查：

- `bun run dev --host 0.0.0.0`
- `bun run check`
- `bun run lint`
- `bun run format`
- `bun run build`
- `bun audit`

網站部署目標為 [johnsonchen.dev](https://johnsonchen.dev/)。

## 內容管理

文章與頁面可以直接改檔案，也可以透過瀏覽器後台編輯（含手機）：

1. 前往 [app.pagescms.org](https://app.pagescms.org) 以 GitHub 登入。
2. 安裝 Pages CMS GitHub App，只授權 `johnsonchen3669/blog`。
3. 開啟 repo 即可編輯；存檔會直接 commit 到 `main`，由 GitHub Actions 驗證並部署。

後台欄位由根目錄 [`.pages.yml`](./.pages.yml) 定義，**該檔案是欄位的唯一來源**；調整欄位時需同步更新 `src/content/schema.ts`。產品評估與限制見 [`docs/cms-evaluation.md`](./docs/cms-evaluation.md)。

### 草稿與排程發布

- **草稿**：開啟「草稿」欄位。檔案會進 repo，但正式站不輸出（列表、RSS、sitemap、Pagefind 都不會出現）。
- **排程**：關閉草稿並把「發布日期」填未來日期，等每日台北時間 20:00 的排程重建後自動上線。
- **預覽**：本機執行 `bun run dev` 可以看到草稿與排程中的文章。

### 圖片

- 後台上傳的圖片會存到 `src/assets/blog/`，插入文章時寫成相對路徑 `../../../assets/blog/<檔名>`，建置時仍由 Astro 產生 `srcset` 與最佳化檔案。
- 這個相對路徑假設文章位於 `src/content/blog/<series>/`（深 3 層）。若調整目錄結構，必須同步修改 `.pages.yml` 的 `media[].output`。
- 後台不開放更名既有檔案（避免網址失效）；既有的 `src/assets/blog/<series>/` 圖片仍可手動維護。

## 部署

正式網站由 GitHub Actions 建置並部署到 GitHub Pages：

- 推送到 `main` 時自動驗證並部署。
- 每天台北時間 20:00 自動重建，發布 `pubDate` 已到且非草稿的文章。
- 需要手動重新部署時，在 GitHub Actions 的 `CI and Deploy` 工作流程選擇 `Run workflow`。

GitHub repository 的 **Settings → Pages → Build and deployment → Source** 必須設為 **GitHub Actions**。
