# 專案規則

## 內容管理後台

- 後台使用 Pages CMS（Git-based、免費），設定檔為根目錄 `.pages.yml`。
- `.pages.yml` 是後台欄位的唯一來源，調整欄位時必須同步更新 `src/content/schema.ts`：新增或移除後台的欄位都要兩邊一致。
- 後台儲存即 commit 到 `main`，因此每次變更都必須能通過 `bun run check`、`bun run lint`、`bun run format` 與 `bun run build`。
- 後台不開放檔案更名（`operations.rename: false`），避免既有文章網址失效。
- 圖片一律使用相對路徑 `../../../assets/blog/<檔名>` 指向 `src/assets/blog/`，以保留 Astro 圖片最佳化；文章深度固定為 `src/content/blog/<資料夾>/<檔名>.md`（系列＝系列資料夾、一般文章＝年份資料夾），若改變目錄結構需同步調整 `.pages.yml` 的 `media[].output`。
- 一般文章（無系列）由 `standalone` collection 管理：`filename` 模板 `{year}/{fields.slug}.md` 自動歸檔當年資料夾、`slug` 必填；`src/utils/blog.ts` 的 `getPostSeriesSlug` 只推論 `BLOG_SERIES_MAP` 註冊的系列，年份資料夾不會變成偽系列。
- 新增系列時需同步三處：`src/content/blog/series.ts`（`BLOG_SERIES_MAP`）、`.pages.yml` 系列 collection 的 `series` options、一般文章 collection 的 `exclude`。
- 評估與限制記錄在 `docs/cms-evaluation.md`。

## 文章原始檔

- TypeScript 系列文章的原始檔位於 `/home/johnson3669/workspace/articles/ts/articles/`。
- 同步文章到本專案時，依照原始檔更新正文內容；本專案既有的 frontmatter 應予以保留並依需求更新。
- 若本專案已有文章圖片連結，除非另有指定，同步時保留目前版本的圖片連結，不要將原始檔中的插圖 TODO 或圖片指示覆蓋回來。
- 若本專案尚無對應圖片，原始檔的生圖 Prompt 不需完整複製；只保留註解中的 Markdown 圖片格式、替代文字與建議路徑，待圖片完成後再替換路徑並啟用連結。
