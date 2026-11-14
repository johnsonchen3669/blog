# AdSense 現代整合：官方規範與 Astro 實作選項

研究票：`issues/0002-research-adsense-modern-integration.md`
查證日期：2026-11-14。所有結論均取自 Google 一手來源（AdSense Help、Google Ads 政策、Google 開發者文件、npm registry、Astro 官方目錄）。

目標情境：Astro 7 靜態部落格（<https://johnsonchen.dev/>），手動版位＋捲動到版位才載入（待命載入），四個版位：文章開頭、文章結尾、文章列表每 5 篇穿插、底部定位錨點。

---

## 1. 腳本載入規則

### 1.1 官方廣告代碼形態

現代（非同步）AdSense 廣告代碼由三部分組成，官方文件中的範例一致：

```html
<script async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
  crossorigin="anonymous"></script>
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="YYYYYYYYYY"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
  (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

來源：<https://support.google.com/adsense/answer/9183363>（How to modify your responsive ad code）、<https://support.google.com/adsense/answer/9183460>（How to use responsive ad tag parameters）、<https://support.google.com/adsense/answer/1354736>（Modifications of AdSense ad code）。AdSense 自己的部分範例省略 `?client=` 參數（如 <https://support.google.com/adsense/answer/10762946> 的 Example 1），兩種寫法都出現在官方文件；`data-ad-client` 一定需要。

### 1.2 參數正確用法

- `data-ad-client`：發布商 ID，`ca-pub-` 前綴＋16 位數字（範例：`ca-pub-1234567890123456`）。來源：<https://support.google.com/adsense/answer/9183363>。
- `data-ad-slot`：廣告單元 ID（在 AdSense 後台建立 display ad unit 後取得，例如 `1234567890`）。來源：<https://support.google.com/adsense/answer/9183363>。
- `data-ad-format`：回應式廣告的形狀參數，預設 `"auto"`（啟用自動縮放）；可改為 `"rectangle"`、`"vertical"`、`"horizontal"` 或逗號組合（如 `"rectangle, horizontal"`）。來源：<https://support.google.com/adsense/answer/9183460>。
- `data-full-width-responsive`：`"true"` 讓廣告在手機直向時更常擴展為全螢幕寬，Google 官方**建議設為 `"true"`**（收益上限最高）；設 `"false"` 可停用但可能降低收益。來源：<https://support.google.com/adsense/answer/9183460>。

### 1.3 代碼修改與延遲載入

- 政策允許修改廣告代碼，**前提是「不會人為抬高廣告成效或損害廣告主」**；文件明言「原則上建議原樣複製貼上」。來源：AdSense Program policies 的 "Ad behavior" 節：<https://support.google.com/adsense/answer/48182>。
- 官方列為「acceptable modifications」的項目包含 CSS/media query 控制尺寸（回應式）、A/B 測試（含動態 `google_ad_slot` 參數）等；這些修改**不會違反政策**。來源：<https://support.google.com/adsense/answer/1354736>、<https://support.google.com/adsense/answer/9183363>。
- **依需求（延遲）載入腳本本身沒有被禁止**，但有兩條相關紅線：
  1. 「Hiding ad units at anytime (e.g., `display:none`), unless you're implementing a responsive ad unit」被列為**應避免的技術**。來源：<https://support.google.com/adsense/answer/1354736>。
  2. AdSense 明言**不建議先載入「初始隱藏」的廣告單元**再於狀態改變時顯示。來源：<https://support.google.com/adsense/answer/10762946>。
- 因此合規的待命載入做法是：**捲動接近版位時才插入 `<ins>` 並呼叫 push**，而不是先插入隱藏的 `<ins>` 再顯示。
- Google 自家廣告技術（GPT／Publisher Ads Audits）把「below-the-fold 延遲請求與算繪直到接近可見」列為**建議做法**（lazy loading 可提升 viewability），可佐證延遲載入方向與 Google 最佳化建議一致。來源：<https://developers.google.com/publisher-ads-audits/reference/audits/ads-in-viewport>、<https://developers.google.com/publisher-tag/samples/lazy-loading>（GPT 為 Ad Manager 文件，非 AdSense 規範本身，僅供態度佐證）。

### 1.4 `push({})` 時機

- 每個 `<ins>` 廣告單元配一個 `(adsbygoogle = window.adsbygoogle || []).push({})`，放在該 `<ins>` 之後；這是所有官方範例的一貫寫法。來源：<https://support.google.com/adsense/answer/9183363>、<https://support.google.com/adsense/answer/9183460>。
- `window.adsbygoogle` 是 FIFO 佇列（`window.adsbygoogle || []` 的寫法即保證腳本載入前 push 也會排隊），所以「先 push 再等 async 腳本載入」在機制上可行；官方文件並未要求 push 必須在腳本載入後執行。來源：同上範例的慣用寫法。
- 進階用法：`push({ params: { google_ad_slot: mySlotId } })` 可動態指定 slot（用於 A/B）。來源：<https://support.google.com/adsense/answer/1354736>。
- 時機紅線在於**不要製造人造曝光／點擊**（見 §2），而不是 push 的絕對時間點。

---

## 2. 政策紅線：捲動才載入可行嗎？廣告數量／密度限制

### 2.1 「捲動到版位才載入」本身不違反政策，但有界線

- AdSense Program policies 禁止「以任何手段人為抬高曝光與點擊（including manual methods）」；人造曝光才是紅線。**待命載入是減少而非增加曝光**，方向不違反此條。來源：<https://support.google.com/adsense/answer/48182>（Invalid clicks and impressions）。
- 禁止「未經使用者要求就 refresh 頁面或頁面元素」，也禁止以 preset 時間的 pre-roll 擋內容。捲動觸發載入**不是 auto-refresh**（一次性載入、非重複請求），不觸此條；但不得在載入後定時重複請求。來源：<https://support.google.com/adsense/answer/1346295>（Ad placement policies：Auto-refreshing ads）。
- 界線一：不得把廣告單元常駐隱藏（`display:none`）後顯示——見 §1.3。來源：<https://support.google.com/adsense/answer/1354736>、<https://support.google.com/adsense/answer/10762946>。
- 界線二：廣告不得放在「非內容頁」或「專為放廣告而生的頁面」。文章列表「每 5 篇穿插」版位所在頁面是內容頁，沒問題；但穿插單元必須與文章條目明確區隔。來源：<https://support.google.com/adsense/answer/48182>（Ad placement）。

### 2.2 數量與密度

- **沒有每頁廣告數量的硬性上限**。官方現行說法：「Provided you don't place more ads than content on your pages, you can put any combination of ad units and/or search boxes on each page of your site.」並導向其 inventory value policy。來源：<https://support.google.com/adsense/answer/187698>（Increase ad coverage on your site）。
- 「To ensure a positive user experience, maintain a balance between ads and content on your pages.」（多廣告單元頁）。來源：<https://support.google.com/adsense/answer/17958>。
- 即密度規則是**廣告不得多於／壓過內容**，非固定數字。四個版位（開頭、結尾、列表每 5 篇、底部）在長文中遠低於內容量，屬安全範圍；短文章開頭＋結尾兩個版位需目視確認廣告不壓過正文。
- 標示規則：廣告標題只能用「Advertisements」或「Sponsored Links」，不得誤導（如「Resources」）；廣告不得與選單／導覽／下載連結混淆，不得把內容排版成像廣告。來源：<https://support.google.com/adsense/answer/1346295>（Placing ads under a misleading header、Formatting content to mimic ads）、<https://support.google.com/adsense/answer/1282097>（Best practices for ad placement）。
- 其他相關紅線：不得鼓勵點擊、不得以圖片對齊個別廣告、浮動盒（floating box script）中放廣告被明文禁止（見 §6 警訊）。來源：<https://support.google.com/adsense/answer/48182>、<https://support.google.com/adsense/answer/1346295>。

---

## 3. ads.txt

### 3.1 格式

- Google 官方要求的完整單行：

  ```text
  google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0
  ```

  四個欄位依序為：廣告系統網域 `google.com`、你的發布商 ID（`pub-`＋16 位數字）、關係 `DIRECT`、TAG ID `f08c47fec0942fa0`（IAB Tech Lab GDI registry 的 Google 認證識別碼，固定不變）。來源：<https://support.google.com/adsense/answer/12171612>（Ads.txt guide）。
- 檔案必須**依 IAB Tech Lab ads.txt 規格格式化**才能通過驗證；用純文字編輯器存成 `.txt`。來源：<https://support.google.com/adsense/answer/12171612>（Note 指向 ads.txt specification）。
- 放在網域**根目錄**：`https://example.com/ads.txt`。多個廣告網路則追加多行。來源：<https://support.google.com/adsense/answer/12171612>。
- 使用 ads.txt **非強制但強烈建議**（防止假冒版位、避免收益流失）。來源：<https://support.google.com/adsense/answer/12171612>。

### 3.2 注意事項與生效時間

- 變更生效慢：「It may take a few days for your changes to be reflected in AdSense. If your site doesn't make many ad requests it may take up to a month.」低流量新站要特別有耐心。來源：<https://support.google.com/adsense/answer/12171612>。
- 可在 AdSense 後台 Sites → 該站 → **Check for updates** 主動要求重查。來源：<https://support.google.com/adsense/answer/12171612>。
- 狀態轉為 Authorized 且站點 Ready 後，廣告「may take up to an hour to appear」。來源：<https://support.google.com/adsense/answer/12171612>。
- 可爬取性：`www.domain.com/ads.txt` 只有在 `domain.com/ads.txt` 會重新導向到它時才會被爬取；若站點需要 www 存取，需設定對應 redirect。來源：<https://support.google.com/adsense/answer/7679060>。
- 常見格式錯誤排查（缺 publisher ID＝Unauthorized、檔不存在＝Not found）：來源：<https://support.google.com/adsense/answer/12171244>。

---

## 4. 隱私揭露

### 4.1 隱私權政策必備內容（AdSense "Required content"）

官方明列的隱私權政策必載資訊：

1. 第三方廠商（包括 Google）使用 Cookie，依據使用者對你的網站或其他網站的造訪紀錄投放廣告。
2. Google 使用 advertising cookies，使其與其合作夥伴能依據使用者對你的網站及／或其他網站的造訪投放廣告。
3. 使用者可到 **Ads Settings**（即 <https://adssettings.google.com>）停用個人化廣告；或到 <https://www.aboutads.info> 停用第三方廠商 Cookie 的個人化廣告用途。

若未退出第三方廣告投放，還必須：列出投放廣告的第三方廠商與廣告網路名單、提供各廠商政策連結、告知使用者可至該等網站（或 aboutads.info）停用個人化廣告。Google 不代寫隱私政策文字，建議參考 Network Advertising Initiative，Cookie 同意告知參考 <https://cookiechoices.org>。

來源：<https://support.google.com/adsense/answer/1348695>（AdSense Program policies → Privacy and security → Required content）。

### 4.2 DART cookie 說明

- 現行官方必備內容文件使用的是「advertising cookies」字樣，**未再使用「DART cookie」**；DART 是舊版範本用語（DoubleClick 廣告 Cookie 的舊稱）。若既有揭露文字沿用「DART cookie」不違規（屬同義敘述），但建議同時補上現行的 Ads Settings（<https://adssettings.google.com>）／aboutads.info 停用管道。
- Google 現行隱私權說明（How Google uses information from sites or apps that use our services）明載使用者可透過 **Ad Settings** 控制非 Google 網站上的廣告個人化，即使清除 Cookie 仍需到 Ad Settings 才能停用個人化。來源：<https://policies.google.com/technologies/partner-sites>。
- Cookie 類型說明（含廣告用途 Cookie）：<https://policies.google.com/technologies/types-of-cookies>。

### 4.3 同意管理橫幅：哪些地區要求

- **EU user consent policy**（納入 AdSense 條款）：對 **EEA、英國、瑞士** 的使用者，必須取得「合法有效的同意」才能 (a) 在法律要求時使用 Cookie／本地儲存、(b) 為廣告個人化而蒐集／分享／使用個人資料；且必須保留同意紀錄、提供明確的撤回同意指引、清楚揭露每個可能蒐集資料的第三方身分及其資料用途。來源：<https://www.google.com/about/company/user-consent-policy/>。
- **Google 認證 CMP 強制規定**：以個人化廣告服務 EEA／英國使用者，自 **2024-01-16** 起必須使用 Google 認證、整合 IAB TCF 的 CMP；瑞士自 **2024-07-31** 起。未使用認證 CMP 的流量僅能投放非個人化廣告／limited ads。來源：<https://support.google.com/adsense/answer/13554116>（Google consent management requirements…for publishers）。
- 結論：這三個地區的訪客實務上都需要同意管理橫幅（認證 CMP）。其他地區（含美國各州）無 Google 強制橫幅要求，但當地法律（如 CCPA/CPRA 的 opt-out）需自行評估——此點非 Google 文件要求，屬法律層面提醒。

---

## 5. 避免 CLS 的官方建議

### 5.1 預留空間（核心做法）

- web.dev（Google 官方最佳化指南）：「Ads are one of the largest contributors to layout shifts on the web」；對延遲載入內容「layout shifts can be avoided by reserving the space for them in the initial layout」——用 `min-height` 預留，或對回應式廣告用 CSS `aspect-ratio` 預留比例空間。也警告「lazy-loaded content loads fully without space reserved for it」是捲動中 CLS 的常見成因——**對我們的待命載入設計是直接對應的建議：版位容器要先有高度**。來源：<https://web.dev/articles/optimize-cls>、<https://web.dev/articles/cls>。

### 5.2 `data-ad-format="auto"` / full-width-responsive 的行為

- 回應式廣告（display ad unit 預設為回應式）**依可用空間與螢幕尺寸動態計算大小**；螢幕轉向會重新請求正確尺寸；手機直向自動全寬擴展。來源：<https://support.google.com/adsense/answer/9183362>。
- `data-ad-format="auto"` 啟用自動縮放；`data-full-width-responsive="true"` 為官方建議值。來源：<https://support.google.com/adsense/answer/9183460>。
- 官方列出三個會破壞尺寸計算的情境（重要）：
  1. **在廣告代碼之前執行、會隱藏廣告的第三方 JS** 會讓回應式尺寸計算失效（此時必須改用 CSS media query 定尺寸）；
  2. 父容器沒有明確 width（如 floating element）時無法計算；
  3. **父容器固定／限制高度時不應放回應式廣告**（某些裝置上廣告會更高）；要限高必須用官方核准的 CSS media query 寫法。
  來源：<https://support.google.com/adsense/answer/9183362>、<https://support.google.com/adsense/answer/9183363>。
- 未填滿（unfilled）單元的官方行為：只有「在可視區外」的 unfilled 單元會被折疊；視野內的會**保留尺寸顯示空白**（避免 reflow）——這本身有助 CLS 穩定。可用 CSS 隱藏 unfilled 單元（注意 §1.3 的限制：這是對 unfilled 狀態的後置處理，非事前隱藏）。來源：<https://support.google.com/adsense/answer/10762946>。

### 5.3 固定尺寸 vs 回應式

- 固定尺寸單元尺寸完全可預測（CLS 最低），但不隨螢幕／轉向變化；官方對回應式站台**建議用回應式單元**。固定尺寸限制：最小寬 120px、最小高 50px、寬高不得超過 1200px、只有一個維度可大於 450px。來源：<https://support.google.com/adsense/answer/9185043>（Guidelines for fixed-sized display ad units）。
- 折衷（官方核准寫法）：「expandable width + fixed height」或「依螢幕寬度切固定尺寸」的 media query 版本——寬度可變、**高度固定**，CLS 與收益兼顧。來源：<https://support.google.com/adsense/answer/9183363>。
- 建議：四個版位都用「預留 min-height 容器＋media query 固定高度」的回應式變體；文章列表穿插版位高度宜取保守值。

---

## 6. Astro 整合選項

### 6.1 現況調查（2026-11-14）

- **npm 上不存在 `astro-adsense`**（registry.npmjs.org/astro-adsense → 404）；`astro-google-adsense`、`astro-adsense-component`、`@astrocommunity/adsense` 亦皆 404。來源：npm registry（<https://registry.npmjs.org>，查證於 2026-11-14）。
- npm 全站 `adsense` 搜尋結果只見 React／Vue／Angular／Nuxt／Next／Hexo 生態系包裝（`@ctrl/react-adsense`、`@nuxtjs/google-adsense`、`next-google-adsense` 等），無任何 Astro 專用套件；另有框架無關的 web component **`smart-adsense`**（v1.1.1，最近發布 2026-11-04，屬小眾個人專案，採用前需自行評估）。來源：npm registry search API，查證於 2026-11-14。
- Astro 官方 integrations 目錄（<https://astro.build/integrations/>）抓取的頁面內容中**無任何 adsense 相關條目**。來源：查證於 2026-11-14。

### 6.2 建議：自製元件＋原生 script

理由：

1. 沒有維護中、社群驗證過的 Astro 專用套件可依賴；引入小眾第三方包等於把 AdSense 政策風險（代碼修改紅線，§1.3）外包給不受控的程式碼。
2. AdSense 整合的本體只是一段靜態 HTML（`<ins>`＋一個 push）＋一次性的腳本載入，Astro 元件天生擅長；`<script>`（bundled module）或 `<script is:inline async>` 都能承載官方腳本。
3. 待命載入需要的 IntersectionObserver 邏輯不到 30 行，自製可控且可隨官方文件更新即時調整。
4. 政策面要求修改最小化（§1.3），薄薄一層自製封裝比通用套件的抽象更安全。

建議架構：單一 `AdSlot.astro`（props：`client`／`slot`／`format`／預留高度）輸出 `<ins>`＋push；共用一個 `adsbygoogle.js` script 注入（每頁只載一次）；IntersectionObserver rootMargin 約 200–300px 時才插入 `<ins>` 並 push。Astro 官方 script 指南：<https://docs.astro.build/en/guides/scripts/>。

---

## 超出六題但影響實作的警訊

1. **不要用「先隱藏後顯示」實作待命載入**。`display:none` 廣告單元（非回應式情境）屬官方列舉應避免技術，且官方不建議初始隱藏的單元。正確做法是捲動接近時才插入 `<ins>`＋push。來源：<https://support.google.com/adsense/answer/1354736>、<https://support.google.com/adsense/answer/10762946>。
2. **「底部定位錨點」若做成浮動／sticky 廣告，踩到紅線**：Program policies 明文禁止「Place ads in a floating box script」；且貼近導覽列易觸「accidental clicks」違規。底部版位應是頁面流內（in-flow）的錨點區塊（`#comment`／footer 前），不是浮動覆蓋層。來源：<https://support.google.com/adsense/answer/48182>、<https://support.google.com/adsense/answer/1346295>。
3. **JS 順序陷阱**：若我們的載入腳本在 adsbygoogle.js 之前執行且影響廣告可見性／容器寬度，回應式尺寸計算會失效（見 §5.2）；容器必須有明確寬度，高度限制必須走 media query。
4. **EEA／英國／瑞士訪客需要 Google 認證 CMP**（TCF），否則只能投放非個人化廣告，收益打折；同時隱私權政策＋同意紀錄／撤回機制是政策義務。來源：<https://support.google.com/adsense/answer/13554116>、<https://www.google.com/about/company/user-consent-policy/>。
5. **ads.txt 生效可能拖數天到一個月**（低流量站），加上新站審核期，整條變現之路的等待時間要先納入時程。來源：<https://support.google.com/adsense/answer/12171612>。
6. **「Fill empty in-page ads」預設開啟**（2025-07 起逐步為所有發布商啟用）：unfilled 版位可能顯示 Google 的「內容建議」而非空白，可在 Brand safety → Content → Blocking controls 關閉。這會影響版位視覺與點擊行為的解讀。來源：<https://support.google.com/adsense/answer/16302564>。
7. 廣告標示只能用「Advertisements」／「Sponsored Links」，列表每 5 篇穿插的版位要與文章卡片明確區隔（避免「內容模仿廣告／廣告模仿內容」雙向違規）。來源：<https://support.google.com/adsense/answer/1346295>、<https://support.google.com/adsense/answer/1282097>。
