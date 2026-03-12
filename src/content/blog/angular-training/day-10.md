---
title: Day 10 - 控制流程 if
description: "介紹 Angular 模板中的條件渲染，包含 @if、@else 與舊版 *ngIf 的使用方式。"
pubDate: 2025-09-10
lastModDate: ''
ogImage: true
toc: true
share: false
giscus: true
search: true
---
今天開始要介紹在模板中，如何使用條件語句來控制顯示的內容。
目前主要有兩種寫法：
1. 使用 `@if` 和 `@else`  ( Angular 17+ )
2. 使用舊版的 `*ngIf` 搭配 `<ng-template>` 

## @if 、@else if 和 @else
寫法更接近 JavaScript 的語法，使用起來更直觀。

**@if**、 **@else if**
- `@if` 裝飾器用於條件渲染。
- 它可以用來根據條件顯示或隱藏某些元素。


**@else**
- `@else` 裝飾器用於在條件不成立時顯示其他內容。
```html
@if (status === 'success') {
  <p>成功</p>
} @else if (status === 'loading') {
  <p>載入中</p>
} @else {
  <p>失敗</p>
}
```
## ngIf
舊版 `*ngIf` 需搭配 `<ng-template>`或`ng-container` 使用。
- `*ngIf` 是 Angular 的一個結構性指令，用於根據條件顯示或隱藏元素。
- else 需要使用 `#` 來定義模板參考變數，並搭配 `ng-template` 使用。
  
> `<ng-template>`、`ng-container`、模板參考變數之後會再詳細介紹，這邊先了解語法即可。

```html
<p *ngIf="isLogin; else notLogin">歡迎回來！</p>
<ng-template #notLogin>
  <p>請先登入。</p>
</ng-template>
```
- 沒有內建的 else if。必須用多個 `*ngIf` + `<ng-template>`或 `ngSwitch` 來模擬多分支條件
```html
<div *ngIf="userRole === 'admin'; else checkUser">
  <p>管理員介面</p>
</div>

<ng-template #checkUser>
  <div *ngIf="userRole === 'user'; else guestTemplate">
    <p>一般使用者介面</p>
  </div>
</ng-template>

<ng-template #guestTemplate>
  <p>訪客介面</p>
</ng-template>
```

必須要注意的是，必須引入 `CommonModule`才能使用 `*ngIf` 指令
```ts
// 子模組
...
import { CommonModule } from '@angular/common';

@NgModule({
  ...
  imports: [CommonModule], // <-- 必要：提供 *ngIf、*ngFor 等
  ...
})
```
獨立元件可只引入 NgIf 
```ts
// 獨立元件
import { CommonModule } from '@angular/common';
import { NgIf } from '@angular/common';

@Component({
  ...
  // imports: [CommonModule], // <-- 讓模板可使用 *ngIf、*ngFor
  imports: [NgIf], // <-- 只需 *ngIf 時可直接引入 NgIf
	...
})
```

> `*` 前綴代表這是一個結構型指令 (Structural Directive) 的語法糖，會動態新增或移除 DOM 元素，在 Angular 22 後，ngIf 會正式棄用，僅建議在舊專案中使用。

## 專案製作
今日目標：透過 if 處理 "未建立任何待辦事項" 的情況。
- 建立 todoList 陣列
- 透過陣列數量判斷是否處於未建立任何待辦事項的情況

[day 10  分享](https://github.com/johnsonchen3669/angular-demo-todo/commit/23d5ccd3c22564f54d607021cbe0ffb1ebfe0f52)
[day 10 分享 (舊版)](https://github.com/johnsonchen3669/angular-demo-todo/commit/4941f2cad6f6608e98bdae29268e0d57f9654a72)

## 結論
今天介紹了兩種在 Angular 模板中使用條件語句的方法：`@if`/`@else` 和 `*ngIf` 搭配 `<ng-template>`。前者語法更直觀，後者則是舊版的寫法已經不建議在新專案中使用。明天將介紹另一種條件語句 switch。
