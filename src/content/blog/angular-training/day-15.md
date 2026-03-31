---
title: Day 15 - 雙向綁定
description: "介紹 Angular 的雙向綁定語法，涵蓋 ngModel、自訂元件與 model 的實作方式。"
slug: two-way-binding
series: angular-training
order: 15
tags:
  - angular
  - angular-training
  - two-way-binding
  - ngmodel
pubDate: 2025-09-15
lastModDate: ''
ogImage: true
toc: true
share: false
giscus: true
search: true
---
今天要介紹 Angular 的雙向綁定如何實現
在實務情況下，經常會想要取得使用者輸入的值，並且在畫面上顯示這些值。這時候雙向綁定就派上用場了。

雙向綁定的語法 `[()]`  ，結合了屬性綁定的語法 `[]` 和事件綁定的語法 `()`。它同時將一個值綁定到一個元素上，同時也使該元素能夠透過這個綁定同步傳回修改。

## 表單雙向綁定
單純的表單雙向綁定通常會用 Angular 提供的 `ngModel` 指令，來達成這一點。綁定後，當輸入框的值改變時，變數也會同步更新。

> 詳細內容會在表單章節詳細介紹，目前先了解基本用法。

- 需要引入 `FormsModule` 模組，才能使用 `ngModel` 指令。
```ts
import { FormsModule } from '@angular/forms';

@Component({
  ...
  imports: [FormsModule],
  ...
})
```
```html
<input type="text" [(ngModel)]="title" />
```
## 自訂元件雙向綁定

如果要自訂元件的雙向綁定，可以用 `@Input` 和 `@Output`，來達成這點。
實現方式：
1. 用 `@Input` 接收外部值。
2. 用 `@Output` 發射事件通知父元件值已變更。
3. 父元件可用`[(property)]="myValue"` 語法來雙向綁定。

> 雙向綁定語法 `[(property)]` 其實是 `[property]` + `(propertyChange)` 的糖衣語法，必須符合這個命名規則，才能使用雙向綁定語法。

[範例](https://stackblitz.com/edit/stackblitz-starters-sor3gb2w?file=src%2Fmain.ts)
```ts
@Input() counter!: number;
@Output() counterChange = new EventEmitter<number>();

onClick() {
    this.counter++;
    this.counterChange.emit(this.counter);
}
```
```html
<app-counter [(counter)]="count"></app-counter>
```

Angular 17 後也提供新的 model 雙向綁定語法
- 取代 `@Input` 和 `@Output` 的寫法，可直接使用 `model` 達成雙向綁定，更加簡潔。
-  [範例](https://stackblitz.com/edit/stackblitz-starters-mzushjvb?file=src%2Fapp%2Fcounter%2Fcounter.ts)
```ts
count = model.required<string>();
```
```html
<app-counter [(count)]="myCount"></app-counter>
```

## 專題製作
今日目標：表單雙向綁定，輸入待辦事項名稱。
- add-todo.component.ts 使用 `ngModel` 雙向綁定輸入值。
[day 15 分享](https://github.com/johnsonchen3669/angular-demo-todo/commit/4717b31b3042243a35f6da4ee65663476e3c7fc3)
## 結論
今天介紹了在 Angular 中實現雙向綁定的兩種方法：使用 `ngModel` 進行表單雙向綁定，以及自訂元件的雙向綁定。明天會介紹之前沒有提到一些在模板中的用法。
