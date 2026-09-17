---
title: Prototype、Class 與 this
description: "介紹 JavaScript 的原型鏈、class、this、bind 與箭頭函式，理解方法查找與呼叫方式的關係。"
slug: typescript/prototype-class-and-this
series: typescript
order: 4
tags:
  - typescript
  - javascript
  - prototype
  - class
  - this
pubDate: 2026-09-17
lastModDate: ''
draft: false
ogImage: true
toc: true
share: false
giscus: true
search: true
---

上一篇從作用域與閉包看到，函式可以讀取並保留外部狀態。當 TypeTrail 開始有多道題目時，還需要把每道題目的資料和操作整理在一起：題目文字各自不同，顯示題目的方式卻可以共用。

如果每次都重新建立相同結構，程式很快就會出現重複。`class` 是整理這類物件的一種方式，Angular 的元件與服務也會使用它。

不過，把資料和方法放進 class 之後，還有兩件事需要弄清楚：JavaScript 從哪裡找到方法，以及方法裡的 `this` 指向誰。這篇會從建立 `Question` 物件開始，再看方法變成回呼函式時，為什麼可能失去原本的 `this`。

## Class 把資料與操作放在一起

Class 可以描述同一類物件建立時要保存哪些資料，以及能執行哪些操作。先定義 `Question` class，再透過 `new` 建立個別題目。由 class 建立的物件稱為實體（instance）。

```js
class Question {
  constructor(prompt) {
    this.prompt = prompt;
  }

  showPrompt() {
    console.log(this.prompt);
  }
}

const firstQuestion = new Question("Prototype 是什麼？");
const secondQuestion = new Question("this 是在哪個時機決定的？");

firstQuestion.showPrompt(); // Prototype 是什麼？
secondQuestion.showPrompt(); // this 是在哪個時機決定的？
```

執行 `new Question(...)` 時，JavaScript 會先建立一個新物件，讓 `this` 指向它，再執行 `constructor`。這個範例的 `constructor` 收到題目文字後，透過 `this.prompt = prompt` 將文字存進實體。

`firstQuestion` 與 `secondQuestion` 是兩個不同的實體，各自保存自己的題目文字。

> [!TIP] 屬性與方法 / Property and method
> 屬性用來保存物件的資料，例如 `prompt`；方法則是物件可以執行的函式，例如 `showPrompt()`。

這裡先把 `this.prompt` 理解成「這次呼叫所使用物件的 `prompt`」。判斷 `this` 實際指向誰時，還要一起看函式的呼叫方式。

## 物件找不到屬性時，會沿著原型鏈往上找

每個實體都有自己的 `prompt`，但一般 class 方法不會複製到每個實體裡。可以使用 `Object.hasOwn` 檢查屬性是否直接存在於物件本身：

```js
console.log(Object.hasOwn(firstQuestion, "prompt"));
// true
console.log(Object.hasOwn(firstQuestion, "showPrompt"));
// false
```

雖然 `firstQuestion` 本身沒有 `showPrompt`，卻仍然可以呼叫它，原因就在 prototype。寫在 class 裡的一般方法會放在 `Question.prototype`：

```js
console.log(Object.getPrototypeOf(firstQuestion) === Question.prototype);
// true
console.log(firstQuestion.showPrompt === Question.prototype.showPrompt);
// true
```

> [!TIP] 原型 / Prototype
> Prototype 是物件在自身找不到屬性時，會繼續查找的另一個物件，例如 `firstQuestion` 會接著查找 `Question.prototype`。

讀取 `firstQuestion.showPrompt` 時，JavaScript 會依序查找 `firstQuestion`、`Question.prototype` 與 `Object.prototype`，直到找到 `showPrompt` 或抵達 `null`。這條路徑稱為原型鏈（prototype chain）。

因此，各個實體能保存自己的 `prompt`，並共用 `Question.prototype` 上的 `showPrompt`。Class 只是把建立實體與定義共用方法的語法集中起來。

> [!NOTE]
> 修改 `Object.prototype` 等內建原型會影響其他物件的屬性查找，除非有非常明確的理由，否則應避免這樣做。

![Class 實體如何沿原型鏈找到方法](../../../assets/blog/typescript/day-04-question-prototype-chain.png)

## 一般函式的 `this` 由呼叫方式決定

原型鏈只負責決定「去哪裡找到 `showTitle`」；找到函式之後，`this` 指向誰仍由呼叫方式決定。先看同一個函式被兩個物件使用時的結果：

```js
const quiz = {
  title: "Day 4",
  showTitle() {
    console.log(this.title);
  },
};

const review = {
  title: "複習題",
  showTitle: quiz.showTitle,
};

quiz.showTitle();   // Day 4
review.showTitle(); // 複習題
```

兩個物件共用了同一個 `showTitle` 函式；實際呼叫時，點號左邊的物件會成為 `this`。因此，`quiz.showTitle()` 的 `this` 是 `quiz`，`review.showTitle()` 的 `this` 則是 `review`。

## 方法變成回呼函式時，接收者可能遺失

把方法交給其他函式時，原本點號左邊的物件可能消失。回到開頭的 `firstQuestion`：

```js
function runAction(action) { action(); }

runAction(firstQuestion.showPrompt);
// TypeError：this 是 undefined
```

`runAction` 最後以 `action()` 呼叫收到的函式，前面沒有 `firstQuestion.`，因此沒有提供接收者，也就不會以 `firstQuestion` 作為 `this`。

> [!NOTE]
> Class 會自動使用嚴格模式；方法失去接收者時，`this` 是 `undefined`，因此讀取 `this.prompt` 會發生 TypeError。

可以使用 `bind` 建立固定 `this` 的新函式：

```js
const boundShowPrompt = firstQuestion.showPrompt.bind(firstQuestion);

runAction(boundShowPrompt); // Prototype 是什麼？
```

`bind` 不會立即執行原方法，而是回傳一個新函式。呼叫新函式時，`this` 會固定為指定的 `firstQuestion`。

## 箭頭函式沒有自己的 `this`

另一種做法，是把方法寫成 class 欄位中的箭頭函式（arrow function）。箭頭函式不會建立自己的 `this`，而是沿用定義位置的 `this`：

```js
class ArrowQuestion {
  constructor(prompt) {
    this.prompt = prompt;
  }

  showPrompt = () => {
    console.log(this.prompt);
  };
}

const arrowQuestion = new ArrowQuestion("箭頭函式會保留 this 嗎？");
const arrowCallback = arrowQuestion.showPrompt;
arrowCallback(); // 箭頭函式會保留 this 嗎？
```

箭頭函式欄位會建立在每個實體上，並沿用建立時的 `this`。因此，即使取出後單獨呼叫，仍能讀取原實體的 `prompt`。

一般 class 方法由 prototype 共用；箭頭函式欄位則每個實體各有一份。方法經常需要作為回呼函式時，再考慮使用 `bind` 或箭頭函式欄位。

## TypeTrail 中適合使用 Class 的地方

TypeTrail 每場測驗可以建立 `QuizSession`，讓實體保存分數並透過 prototype 共用方法。複習場次再建立另一個實體，兩者維持相同結構。

## 延伸到 Angular：這個概念在框架中如何出現？

Angular 的元件（Component）與服務（Service）都以 TypeScript class 為基礎。元件保存畫面狀態與操作，服務則集中可重用的資料或規則。

```ts
export class ScoreComponent {
  score = 0;
  addPoint() { this.score += 1; }
}

export class ScoreService {
  passingScore = 3;
  isPassing(score: number) { return score >= this.passingScore; }
}
```

`ScoreComponent` 用欄位保存分數，`ScoreService` 集中及格分數與判斷規則，供不同元件使用。

## 今日練習

[day4 | 型旅 TypeTrail](https://typetrail.johnsonchen.dev/#/day/4)

## 結論

- 物件本身找不到屬性時，JavaScript 會沿著原型鏈繼續尋找。
- Class 的一般方法放在 prototype 上，由各實體共用。
- 一般函式的 `this` 由呼叫方式決定。方法變成回呼函式時，可以使用 `bind` 或箭頭函式欄位保留 `this`。

方法能作為回呼函式傳遞之後，接下來就能進一步理解 Promise 與計時器如何安排非同步工作的執行順序。
