---
title: Promise、async/await 與 Event Loop
description: "介紹 Promise、async/await 與 Event Loop，理解非同步工作的執行順序、錯誤處理及循序與共同等待。"
slug: typescript/promise-async-await-event-loop
series: typescript
order: 5
tags:
  - typescript
  - javascript
  - promise
  - async-await
  - event-loop
pubDate: 2026-09-18
lastModDate: ''
draft: false
ogImage: true
toc: true
share: false
giscus: true
search: true
---

Day 4 確認了 callback 被呼叫時可能失去 `this`。交給計時器與 Promise 後，還要回答：它何時取得執行機會？

先看型旅載入題目時的簡化程式：

```js
console.log("開始載入");

setTimeout(() => {
  console.log("逾時提示");
}, 0);

Promise.resolve().then(() => {
  console.log("處理題目資料");
});

console.log("顯示載入中");
```

輸出順序是：

```text
開始載入
顯示載入中
處理題目資料
逾時提示
```

`setTimeout` 寫成 `0`，仍然不會插進目前正在執行的程式。Promise handler 和計時器 callback 也有不同的排程時機。

## Promise 表示尚未完成的結果

網路請求與計時器不會立刻完成。Runtime 可以先啟動工作並繼續執行程式，等結果出現後再處理。Promise 是表示這個未來結果的物件。

一個 Promise 會處於以下狀態之一：

- `pending`：尚未完成。
- `fulfilled`：已成功完成並帶有結果。
- `rejected`：已失敗並帶有原因。

Promise 完成後不會再改變結果。先用計時器模擬載入一道題目：

```js
function loadQuestion() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id: "day-05-01", prompt: "Promise 有哪些狀態？" });
    }, 500);
  });
}

const questionPromise = loadQuestion();
console.log(questionPromise); // 此時仍是 pending
```

`loadQuestion()` 立即回傳 Promise，不會直接交回題目。此時計時器 callback 還沒執行，所以 Promise 仍是 pending。

使用 `.then()` 可以登記 fulfilled 後要做的事。它也會回傳新的 Promise，因此後續步驟可以接續處理；若其中一步拋出錯誤，後面的 `.catch()` 可以處理 rejection。

```js
loadQuestion()
  .then((question) => console.log(question.prompt))
  .catch((error) => console.error("載入失敗", error));
```

建立 Promise 時也要分清楚兩種 callback。傳給 `new Promise(...)` 的 executor 會立刻同步執行；`.then()`、`.catch()` 與 `.finally()` 登記的 handler 才會在稍後以 microtask 執行。

## Event Loop 如何安排 Task 與 Microtask？

事件迴圈（Event Loop）是 Runtime 選擇可執行工作，讓它取得執行機會的機制。同步程式結束後，它依排程規則決定接著處理什麼。

Task 是 Event Loop 安排的工作，例如 script 或計時器 callback。微任務（microtask）是目前 task 結束後、下一個 task 前優先處理的工作；Promise handler 是常見例子。micro 指的是排程位置，和工作量大小無關。

> [!NOTE] 佇列 / Queue
> 佇列是尚未執行的工作等待區。Task 和 microtask 分別進入佇列，Runtime 再依排程規則處理。

以瀏覽器為例：

1. 執行同步程式，直到 call stack 清空。
2. 處理完 microtask queue。
3. 再選擇下一個 task，例如已到期的計時器 callback。

因此同步程式結束後，開頭的 Promise handler 會在計時器 task 前輸出。

<!--
圖片預留：![同步程式清空 call stack 後，Runtime 先清空 Promise microtask queue，再執行下一個計時器 task。](../../../assets/blog/typescript/day-05-event-loop-task-microtask.webp)
-->

這個瀏覽器模型適合判斷常見輸出順序，無法涵蓋所有 Runtime 的完整實作。瀏覽器還要處理畫面更新與使用者事件，Node.js 也有自己的事件迴圈階段。遇到依賴特定環境的程式，仍要查看該環境的規則。

[WHATWG HTML Standard：Event loops](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)

## `async`／`await` 沒有把非同步變成同步

`async`／`await` 讓 Promise 流程比較接近日常閱讀順序：

```js
async function showQuestion() {
  try {
    const question = await loadQuestion();
    console.log(question.prompt);
  } catch (error) {
    console.error("載入失敗", error);
  }
}

showQuestion();
```

`async function` 一定回傳 Promise。執行到 `await` 時，只有目前這次函式的後續流程會暫停；JavaScript Runtime 仍能繼續執行其他同步程式與已排程工作。Promise fulfilled 後，`await` 取得結果並繼續；如果 Promise rejected，`await` 會在該位置拋出錯誤，交給 `try...catch`。

如果 async function 沒有在內部處理錯誤，呼叫端就要 `await` 它回傳的 Promise，或接上 `.catch()`。外層同步 `try...catch` 不會自動接住稍後發生的 rejection。

## HTTP Response 與業務成功要分開判斷

在瀏覽器使用 `fetch` 時，網路層無法完成請求可能讓 Promise rejected；但伺服器回覆 `404`、`500` 等 HTTP 狀態時，`fetch` 通常仍會 fulfilled。程式必須自行檢查 `response.ok` 或 `response.status`。

```js
async function loadQuestions() {
  const response = await fetch("/api/questions");

  if (!response.ok) {
    throw new Error(`載入題目失敗：HTTP ${response.status}`);
  }

  return response.json();
}
```

取得 response、成功狀態與可信資料是不同判斷。`response.json()` 只解析 JSON，不會驗證資料結構。

[MDN：Using the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)

## 先判斷資料依賴，再決定循序或共同等待

型旅頁面同時需要題目和使用者進度。若兩份資料互不依賴，連續 `await` 會等第一個完成後才啟動第二個：

```js
const questions = await loadQuestions();
const progress = await loadProgress();
```

可以先啟動兩個工作，再用 `Promise.all` 一起等待：

```js
const questionsPromise = loadQuestions();
const progressPromise = loadProgress();

const [questions, progress] = await Promise.all([
  questionsPromise,
  progressPromise,
]);
```

兩個函式被呼叫時便啟動工作，`Promise.all` 負責組合結果；任一項 rejected，組合結果也會 rejected。這裡的「一起」只表示等待時間重疊，JavaScript 沒有因此把程式分派到多顆 CPU 同時計算。

如果載入題目必須先取得 session ID，就應保留循序執行，不能只為了看起來更快而改用 `Promise.all`。

## 延伸到 AI API：一次拿完，或分段接收

一般 HTTP 呼叫常用一個 Promise 表示完整結果。AI 回覆可能較長，API 也可能把結果分成多段送回。應用程式收到一段就能先處理，不必等全部內容完成：

```js
const events = await requestEvents();

for await (const event of events) {
  console.log(event);
}
```

`requestEvents` 是用來說明控制流程的示意名稱，沒有對應特定 SDK。分段接收讓程式在完整結果產生前就開始處理，等待依然存在。實作時仍要依 API 文件確認每段資料的格式、完成訊號、錯誤與取消方式。

## 今日練習

[day5 | 型旅 TypeTrail](https://typetrail.johnsonchen.dev/#/day/5)

## 結論

- 同步程式結束後，瀏覽器會先處理 microtask，再執行下一個 task；`setTimeout(..., 0)` 仍需等待下一個 task。
- `async function` 回傳 Promise，`await` 只暫停目前函式的後續流程；非同步錯誤仍要沿著 Promise 處理。
- 互不依賴的工作可以先啟動後共同等待，有資料依賴的工作則維持循序執行。

這套執行模型說明了非同步工作何時繼續、如何失敗。當程式開始分散到多個檔案，下一個需要釐清的問題就是模組如何公開內容，以及 Runtime 如何找到彼此的依賴。
