---
title: Day 8 - 事件監聽
description: "從 Zone.js 與 Zoneless 出發，介紹 Angular Signals 的基本概念、更新方式與衍生狀態。"
pubDate: 2025-09-08
lastModDate: ''
ogImage: true
toc: true
share: false
giscus: true
search: true
---
 在談到 Angular 中的變數新儲存方式 signal 前，需要介紹一下 Angular 背後的偵測機制。
 目前有兩種主要的變更偵測機制，當資料改變時，會觸發畫面更新：
- Zone.js
- Zoneless 
## 了解 Angular 中的偵測機制
### Zone.js
Zone.js 是 Angular 用來追蹤所有可能改變資料的操作，會在以下各類操作完成後自動觸發變更偵測。
- 計時器（如 setTimeout、setInterval）
- HTTP 請求（如 AJAX、fetch、HttpClient）
- 事件監聽（如 click、keyup 等事件）
- Promise、async/await

但因為每次操作完成後都會觸發變更偵測，可能會導致不必要的重新渲染，並需要依賴額外的 Zone.js，在打包上也會增加一些體積。

所以在 Angular 16 版本後，提供了另一種選擇 Zoneless 的方式來進行變更偵測。而隨著 Angular 轉向 Zoneless 應用程式開發模式，Zone.js 目前也不再接受新功能的開發，僅維持基本的錯誤修正和安全更新。

### Zoneless
Zoneless 是指 Angular 支援「不依賴 Zone.js」的運作模式，是基於 signal 為主的變更偵測機制。Angular 不會自動追蹤所有操作，只有當 signal 定義的值改變時，才會觸發畫面更新，減少了不必要的檢查，提升了效能。

## Signals (Angular 16+)

Signals 是 Angular 新推出的響應式狀態管理方式，在定義時需要使用 `signal` 函數來創建一個信號，並設定初始值。
- Signals 設定了追蹤機制，可以在其值改變時自動通知相關的元件。
```ts
import { signal } from '@angular/core';

export class MyComponent {
  // 基本 signal 定義
  title = signal('Todo App');
  count = signal(0);
  items = signal<string[]>([]);
}
```

### 更新方法
Signals 提供了兩種主要的更新方法： `set` 和 `update`。
- `set`：純寫入新的值時，使用這方法。
	- 接受一個新的值作為參數，並將其設置為信號的當前值。
- `update`：若新的值是基於當前值進行更新，則使用這方法。
	- 接受一個函數作為參數，該函數接收當前值並返回新的值。
```ts
export class MyComponent {
 ... 
  updateTitle(newTitle: string) {
		this.title.set(newTitle); // 使用 set 方法更新 title
	}
  // 更新 signal
  addItem(item: string) {
    this.items.update(current => [...current, item]);
  }
  increment() {
    this.count.update(current => current + 1);
  }
}
```
### 顯示
Signal 是「可呼叫的函式」，有別於傳統的變數直接使用變數名稱在模板中顯示，要顯示信號的值時，必須透過呼叫來取值，呼叫時會執行內部的 getter 並回傳 。

```html
<div>
	<h1>{{ title() }}</h1> <!-- 使用 () 來取值 -->
	<p>Count: {{ count() }}</p>
	<p>Items: {{ items().join(', ') }}</p>
	<p>Item Count: {{ itemCount() }}</p> <!-- computed signal -->
</div>
```

### 唯讀
Signal 除了可以寫入外，也可以設定為唯讀 。
透過 `asReadonly()` 方法來創建唯讀版本，這樣可以防止外部修改，只能通過內部的方法來更新。

```ts
private _title: WritableSignal<string> = signal('Todo App');
readonly title: Signal<string> = this._title.asReadonly();
```

> 只用 readonly 屬性修飾，只防止重新指派屬性本身，無法移除物件上的寫入方法，仍然會有 `set()` / `update()`等方法可以被呼叫。
### 衍生狀態
可以使用 `computed` 函數來創建基於其他信號的衍生值。
- 同時也是 signals 的一種，同樣透過呼叫 `()` 來取信號的值。
- 當依賴的信號改變時，computed signals 便會自動更新。

過去要達成類似的功能，通常會使用 getter 來實現。但每次訪問值時都會執行計算，即使目標沒有改變，若計算邏輯複雜，可能會導致效能問題。
```ts
get itemCount() {
    return this.items.length;
}
```
目前則可以使用 `computed` 來創建一個新的信號，該信號的值是基於其他信號計算得出的，只有當依賴的信號改變時，才會重新計算。
```ts
itemCount = computed(() => this.items().length);
```

>衍生狀態只能讀取，無法透過 `set` 或 `update` 來修改。

## 專案製作
今日目標：練習 Signals 的用法。
- 將 header 元件的 logo 路徑改為 signal 方式來實作。
  
[day 9 分享](https://github.com/johnsonchen3669/angular-demo-todo/commit/d835cf5b0d82a2794dda452a3114979edad62a16)
## 結論
今天介紹了 Signals 在 Angular 中的基本使用方式。明天介紹如何使用條件語句 if 來控制顯示的內容。
