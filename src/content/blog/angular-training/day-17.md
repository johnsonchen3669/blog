---
title: 模板相關用法二 | Angular 新手練功日誌
description: "接續介紹 ng-container、ng-content 與 contentChild、contentChildren 的模板技巧。"
slug: template-patterns-part-2
series: angular-training
order: 17
tags:
  - angular
  - angular-training
  - ng-content
  - content-projection
pubDate: 2025-09-17
lastModDate: ''
ogImage: true
toc: true
share: false
giscus: true
search: true
---
今天會接續介紹一些在模板中的常見的用法
### ng-container

`ng-container` 適合用於不需要額外容器元素的場景。
- 邏輯分組容器，不會產生額外的 DOM 元素，只渲染內容本身。
```html
<!-- 避免額外的 div 包裝 -->
<ng-container *ngIf="showUserInfo">
  <h2>使用者資訊</h2>
  <p>姓名：{{ userName }}</p>
  <p>信箱：{{ userEmail }}</p>
</ng-container>
```
- 也可以當作 `NgTemplateOutlet` 動態注入的位置。
```html
<ng-container *ngTemplateOutlet="buttonTpl; context: { $implicit: '完成', color: 'green' }"></ng-container>
<ng-container *ngTemplateOutlet="buttonTpl; context: { $implicit: '編輯', color: 'blue' }"></ng-container>
<ng-container *ngTemplateOutlet="buttonTpl; context: { $implicit: '刪除', color: 'red' }"></ng-container>

<ng-template #buttonTpl let-text let-color="color">
  <button [style.color]="color">{{ text }}</button>
</ng-template>
```

>  `context` 像是「模板的變數環境」，`$implicit` 是一個特殊屬性，會被像是 `let-text`不加等號的自訂變數接收。其他屬性（如 `color`）用 `let-變數名="屬性名"` 取得。
## ng-content  
`ng-content`：用於在元件模板中定義佔位符，插入的內容會替換掉 ng-content 標籤的位置。
```html
<app-card>
 <!-- 元件中間的內容會被投影到 app-card 元件的 ng-content 位置 -->
  <article>
    <h2>{{ task.title }}</h2>
    <p>{{ task.summary }}</p>
  </article>
</app-card>
```
```html
<!-- app-card.component.html -->
<div>
  <ng-content></ng-content>
</div>
```

> **不應該在條件語句（`@if`、`@for`、`@switch`）包含 `<ng-content>`**
> - 對於用於渲染到 `<ng-content>` 佔位符的內容，Angular 總是會實例化並建立 DOM 節點，因此 Angular 的行為與你可能期望的不同。
> - 讓父元件決定是否要投影內容，而不是在子元件中條件性地顯示已投影的內容。

`select="selector"`：支援基於 CSS 選擇器將多個不同的元素投射到不同的 `<ng-content>` 佔位符。
```html
<!-- app-card.component.html -->
<div class="card">
  <header>
    <ng-content select="[card-title]"></ng-content>
  </header>
  <section>
    <ng-content select="p[card-content]"></ng-content>
  </section>
</div>
```
```html
<!-- 使用方式 -->
<app-card>
  <h2 card-title>標題</h2>
  <p card-content>這是內容</p>
  <p>這是其他內容</p>
</app-card>
```
 多個 ng-content：可以在組件中使用多個 ng-content，並使用 select 屬性來區分不同的內容插入位置。
-  select 可用 `,` 分隔多個選擇器。
- 剩下的內容會投影到沒有 select 的 ng-content。
```html
<!-- app-panel.component.html -->
<div class="panel">
  <ng-content select="h1, h2"></ng-content>
  <ng-content select="p"></ng-content>
  <ng-content></ng-content> <!-- 其他未被選中的內容 -->
</div>
```

`ngProjectAs`：用於指定插入內容的別名，這樣就不用真的加上屬性，而是用 `ngProjectAs` 值進行比較。
```html
<!-- app-card.component.html -->
<div class="card">
  <ng-content select="[card-header]"></ng-content>
  <ng-content></ng-content>
</div>
```
```html
<app-card>
  <div ngProjectAs="[card-header]">
    <strong>這是 header</strong>
  </div>
  <div>
    這是一般內容
  </div>
</app-card>
```

### contentchild、contentchildren
 `contentchild` / `@ContentChild` 裝飾器，讓子元件可以存取、操作父元件「投影」進來的 DOM 或元件實例
- 在定義時，需傳入模板參考變數的名稱字串。

> 需要在 `ngAfterContentInit` 生命週期中使用，才能確保投影內容已經初始化完成。

```ts
@Component({
  selector: 'app-panel',
  template: `<div class="panel"><ng-content></ng-content></div>`
})
export class PanelComponent implements AfterContentInit {
  @ContentChild('panelTitle') titleEl!: ElementRef<HTMLHeadingElement>;
  paraghEl = contentChild('panelParagraph'); // 也可以用 contentChild

  ngAfterContentInit() {
    // 可以操作投影進來的 h2 元素
    console.log(this.titleEl.nativeElement.textContent);
  }
}
```
```html
<app-panel>
  <h2 #panelTitle>這是標題</h2>
  <p #panelParagraph>這是段落</p>
</app-panel>
```
若想取得多個投影內容，可以使用 `contentchildren` / `@ContentChildren` 裝飾器來取得
```html
<app-tabs>
	<div #item>Tab 1 內容</div>
	<div #item>Tab 2 內容</div>
	<div #item>Tab 3 內容</div>
</app-tabs>
```

```ts
@Component({
  selector: 'app-tabs',
  template: `
    <div class="content">
      <ng-content></ng-content>
    </div>
  `
})
export class TabsComponent {
  @ContentChildren('item') items!: QueryList<ElementRef>;
  // items = contentChildren<ElementRef>('item');
  
  ngAfterContentInit() {
    console.log(this.items.length);
  }
}
```
## 專案製作
今日目標：待辦勾選切換
- 在 todo-list.component.html 中綁定 class.completed 樣式
-  output 事件傳遞給父元件

[day 17 分享](https://github.com/johnsonchen3669/angular-demo-todo/commit/04dbb3fc6f8a7f794f65512b76ba5bd04c65baf8)
## 結論

今天介紹了 Angular 模板中 `ng-container`、`ng-content` 的基礎用法，明天會介紹可以將資料共同管理的 `service`。
