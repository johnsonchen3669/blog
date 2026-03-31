---
title: 模板相關用法一 | Angular 新手練功日誌
description: "整理模板參考變數、ng-template 與 viewChild、viewChildren 的常見用法。"
slug: template-patterns-part-1
series: angular-training
order: 16
tags:
  - angular
  - angular-training
  - template-reference
  - viewchild
pubDate: 2025-09-16
lastModDate: ''
ogImage: true
toc: true
share: false
giscus: true
search: true
---
今天會介紹一些在模板中的常見的用法，包含：
模板參考變數、ng-template
## 模板參考變數
在 Angular 中，元素上加上 `#name` 是用來宣告**模板參考變數（template reference variable）**

可以在同一個模板中，取得該元素的參考。
```html
<input #myInput type="text"> // #myInput 代表這個 input 元素。
<button (click)="doSomething(myInput.value)">送出</button> // 可以在模板中直接取用
```

也可以用在取得元件的參考
```html
<app-child #childComp></app-child>
<button (click)="childComp.someMethod()">呼叫子元件方法</button>
```

### ng-template

`ng-template` 適合定義可重複使用的模板片段，不會直接渲染到 DOM 中，只有當引用條件被觸發時才會渲染。
- 除了先前提到搭配 ngIf 等結構指令使用外，還可以搭配 `ngTemplateOutlet` 指令來動態插入模板片段。
- `ngTemplateOutlet`：可以根據條件、模板參考變數來動態插入 `<ng-template>` 定義的模板片段。
```html
<ng-template #loading>
  <p>載入中...</p>
</ng-template>
<ng-template #content>
  <p>內容顯示</p>
</ng-template>

<ng-container *ngTemplateOutlet="isLoading ? loading : content"></ng-container>
```
### viewChild、viewChildren
若想在元件類別中取得模板參考，可以使用 `viewChild` / `@ViewChild` 裝飾器來取得
- 在定義時，需傳入模板參考變數的名稱字串。
- `ElementRef`：是 Angular 提供的一個類別，用來包裝 DOM 元素的參考。  

> 需要在 `ngAfterViewInit` 生命週期中使用，才能確保模板已經初始化完成。

```ts
@Component({
  selector: 'app-my-component',
  template: `
    <input #myInput type="text">
  `
})
export class MyComponent {
  @ViewChild('myInput') input!: ElementRef<HTMLInputElement>;
  
  ngAfterViewInit() {
    console.log(this.input); // ElementRef
  }
}
```
```ts
export class MyComponent {
  input = viewChild<ElementRef<HTMLInputElement>>('myInput');
}
```
若想取得多個模板參考，可以使用 `viewChildren` / `@ViewChildren` 裝飾器來取得
```ts
@Component({
  selector: 'app-example',
  template: `
    <div #item>Item 1</div>
    <div #item>Item 2</div>
    <div #item>Item 3</div>
  `
})
export class ExampleComponent {
  items = viewChildren<ElementRef>('item');
  // @ViewChildren('item') items!: QueryList<ElementRef>; 
  // QueryList，類似陣列，可以用來操作多個元素。
  
  ngAfterViewInit() {
    console.log(this.items());
  }
}
```

### 傳遞參數
使用 `<ng-template>` 聲明模板時，可以透過 `let-` 前綴來宣告該片段可接收的參數，模板內即可使用這些參數。
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <ng-template #greet let-name let-age="age">
      <p>你好，{{ name }}！你 {{ age }} 歲。</p>
    </ng-template>
  `
})
```

## 專案製作
今日目標：刪除待辦、修正輸入問題
- 使用 output 通知刪除代辦
- 新增待辦排除空字串可以新增、輸入後要清空輸入框

[day 16 分享](https://github.com/johnsonchen3669/angular-demo-todo/commit/fc6750f52ac67dfce257de7072075092cb94e99a)
## 結論
今天介紹了 Angular 的模板參考變數、ng-template，明天會繼續介紹模板的用法。
