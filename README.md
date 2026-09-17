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

## 部署

正式網站由 GitHub Actions 建置並部署到 GitHub Pages：

- 推送到 `main` 時自動驗證並部署。
- 每天台北時間 20:00 自動重建，發布 `pubDate` 已到且非草稿的文章。
- 需要手動重新部署時，在 GitHub Actions 的 `CI and Deploy` 工作流程選擇 `Run workflow`。

GitHub repository 的 **Settings → Pages → Build and deployment → Source** 必須設為 **GitHub Actions**。
