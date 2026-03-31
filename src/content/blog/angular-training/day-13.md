---
title: Input | Angular 新手練功日誌
description: "介紹父元件如何透過 input 函式與 @Input 將資料傳遞給子元件。"
slug: inputs
series: angular-training
order: 13
tags:
  - angular
  - angular-training
  - input
  - component-communication
pubDate: 2025-09-13
lastModDate: ''
ogImage: true
toc: true
share: false
giscus: true
search: true
---
今天要介紹在 Angular 中，如何使用 `input` 函式以及 `@Input` 裝飾器來傳入父元件的資料。

在開發過程中，經常會出現巢狀元件的情況，例如：待辦清單中會有多個待辦事項，每個待辦事項會是一個獨立的元件。在這種情況下，可使用提升的方式，將資料拉到父元件中統一管理，再傳給子元件進行顯示。

而這種情況下，就會用到 Input 來將資料從父元件傳給子元件。
目前有兩種語法：
- `input` 函式 ( Angular 17+ )
- `@Input` 裝飾器，

## input
`input` 基於 signal 的寫法，用於定義在元件的輸入屬性，只能被讀取，無法再在元件內部修改。
- 就如同元件的屬性，可以在模板中使用，要注意的是 `input` 是 signal，因此在模板中使用時，需要加上括號 `()` 來取得值。
- `input<type>` 用於定義輸入屬性的類型。
- `input.required` 用於指定該輸入屬性為必填，不需填寫初始值。
```ts
export class TodoItemComponent {
	task = input.required<ITodoItem>(); 
}
```
```html
<div>{{ task().title }}</div>
```

在父元件中使用時，需使用屬性繫結的方式傳入資料。
```html
<ul class="flex flex-col gap-3">
  @for (task of tasks; track task.id) {
    <app-todo-item [task]="task"></app-todo-item>
  }
</ul>
```

如果只是傳單純字串或數字，也可以不使用屬性繫結傳入資料
```html
<app-title title="任務A"></app-title>
```

### 相關設定
可以在 `input` 中加入 `transform` 參數，來對傳入的資料進行轉換。

> 除可自訂轉換函式外，Angular 也提供兩個內建轉換函數 `booleanAttribute`, `numberAttribute`，用於兩個最常見的場景：將值強制轉換為布林值和數字。

```ts
export class TitleComponent {
	title = input('', { transform: appendTaskTitle }); 
function appendTaskTitle(value: string) {
  return '任務：' + value;
}
```

可以添加輸入別名，在父元件傳入時，可以使用不同的名稱。
```ts
export class CustomComponent {
  title = input('', {alias: 'cusTitle'});
}
```
```html
<app-custom [cusTitle]="pageTitle"></app-custom>
```

## @Input
需要在屬性前方加上`@Input` 裝飾器，來標示該屬性是用於接收父組件傳遞過來的資料。
- 可加入 `required: true` 來強制要求父組件提供該屬性
- 可搭配 TypeScript 的 `!:` 非空斷言操作符，或 `?:` 可選屬性，來避免編譯器報錯。

```ts
export class TodoItemComponent {
	@Input({ required: true }) task !: ITodoItem;
}
```

```html
<ul>
  <li *ngFor="let task of tempArr">
    <app-todo-item [task]="task"></app-todo-item>
  </li>
</ul>
```

### 相關設定
也提供相關設定，與 `input` 類似。
```ts
export class TitleComponent {
  @Input({ alias: 'customTitle', transform: appendTitle }) title!: string;
}

function appendTitle(value: string) {
  return '任務：' + value;
}
```

## 專案製作
今日目標：將待辦事項的資料從父元件傳給子元件，並在子元件中顯示待辦事項的標題。
[day 13 分享](https://github.com/johnsonchen3669/angular-demo-todo/commit/c9493678a20cca1be2acf370b7b8863acf436c10)
## 結論
今天介紹了在 Angular 中，如何使用 `input` 函式以及 `@Input` 裝飾器來傳入父元件的資料。明天介紹如何從子元件傳出事件給父元件。

