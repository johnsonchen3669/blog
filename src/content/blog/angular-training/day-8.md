---
title: 事件監聽 | Angular 新手練功日誌
description: "介紹 Angular 事件監聽的綁定方式，包含按鍵修飾符、$event 物件與防止預設行為。"
slug: event-listeners
series: angular-training
order: 8
tags:
  - angular
  - angular-training
  - event-binding
  - template-syntax
pubDate: 2025-09-08
lastModDate: ''
ogImage: true
toc: true
share: false
giscus: true
search: true
---
今天要來介紹事件監聽，讓使用者可以與應用程式互動。

在 Angular 要與應用程式互動，會使用 `()` 來綁定事件監聽器，並指定事件觸發時要執行的方法。
```html
<button type="button" (click)="onClick()">
	點擊按鈕
</button>
```
 
**按鍵修飾符 key modifiers**  
 監聽鍵盤觸發的事件，還可以繼續取得鍵盤特定鍵，例如：`(keydown.enter)` 代表當按下 Enter 鍵時觸發事件。
 
```html
<input type="text" (keyup.enter)="onEnter($event)" />
```
也可以偵測**特定鍵組合**
```html
<!-- 同時按下 Shift 鍵和 Enter 鍵並放開時，才會觸發 -->
<input (keyup.shift.enter)="onShiftEnter()" />
```

**$event**
在 Angular 模板中，當事件被觸發時，會傳遞一個 `$event` 物件給事件處理器。

`$event` 是 Angular 模板語法中的特殊變數，常使用的用法如下：
- 代表事件物件本身，透過這個物件，可以取得事件相關的資訊。
- 代表自訂事件傳遞的資料內容，後續文章中會介紹相關用法。
```ts
export class App {
  onItemClick(event: MouseEvent) {
	  console.log('元件被點擊', event);
	}
}
```
```html
<button (click)="onItemClick($event)">點我</button>
```

## 防止事件預設行為
在某些情況下，可能需要防止事件的預設行為，例如點擊連結時不跳轉頁面，可以使用`$event.preventDefault()` 來達成。
```html
<a href="javascript:;" (click)="onLinkClick($event)">
	點擊連結
</a>
```
```ts
export class App {
	onLinkClick(event: MouseEvent) {
	  event.preventDefault();
	  console.log('連結被點擊，但不跳轉');
	}
}
```

## 專案製作
今日目標：練習繫結用法，將 header 的 icon ，改成 img 標籤。
- 建立 logo.svg
- 定義路徑
- 使用繫結綁定圖片路徑

[day 8 分享](https://github.com/johnsonchen3669/angular-demo-todo/commit/6ab80dfe199fc77b044027a512f817e8dc0ceb70)
## 結論
今天介紹了 Angular 的事件監聽，現在已經知道如何讓使用者可以與應用程式互動。接下來，下一篇將認識 Angular 的近年來的關鍵更新 Signal，了解它如何改變開發 Angular 應用的方式。
