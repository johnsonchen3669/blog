---
title: 型別縮小：讓條件判斷幫忙確認型別
description: "介紹 TypeScript 如何透過 typeof、in、instanceof、真假值檢查與控制流程分析縮小型別。"
slug: typescript/type-narrowing
series: typescript
order: 11
tags:
  - typescript
  - javascript
  - narrowing
  - union-types
  - control-flow
pubDate: 2026-09-24
lastModDate: ''
draft: false
ogImage: true
toc: true
share: false
giscus: true
search: true
---

前一篇用聯集列出題型允許的值。當一個變數有多種可能時，使用它的程式還得確認目前拿到哪一種。假設作答資料可能是一段文字，也可能是一組選項。

型別縮小（narrowing）是 TypeScript 根據條件判斷與程式路徑，推算某個位置還可能出現哪些型別。判斷式會在 JavaScript 執行時檢查值；TypeScript 則在編譯時讀取這些判斷，幫我們檢查每條路徑上的操作。

## 用 `typeof` 分開處理答案

下面的聯集表示答案可能是字串或字串陣列。因為字串沒有 `join()`。先檢查答案是否為字串，就能分開處理：

```ts
type SubmittedAnswer = string | string[];

function answerText(answer: SubmittedAnswer): string {
  if (typeof answer === "string") {
    return answer;
  }

  return answer.join("、");
}
```

> [!NOTE]
> `typeof` 會回傳值在執行時的型別名稱，TypeScript 可依判斷結果縮小聯集。更多範例可參考 [TypeScript Handbook 的型別縮小章節](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)。

![SubmittedAnswer 是 string 或 string[]；經過 typeof answer === "string" 判斷後，成立的路徑只處理字串，另一條路徑只處理字串陣列。](../../../assets/blog/typescript/day-11-narrowing-control-flow.png)

### `typeof null` 也會得到 `"object"`

對 `null` 和陣列使用 `typeof`，得到的都是 `"object"`。因此，對 `string[] | null` 使用 `typeof items === "object"`，仍會留下 `null`；直接讀取陣列元素可能出錯。

這裡要辨識陣列，可以使用 `Array.isArray()`：

```ts
function firstItem(items: string[] | null): string | undefined {
  if (Array.isArray(items)) {
    return items[0];
  }

  return undefined;
}
```

## 用 `in` 檢查物件有哪些欄位

當聯集的兩種物件各有不同的欄位，可以用 `in` 判斷欄位是否存在：

```ts
type QuestionContent =
  | { options: string[] }
  | { answer: string };

function describeQuestion(question: QuestionContent): string {
  if ("options" in question) {
    return `選項：${question.options.join("、")}`;
  }

  return `填空答案：${question.answer}`;
}
```

`"options" in question` 會檢查物件本身或原型鏈上是否有這個欄位，因此能區分這裡的兩種物件。若兩種物件都把 `options` 設為可選欄位，還需要檢查其他能區分它們的欄位。

## 用 `instanceof` 判斷實例

`instanceof` 用來判斷一個值是否為指定類別的實例。下面的值可能是 `Date` 物件或字串；判斷後，TypeScript 就能在各分支縮小型別：

```ts
function dateLabel(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value.trim();
}
```

`instanceof Date` 成立後，TypeScript 會把 `value` 視為 `Date`，因此可以使用 `Date` 的方法，例如 `toISOString()`。

## 直接用值當條件，會排除哪些值？

直接把值放進 `if` 也能縮小型別，條件會依 JavaScript 的真假值（truthiness）判斷。`""`、`0`、`null` 和 `undefined` 都是假值。作答資料是 `string | undefined` 時，`if (answer)` 會把空字串和未作答一起排除；若空字串仍算一次作答，就要明確檢查 `undefined`：

```ts
function answerStatus(answer: string | undefined): string {
  if (answer !== undefined) {
    return `已作答：${answer}`;
  }

  return "尚未作答";
}

console.log(answerStatus("")); // "已作答："
```

如果產品把空字串也當成「尚未作答」，`if (answer)` 才符合需求。空陣列和空物件都是真值；要檢查陣列裡有沒有項目，應看 `length`。

## `return` 也會改變後面的可能性

TypeScript 會分析程式能走到哪裡，這稱為控制流程分析（control-flow analysis）。每個提早結束的分支，都會讓後面的程式少一種可能：

```ts
function summarize(value: string | number | null): string {
  if (value === null) {
    return "沒有結果";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  return value.toFixed(2);
}
```

第一個 `return` 處理了 `null`；第二個處理了字串。最後一行能執行時，`value` 只剩數字。若不同分支都繼續往下走，TypeScript 會把那些路徑重新合併，再計算當下可能的型別。

條件判斷也能用來檢查外部資料，但檢查內容要符合實際需求。例如 `typeof value === "object"` 會接受 `null`，也沒有確認物件有哪些欄位；單靠它無法驗證一筆完整題目。型別縮小只根據已寫出的條件推導，資料是否可信取決於檢查是否足夠。

## 今日練習

[day11 | 型旅 TypeTrail](https://typetrail.johnsonchen.dev/#/day/11)

## 結論

聯集列出所有可能，條件判斷讓程式確認目前拿到哪一種值。選擇 `typeof`、`in`、`instanceof` 或明確比較時，要先想清楚條件在執行時究竟檢查了什麼。資料有不同結構時，明確的辨識欄位能讓分支判斷更容易讀懂。
