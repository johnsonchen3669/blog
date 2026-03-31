---
title: 控制流程 for | Angular 新手練功日誌
description: "說明 Angular 模板中 @for 與 *ngFor 的清單渲染、track 與特殊變數用法。"
slug: control-flow-for
series: angular-training
order: 12
tags:
  - angular
  - angular-training
  - control-flow
  - for
  - ngfor
pubDate: 2025-09-12
lastModDate: ''
ogImage: true
toc: true
share: false
giscus: true
search: true
---
今天介紹使用迴圈語句來顯示列表內容，可以快速生成多個相似的元素。
目前有兩種語法：
- `@for` ( Angular 17+ ) 
- 舊版的 `*ngFor` 
## @for
`@for` 裝飾器用於在模板中迭代顯示列表，它可以用來簡化列表渲染的程式碼
- track ：用於追蹤列表中的項目的唯一性，避免不必要的 DOM 更新。 在 `track` 後面可以接一個唯一的屬性名稱（通常是 id），來標示每個項目的唯一性。
> 除了從不更改的靜態陣列可以使用 $index 作為追蹤外，其他情況都建議使用唯一 id 屬性來追蹤。

 `@empty`：可搭配 `@for` 使用，用於在列表為空時顯示特定內容。

還有其他特殊變數，可以取得列表的相關資料，例如：
- `$index`：用於獲取當前項目的索引。
- `$first`、`$last`、`$even`、`$odd` 可用於在模板中顯示特定樣式或內容，例如：偶數行不同背景色、第一個或最後一個項目加上特殊標記等。
	- `$first` ：用於判斷當前項目是否為列表中的第一個項目。
	- `$last` ：用於判斷當前項目是否為列表中的最後一個項目。
	- `$even` ：用於判斷當前項目的索引是否為偶數。
	- `$odd` ：用於判斷當前項目的索引是否為奇數。
- `$count` ：用於獲取列表中的項目總數。
```html
<!-- 項目可自訂變數名稱，of 後面接要迭代的陣列 -->
@for (user of users; track user.id) {
	<li>
		<app-user [user]="user" (select)="onSelectUser($event)" />
	</li>
}
```

特殊變數使用時，會用 let 宣告變數去接取對應值，接取後就可以在模板中使用。
```html
<ul>
  @for (user of users; track user.id; let index = $index; let first = $first; let last = $last; let count = $count) {
    <li [class.first]="first" [class.last]="last">
      {{ user.name }} (第 {{ count - $index }} 位)
      @if (first) { <span>[第一個]</span> }
      @if (last) { <span>[最後一個]</span> }
    </li>
  }
  @empty {
    <li>目前沒有使用者資料。</li>
  }
</ul>
```
### 特殊應用
通常渲染列表時，想要維持列表標籤的可讀性，會使用 `<li>` 來包裹每個列表項目，而又不想要多在元件外層多包一層 `<li>` 時，可以在列表元件使用屬性來定義 `selector`，這樣可以減少不必要的 DOM 標籤。
```ts
@Component({
	selector: '[appItem]', // 使用屬性選擇器
  ...
})
```
```html
<ul>
	@for (item of items; track item.id; let i = $index)
		<li appItem>
			{{i+1}}. {{item}}>
		</li>
	}
</ul>
```
## ngFor
使用 `*ngFor` 來迭代顯示陣列，語法和 `@for` 類似，但沒有 `@empty`，需要搭配 `*ngIf` 來判斷陣列是否為空。
```html
<ul *ngIf="tasks.length > 0; else noTasks">
  <li *ngFor="let task of tasks; index as i; trackBy: trackById" appTodoItem>
    {{ i + 1 }}. {{ task.title }}
  </li>
</ul>
<ng-template #noTasks>
  <div>沒有任務</div>
</ng-template>
```

和新版相比舊版需要需要額外寫一個函式（如 `trackByFn`）來追蹤每個項目的唯一性。
```ts
trackByFn(index: number, item: TodoItem) {
  return item.id; // 用唯一 id 追蹤
}
```
```html
<li *ngFor="let item of items; index as i; trackBy: trackByFn">...</li>
```

也有許多特殊變數可供使用。
```html
<li *ngFor="let user of users; index as i; first as isFirst; last as isLast; even as isEven; odd as isOdd; count as total">
	{{i+1}}/{{total}}. {{user}} 
	<span *ngIf="isFirst">[第一個]</span>
	<span *ngIf="isLast">[最後一個]</span>
	<span *ngIf="isEven">[偶數]</span>
	<span *ngIf="isOdd">[奇數]</span>
</li>
```

和`*ngIf`一樣，`NgFor` 指令也需要引入 `CommonModule`。
```ts
// 子模組
...
import { CommonModule } from '@angular/common';

@NgModule({
  ...
  imports: [CommonModule],
  ...
})
```
獨立元件可只引入 `NgFor`
```ts
// 獨立元件
import { CommonModule } from '@angular/common';
import { NgFor } from '@angular/common';

@Component({
  ...
  // imports: [CommonModule], 
  imports: [NgFor],
	...
})
```

> 在 Angular 22 後，ngFor 會正式棄用，僅建議在舊專案中使用。

## 專案製作
今日目標：練習使用迴圈語句來顯示列表內容
- 在 app.ts 定義假資料，讓待辦清單不是空的狀態
- 在 todo-list.component.ts 定義假資料。
- 在 todo-list.component.html 使用 `@for` 或 `*ngFor` 來顯示列表內容。

[day 12 分享](https://github.com/johnsonchen3669/angular-demo-todo/commit/b60de886bffed60ac997fc50912f4784cd12aa78)
## 結論
今天介紹了兩種在 Angular 中使用迴圈語句來顯示列表內容的方式：`@for` 和 `*ngFor`。明天要介紹如何透過 input 將列表項目的資料動態傳入元件中。
