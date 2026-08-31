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
