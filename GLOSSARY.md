# Google AdSense 變現（johnsonchen-field-notes）

本部落格投放 Google 廣告、以不打擾閱讀為前提變現的領域語言。

## Language

**AdSense**:
Google 的廣告分潤方案，站長在自己的站台投放廣告並按曝光／點擊分潤。
_Avoid_: Google 廣告、Google Ads、光告

**發佈商**（publisher）:
投放 AdSense 廣告並收取分潤的站台擁有者。
_Avoid_: 站長、publisher（正文用中文）

**發佈商 ID**（publisher ID）:
AdSense 帳號的唯一識別，所有廣告請求的歸屬單位。
_Avoid_: pub ID、client ID

**廣告單元**（ad unit）:
在 AdSense 後台建立的一個投放單位，持有單一版位的投放設定；一個版位對應一個廣告單元，唯定位錨點對應兩個（上格／下格）。
_Avoid_: 廣告位、ad slot

**版位**（placement）:
廣告在站台版面上的一個呈現位置；本專案共四個：文章開頭、文章結尾、文章列表每 5 篇穿插、定位錨點（sticky rail）。
_Avoid_: 廣告位（易與廣告單元混淆）

**定位錨點廣告**（anchor ad）:
側欄 sticky rail 廣告：頁內 in-flow 容器以 CSS `position:sticky` 附著於視窗上方，捲動時跟隨但不覆蓋內容，僅大螢幕啟用（Ray 實站方案）。
_Avoid_: 浮動廣告、floating box、fixed 廣告

**待命載入**（lazy-load on scroll）:
廣告先以「待命」狀態預留版位，捲動進入視窗才開始載入投放。
_Avoid_: 懶載入、lazy loading

**最低合規**:
通過 AdSense 政策所需的最低揭露門檻——隱私權政策頁與 ads.txt，不含同意管理橫幅。
_Avoid_: 完整合規

**網站審核**（site review):
Google 對新增站台是否允許投放廣告的審查；其結果與時程不計入本 effort 的終點。
_Avoid_: 過審、審核通過
