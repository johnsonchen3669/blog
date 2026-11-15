# Local-markdown 追蹤器（wayfinder）

本資料夾是 wayfinder 地圖與決策票的存放處（repo 未設定外部 issue tracker 時的預設）。

## 檔案結構

- `MAP-*.md`：地圖（label `wayfinder:map`），一張地圖一個檔。
- `NNNN-*.md`：決策票，隸屬地圖的子票。檔名（不含 `.md`）就是票的 id。

## Frontmatter 欄位

```yaml
---
title: '顯示名稱（對話中一律以此稱呼票）'
labels: [wayfinder:<map|research|prototype|grilling|task>]
state: open # open | closed
assignee: null # 認領者名稱；null = 未認領
parent: MAP-*.md # 票的所屬地圖；地圖本身為 null
blocked_by: [] # 前置票的 id 列表
---
```

## Wayfinding operations

- **建票與接線**：local markdown 的檔名即 id、無自動連結風險，可在建檔時一次寫好 `blocked_by` 與交叉引用。
- **認領（claim）**：先把 `assignee` 改成工作中的開發者名稱，再開始任何工作。open 且 `assignee: null` 即未認領。
- **前沿（frontier）**：`state: open`、`blocked_by` 內全數 closed、且 `assignee: null` 的票，依票號順序排列。
- **解決（resolve）**：票檔尾端追加 `## Resolution` 章節記錄答案（資產掛連結、不貼內容），`state` 改 `closed`，並在地圖 `## Decisions so far` 追加一行（票名連票檔＋一行摘要）。
- **阻塞（blocking）**：`blocked_by` 全數 closed 即解除阻塞。
- **範圍外**：被裁定越界的票直接關閉，地圖 `## Out of scope` 留一行（摘要＋原因＋連結），不進 Decisions so far。
- **霧（fog）**：還說不精確的問題寫進地圖 `## Not yet specified`；可精確成題時開新票並從該節移除。
