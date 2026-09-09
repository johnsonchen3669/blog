---
title: AI 都會寫程式了，為什麼還要學 TypeScript？
description: "說明「從 JavaScript 到 TypeScript」系列的學習方向與適合讀者。"
slug: typescript/introduction
series: typescript
order: 1
tags:
  - typescript
  - javascript
  - ai
  - introduction
pubDate: 2026-09-01
lastModDate: ''
draft: false
ogImage: true
toc: true
share: false
giscus: true
search: true
---

<!--
ILLUSTRATION TODO — 系列首圖
建議檔名：day-01-ai-code-review-cover.webp
建議比例：16:9
替代文字：開發者拿著 TypeScript 契約，驗收 AI 機器快速產生的程式碼卡片。

生圖 Prompt：
Create a distinctive editorial vector illustration for a Traditional Chinese programming article titled “AI 都會寫程式了，為什麼還要學 TypeScript？”.

Scene: a human software developer stands at a technical inspection desk, reviewing code cards produced rapidly by an abstract AI machine. The AI machine is represented as a fast mechanical plotter or code-generating apparatus, not a humanoid robot. Several code cards move along a trail toward the developer. The developer holds a precise contract blueprint marked with TypeScript-style braces, union symbols, check marks, and structured data shapes. Some generated cards pass through the contract frame; one card containing an incompatible shape is stopped.

Core idea: AI generates quickly, but the developer defines the rules and decides what can enter the project.

Visual style: clean editorial vector art, geometric shapes, confident heavy outlines, subtle paper-grid texture, technical field-guide aesthetic, intelligent and approachable rather than futuristic. Use a restrained palette of deep ink navy #071C2C, electric blue #2457FF, mint green #C9F55A, coral orange #FF6542, and pale paper #EEF6F6. Strong visual hierarchy, generous negative space, suitable for a software engineering article.

Composition: wide 16:9 landscape, main action centered slightly right, leave clear negative space on the upper-left for the article title. No gradients, no photorealism, no 3D render, no cyberpunk neon, no generic glowing brain, no Matrix-style code rain, no company logos, no readable paragraphs, no watermark. Do not render the article title inside the image.
-->

上一屆整理 Angular 時，主要把重點放在框架的使用方式。
這次想回到基本功：這些框架寫法，背後有哪些 JavaScript 與 TypeScript 規則？

現在，AI 已經大幅改變程式撰寫流程。當 AI 幾秒內就能寫出函式、型別和測試，我們還需要自己學 TypeScript 嗎？

我的答案是：需要，但目的不只是「學會寫」。我們還要能看懂 AI 交出的程式、定義程式必須遵守的規則，並判斷這份結果能不能放進專案。

這也是這次 30 天系列想和你分享的內容。

## 這次想分享什麼？

要確認程式真的符合需求，我們至少要繼續追問：

- 它使用的資料結構符合專案規則嗎？
- 它有沒有漏掉 `null`、錯誤或其他可能狀態？
- 它呼叫的 API 真的存在嗎？
- 程式通過型別檢查後，執行時就一定安全嗎？

這些問題不能只交給 AI 回答，因為它提供的內容也需要被驗收。哪些結果算正確，仍然要由開發者決定。

## 這系列適合誰？

這系列預設你已經具備一些基本程式概念：

- 知道變數、條件判斷與函式的用途。
- 看得懂基本的陣列與物件操作。
- 寫過一點 JavaScript，或曾經請 AI 產生 JavaScript／TypeScript。
- 遇到 TypeScript 錯誤時，常常知道怎麼消除紅字，卻不確定它真正想保護什麼。

這次會在適合的主題中使用 Angular 作為延伸案例。例如談到 Class 時，會說明框架如何使用 JavaScript 與 TypeScript 的語法。

如果你平常會使用 `any`、`as`，或把 AI 建議的修改直接貼上，讓程式通過編譯，這套系列也適合你。重點不是禁止某個語法，而是知道使用它時放棄了哪些檢查。

## 執行環境

本系列的程式範例會以 TypeScript 7.0 為準。TypeScript 7.0 的編譯器改以 Go 重寫，官方表示在許多程式碼庫中可獲得約 10 倍的速度提升。即使使用不同版本，大部分 JavaScript 行為與型別觀念仍然可以跟著練習；若版本差異會影響範例，我會在文章中另外標示。

你可以直接把範例貼到官方的 [TypeScript Playground](https://www.typescriptlang.org/play/) 練習。它不需要先安裝 Node.js 或 TypeScript；打開頁面後，貼上文章中的範例，就能看到 TypeScript 的檢查結果與編譯後的 JavaScript。

官方也提供了 [使用說明](https://www.typescriptlang.org/_playground-handbook/overview.html)。

版本資訊可參考 [TypeScript 7.0 官方公告](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)。

## 30 天會怎麼安排？

整個系列分成五個階段：

1. **Day 1–6｜JavaScript Runtime**：動態型別、Scope、Closure、Prototype、非同步與 Module。
2. **Day 7–14｜TypeScript 基礎**：編譯期、型別推論、Object、Union、Narrowing 與不確定性。
3. **Day 15–22｜型別設計**：Interface、Generic、Utility Type、Conditional Type 等。
4. **Day 23–26｜資料邊界與框架**：Schema、API 型別、錯誤設計，以及 Angular 延伸。
5. **Day 27–30｜AI 實戰**：審查 AI 程式碼、Structured Output、Tool Calling、MCP 與 Agent。

系列也會搭配獨立的「型旅 TypeTrail 網站」，每篇文章對應一份五題測驗。

接下來，我們就來看今天的主題。

## 程式看起來沒問題，是真的正確嗎？

先看一段程式。這裡掌握大致概念就好，語法細節會在後面的章節說明。

```ts
type QuestionType = "choice" | "fill";

interface Question {
  id: string;
  prompt: string;
  type: QuestionType;
}

function createQuestion(): Question {
  return {
    id: "day-01-01",
    prompt: "TypeScript 會在什麼時候檢查型別？",
    type: "text",
  };
}
```

這段範例第一眼看起來可能沒有問題：它建立了一道題目，內容也符合今天的主題。

但網站只定義了 `"choice"` 和 `"fill"` 這兩種題型，沒有 `"text"`。TypeScript 會指出 `"text"` 不符合 `QuestionType`。

這段程式可以讓我們分清楚三件事：語法正確、型別正確，以及執行正確。

<!--
ILLUSTRATION TODO — 三種不同的正確
建議檔名：day-01-three-levels-of-correctness.webp
建議比例：16:9
替代文字：AI 產生的程式依序通過語法正確、型別正確、執行正確三道關卡，最後仍由開發者判斷是否接受。

生圖 Prompt：
Create a clear editorial infographic explaining three separate checkpoints for accepting AI-generated TypeScript code.

Layout: a horizontal trail moving from left to right. On the far left, an abstract AI code generator produces a small code card. The card then passes through three visibly different checkpoints:

1. “語法正確”
Visual symbol: balanced brackets, quotation marks, and a parser check.
Meaning: the program structure can be parsed.

2. “型別正確”
Visual symbol: a rigid TypeScript contract frame that accepts only matching data shapes; show “choice | fill” as the allowed shape while a small coral “text” token is rejected.
Meaning: the code follows the declared compile-time contract.

3. “執行正確”
Visual symbol: the code running in a real environment connected to an API, network, empty array, and test result indicators.
Meaning: runtime behavior and actual requirements still need validation.

After the third checkpoint, show a human developer making the final acceptance decision. Make it visually clear that passing one checkpoint does not automatically guarantee passing the next one. The checkpoints must be sequential, not overlapping circles and not a Venn diagram.

Include only these exact Traditional Chinese labels:
“AI 產生”
“語法正確”
“型別正確”
“執行正確”
“人工判斷”

Visual style: precise flat vector infographic, technical field-guide aesthetic, thick ink outlines, simple geometric icons, subtle grid-paper background. Palette: deep ink navy #071C2C, electric blue #2457FF, mint green #C9F55A, coral orange #FF6542, pale paper #EEF6F6. Wide 16:9 composition, highly legible at article width, generous spacing.

No decorative robot, no photorealism, no 3D, no gradients, no cyberpunk effects, no tiny paragraphs, no extra labels, no watermark. Ensure all requested Traditional Chinese text is spelled exactly as provided.
-->

### 語法正確

這段程式的括號和關鍵字都寫對了，`"text"` 也是合法的 JavaScript 字串。

但語法正確只代表這段程式能被讀懂，還不代表它符合我們定義的資料規則。

### 型別正確

型別正確，表示資料和操作符合我們事先寫好的規則。這個例子只允許 `"choice"` 與 `"fill"`，所以修正後應該是：

```ts
function createQuestion(): Question {
  return {
    id: "day-01-01",
    prompt: "TypeScript 會在什麼時候檢查型別？",
    type: "fill",
  };
}
```

這裡不是不能使用 `"text"`，而是「文字作答題」這個需求描述，沒有對應到程式裡事先定義的題型名稱。因此，`"text"` 雖然是合法字串，卻不符合 `QuestionType`。TypeScript 能在程式執行前把這個不一致標示出來。

### 執行正確

通過型別檢查，仍不代表程式在執行時一定符合需求。例如：

- API 實際回傳的資料與預期不同。
- 網路請求失敗，程式卻沒有處理。
- 陣列是空的，程式卻假設一定有第一筆資料。
- 每個值的型別都合法，但商業規則本身寫錯了。

TypeScript 能檢查的，是我們已經寫下來，而且編譯器能判斷的規則。外部資料驗證、錯誤處理與測試仍然要另外負責。

## TypeScript 怎麼檢查 AI 寫的程式？

如果只用一句「幫我建立一道文字作答題」描述需求，程式裡可能使用 `"text"`、`"input"` 或 `"short-answer"` 表示題型。這些答案都有道理；但放進同一個網站時，卻會造成不同的資料規則。

當專案先定義 `Question` 與 `QuestionType`，即使資料形狀和預期不同，TypeScript 也能先替我們檢查：

- 回傳值有沒有完整的 `Question` 結構？
- `type` 是否使用允許的值？
- 函式可能沒有結果時，回傳型別有沒有說清楚？
- 呼叫端是否傳入錯誤的資料形狀？

這些不一致不必等到人工逐行閱讀，才一個個找出來。

這也說明了為什麼還要學 TypeScript：

- 這份資料有哪些合法狀態？
- 哪些狀態不應該同時存在？
- 輸入與輸出之間有什麼關係？
- 哪些資料來自外部，不能直接相信？
- 失敗時，呼叫端需要知道什麼？

即使程式是根據規則寫出來的，規則是否完整、是否符合產品需求，仍需要開發者判斷。

## 型別檢查只是其中一道關卡

TypeScript 負責其中重要的一層型別檢查，但不是全部。

因此，接下來五天仍然會圍繞 TypeScript，但會先回頭看 JavaScript Runtime 這個基礎。面對一段程式時，我們會依序追問五件事：

1. **值**：Runtime 實際收到的是字串、數字，還是其他型別？
2. **狀態**：Callback 保留或共享了哪一份外部狀態？
3. **呼叫方式**：函式執行時，`this` 到底指向誰？
4. **時間**：非同步工作何時完成，錯誤又沿著哪條流程傳遞？
5. **依賴**：匯入的值、型別與套件在目前環境中真的存在嗎？

> [!note] 名詞補充｜Runtime 是什麼？
> Runtime 通常翻成「執行期」或「執行環境」，指程式真正執行、取得實際值、呼叫函式，並與外部環境互動的階段。JavaScript 可能在瀏覽器、Node.js 或其他 Runtime 中執行；程式也可能在這時存取網路或檔案，甚至拋出錯誤。
>
> TypeScript 的型別檢查發生在程式執行前的檢查或編譯階段；型別資訊通常不會保留在最後執行的 JavaScript 中。因此，「通過 TypeScript 檢查」和「Runtime 一定正確」是兩件事。

## 結論

- AI 可以加快寫程式的速度，開發者仍然要定義規則並驗收結果。
- 語法正確、型別正確與執行正確是不同問題，不能互相取代。
- TypeScript 不只用來減少手寫錯誤，也能把部分工程規則變成寫程式時的檢查條件。

