---
title: Day 6 - 元件資料定義
description: "介紹 Angular 元件中的變數定義方式、型別系統（Interface、Type、Class），以及字串插值的使用。"
slug: component-data-definition
series: angular-training
order: 6
tags:
  - angular
  - angular-training
  - components
  - typescript
  - string-interpolation
pubDate: 2025-09-06
lastModDate: ''
ogImage: true
toc: true
share: false
giscus: true
search: true
---
目前元件部分，我們只學習到顯示靜態的資料，接下來我們會學習如何在元件中處理資料，並且顯示在畫面上。
## Angular 變數儲存方式
目前 Angular 支援兩種主要的變數儲存方式：
- 傳統 TypeScript 變數
- Angular Signals (Angular 16+)

在剛開始時，我們先從傳統 TypeScript 變數開始，等到對基礎有一定的了解後，再來學習 Signals。
### 傳統 TypeScript 變數

在 Angular 元件中，可以使用 JavaScript 類別的相關語法來定義變數，並且可以使用 TypeScript 的型別系統來定義變數的資料結構。

```ts
export class MyComponent {
  // 基本變數
  // 過於簡單的型別，其實可以省略不寫，交由 TypeScript 自動推斷，會比較適合。
  title: string = 'Todo App';
  count: number = 0;
  isVisible: boolean = true;
  
  // 陣列和物件
  items: string[] = [];
  user: { name: string; email: string } = { name: '', email: '' };
  tasks: Array<{ id: number; title: string; completed: boolean }> = [];
}
```

可以將型別額外抽離成介面 (Interface)、或型別 (Type Alias)，來定義更複雜的資料結構。

至於檔案檔案擺放的位置，則看團隊的習慣，以下是常見的做法：
- 若是專案共用的型別，共用資料夾下，例如：
	- `src/app/models/user.model.ts`、`src/app/types/task.type.ts`
- 若只在單一元件或模組中使用，也可以直接放在該元件或模組的檔案旁邊。
	- `src/app/todo/todo.model.ts`

```ts
interface IUser {
	name: string;
	email: string;
	age?: number; // 可選屬性
}
type TTask = {
	id: number;
	title: string;
	completed: boolean;
};
```

```ts
user: IUser = { name: '', email: '' };
tasks: TTask[] = [];
```

- 若還需要更複雜的結構，可以考慮使用類別 (Class) 來定義，不過大部分情況下，介面和型別就足夠使用了。
```ts
export class CTask {
  constructor(
    public id: number,
    public title: string,
    public completed = false,
  ) {}

  toggle() {
    this.completed = !this.completed;
  }
}
```

```ts
tasks: CTask[] = [new Task(1, 'Learn Angular')]
```

## 字串插值 (String Interpolation)
字串插值是 Angular 中最常用的資料綁定方式之一，可以將元件中的資料顯示在 HTML 模板中。字串插值使用雙大括號 `{{ }}` 包裹要顯示的資料。

```ts
export class MyComponent {
	title: string = 'Todo App';
}
```

```html
{{ title }}
```

## 專案實作
今日目標，建立專案樣式。
- 以 [tailwindcss](https://tailwindcss.com/docs/installation/framework-guides/angular) 建立專案樣式 ( 也可以自由發揮)
- 已提供模板 `template.html`，可先嘗試依照模板著手建立 Todo List 的元件結構
	- header
	- add-todo
	- todo-list
	- todo-list/todo-item

[day 6 分享](https://github.com/johnsonchen3669/angular-demo-todo/commit/82e901860858c500e4ae41b25c7aaffb11c32c8e#diff-4753b2e6427841425517139f09f1342c320338443447af46169dc0f43a0f2cf3)
## 結論
目前我們學習了定義資料，以及了解如何在模板中顯示資料，接下來我們會學習如何將資料跟動態資料繫結。
