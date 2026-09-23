---
title: 物件型別：從資料結構開始建模
description: "介紹 TypeScript 的物件型別、可選與唯讀屬性、唯讀陣列、import type，以及在 Angular 中的型別使用。"
slug: typescript/object-type
series: typescript
order: 9
tags:
  - typescript
  - javascript
  - object-type
  - readonly
  - angular
pubDate: 2026-09-22
lastModDate: ''
draft: false
ogImage: true
toc: true
share: false
giscus: true
search: true
---

函式有時要一次接收好幾個相關的值。拿選擇題資料來說，題目編號、文字和選項經常一起傳遞。若拆成多個參數，呼叫時容易搞混順序；編號和文字又同樣是字串，放反了也可能通過型別檢查。

把這些資料放進同一個物件，函式就能用欄位名稱讀取。這篇用 TypeScript 的物件型別，檢查一筆資料需要哪些欄位、各欄位接受什麼值。

## 一筆題目需要哪些欄位

物件型別（object type）描述物件有哪些屬性，以及每個屬性接受什麼型別。屬性（property）是物件中可以用名稱讀取的值，例如用 `question.prompt` 讀取題目文字。同一份物件型別要重複使用時，可以用 `type` 替它取名，這稱為型別別名（type alias）。`interface` 也能描述物件型別；這裡先看 `type` 的寫法：

```ts
type Question = {
  id: string;
  prompt: string;
  type: string;
  options: string[];
};

const question: Question = {
  id: "day-09-01",
  prompt: "哪個關鍵字用來匯出？",
  type: "choice",
  options: ["export", "import"],
};
```

這裡把物件型別命名為 `Question`，`const question: Question` 就會依這份規則檢查資料。

`id` 存題目編號，`string[]` 表示字串陣列。這四個欄位都必須提供；少了 `options` 或在選項中放入數字，編譯器會指出錯誤。

## 可選欄位與唯讀欄位

可選屬性（optional property）是建立物件時可以省略的欄位。某些題目尚未提供解析，就可以把 `explanation` 寫成 `explanation?: string`。

`readonly` 限制透過該屬性重新指定值。題目編號建立後不應更換，所以寫成 `readonly id: string`。下面更新 `Question`，也將選項設成唯讀陣列。若在同一個檔案練習，請用這段取代前面的範例：

```ts
type Question = {
  readonly id: string;
  prompt: string;
  type: string;
  readonly options: readonly string[];
  explanation?: string;
};

const question: Question = {
  id: "day-09-01",
  prompt: "哪個關鍵字用來匯出？",
  type: "choice",
  options: ["export", "import"],
};
```

因為 `explanation` 是可選欄位，讀取時可能得到 `undefined`。因此下面的函式會需要在缺少解析時回傳提示文字：

```ts
function displayExplanation(question: Question) {
  if (question.explanation === undefined) {
    return "尚未提供解析";
  }
  return question.explanation;
}

console.log(displayExplanation(question)); // 尚未提供解析
```

## 唯讀屬性與唯讀陣列

`readonly` 放的位置不同，限制的操作也不同：

- `readonly id: string`：不能透過 `question.id = "day-09-02"` 更換題目編號。
- `readonly options: string[]`：不能換掉整個 `options` 陣列，但仍能透過 `question.options.push(...)` 加入選項。
- `readonly options: readonly string[]`：連透過 `question.options` 增刪或修改選項也會被型別檢查擋下。

這些限制只在 TypeScript 型別檢查時生效。編譯後的 JavaScript 不會凍結資料；如果另一個變數也指向同一個陣列，仍能透過那個變數修改選項。

![左側的 readonly options: string[] 阻止更換整個陣列，但允許透過 options 新增選項；右側的 readonly options: readonly string[] 也阻止透過 options 修改陣列內容。兩者都只在 TypeScript 型別檢查時生效。](../../../assets/blog/typescript/day-09-readonly-property-array.png)

## 把型別交給其他檔案使用

如果另一個檔案也要使用 `Question`，可以把型別宣告放進 `src/question-types.ts`。在 `type` 前加上 `export`，其他檔案才能匯入這個名稱：

```ts
// src/question-types.ts
export type Question = {
  readonly id: string;
  prompt: string;
  type: string;
  readonly options: readonly string[];
  explanation?: string;
};
```

接著，`src/main.ts` 用 `import type` 匯入，讓函式參數沿用同一份欄位規則：

```ts
// src/main.ts
import type { Question } from "./question-types.js";

function showQuestion(question: Question) {
  console.log(question.prompt);
}
```

這裡用 `import type`，因為 `Question` 只用來標註函式參數。要匯入程式執行時會呼叫的函式，就用一般的 `import`。

## 延伸到 Angular：這個概念在框架中如何出現？

Angular 元件也能使用同一個 `Question` 型別。下面是元件接收題目資料的部分範例：

```ts
import { input } from "@angular/core";
import type { Question } from "./question-types";

export class QuizQuestionComponent {
  readonly question = input.required<Question>();
}
```

`Question` 標明這個輸入的資料形狀，Angular 編譯模板時會檢查傳入值的型別。

## 今日練習

[day9 | 型旅 TypeTrail](https://typetrail.johnsonchen.dev/#/day/9)

## 結論

物件型別描述資料有哪些欄位、哪些欄位可以省略，以及哪些屬性不應重新指定。這些規則幫助編譯器檢查程式碼；外部資料仍要在執行時驗證。若欄位只允許幾個固定值，還需要把可用的值寫進型別。
