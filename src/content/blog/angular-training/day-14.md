---
title: Day 14 - Output
description: "說明子元件如何透過 output 函式與 @Output 將事件通知父元件。"
pubDate: 2025-09-14
lastModDate: ''
ogImage: true
toc: true
share: false
giscus: true
search: true
---
今天要介紹在 Angular 中，如何使用 `output` 函式以及 `@Output` 裝飾器來實現元件之間的事件傳遞。

在巢狀元件使用情況下，通常會使用提升的方式，將資料拉到父元件中統一管理，而子物件想要通知父元件某些事件發生的話，就會用到 Output，來將事件從子元件傳遞到父元件，例如：點擊子元件的按鈕後，在父元件觸發新增待辦事項的事件。

目前有兩種語法來實現元件之間的事件傳遞：
- `output` 函式 ( Angular 17+ )
- `@Output` 裝飾器，
## output
`output`用於定義在元件輸出事件。
- `output<type>` 用於定義輸出事件的類型， 
- 定義後會創建 `OutputEmitterRef`，可使用其中的 `emit` 方法向指令的使用者發出值。
```ts
@Component({
  selector: 'app-child',
  template: `<button (click)="handleClick()">點擊按鈕</button>`
})
export class ChildComponent {
  clicked = output<string>();

  handleClick() {
    this.clicked.emit('按鈕被點擊了！');
  }
}
```
在父元件中會使用子元件定義的事件，來觸發對應的事件處理函式。
- 使用 `$event` 來接收從子元件傳遞過來的資料。
```ts
@Component({
	selector: 'app-parent',
	template: `<app-child (clicked)="onChildClicked($event)"></app-child>` // clicked 是子元件定義的事件
})
export class ParentComponent {
	onChildClicked(message: string) {
	  console.log('從子元件接收到的訊息：', message);
	}
}
```

## @Output
使用 `@Output` 裝飾器，來定義輸出事件。
- 搭配 `EventEmitter` 類別來創建事件發射器。
- 使用 `emit` 方法來發出事件。
```ts
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-child',
  template: `<button (click)="handleClick()">點擊按鈕</button>`
})
export class ChildComponent {
  @Output() clicked = new EventEmitter<string>();

  handleClick() {
    this.clicked.emit('按鈕被點擊了！');
	}
}
```

在父元件中使用子元件定義的事件，和 `output` 的用法相同。
- 使用 `$event` 來接收從子元件傳遞過來的資料。
```ts
@Component({
	selector: 'app-parent',
	template: `<app-child (clicked)="onChildClicked($event)"></app-child>`
})
export class ParentComponent {
	onChildClicked(message: string) {
	  console.log('從子元件接收到的訊息：', message);
	}
}
```
## 專案製作
今日目標：點擊按鈕可以新增待辦事項。
- add-todo.component.ts 使用 `output` 函式來傳遞事件
- 待辦清單陣列使用 `input` 傳遞給 todo-list.component.ts 顯示畫面
[day 14 分享](https://github.com/johnsonchen3669/angular-demo-todo/commit/56f137b49809f67c50556d20bbcf21e7a5de68ac)
## 結論
今天介紹了兩種在 Angular 中實現元件之間事件傳遞的方法：`output` 函式和 `@Output` 裝飾器。明天介紹如何在 Angular 中實現雙向綁定。
