---
title: 指令 | Angular 新手練功日誌
description: "整理 Angular 指令的基本概念，包含屬性指令、結構指令與自訂指令寫法。"
slug: directives
series: angular-training
order: 20
tags:
  - angular
  - angular-training
  - directives
  - template-syntax
pubDate: 2025-09-20
lastModDate: ''
ogImage: true
toc: true
share: false
giscus: true
search: true
---
指令是指在 Angular 應用程式中，可以改變元素的設定、樣式及添加附加行為的類別，所以我們前面提到的元件本質上也是一種指令，只是帶有模板和樣式。
而不含模板的指令，則有兩種主要類型：屬性指令和結構指令

## 屬性指令 Attribute directives
主要用來改變元素的外觀或行為，但不會新增或移除元素，改變到 DOM 結構。
最常見的內建屬性指令有： `ngClass`、`ngStyle`、 `ngModel`

> 在過去 ngClass、ngStyle 常用來支援多個類別或樣式的動態切換，但在 class、style 繫結也可以達成相同效果後，基本上可以直接使用 class、style 繫結來取代 ngClass、ngStyle。

## 結構指令 Structural Directives
主要用來改變 DOM 結構，透過新增或移除元素來改變畫面內容。
會根據條件動態新增或移除 HTML 元素，語法通常加上 `*`，如：`<div *ngIf="isLogin"></div>`。
例如：`*ngIf`、`*ngFor`、`*ngSwitch`。

> `*ngIf`、`*ngFor`、`*ngSwitch` 預計在 Angular 22 後移除，建議改用 `@if`、`@for`、`@switch`。

## 自定義指令
自定義指令除了根據需求創建自定義的屬性指令或結構指令之外，也可以透過注入服務來擴展指令的功能。
### 快速生成指令
 Angular CLI 的指令，自動產生一個指令檔案。
```bash
ng generate directive <directive-name>
ng g d <directive-name>
```

使用 `@Directive` 裝飾器來定義自訂指令。
 - `selector`：會使用屬性選擇器的方式來綁定指令。
- `standalone: true`：表示這是一個獨立的指令，不需要包含在任何 NgModule 中，和元件時介紹相同
- `host`：用於綁定指令需執行的事件。

[指令範例](https://stackblitz.com/edit/stackblitz-starters-kh3c6hv2?file=src%2Fmain.ts)
### 屬性指令範例
通常會搭配 `ElementRef` 來操作 DOM 元素，改變元素的樣式。
或是在事件處理函式中，加入其他邏輯，例如：點擊連結後，目標網址會添加 URL 參數。
```ts
@Directive({
  selector: '[appHoverColor]',
  host: {
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
  },
})

export class HoverColorDirective {
  color = input('red', { alias: 'appHoverColor' }); // 將 input 名稱和屬性指令對應
  private el = inject<ElementRef<HTMLElement>>(ElementRef);

  onMouseEnter() {
    this.el.nativeElement.style.color = this.color(); // nativeElement 代表被綁定的元素
  }
  onMouseLeave() {
    this.el.nativeElement.style.color = '';
  }
}
```

> ElementRef：`ElementRef` 是 Angular 中的一個類別，用於直接操作 DOM 元素。

設定完指令後，就可以在模板中使用
```html
<p appHoverColor="blue">
```

### 結構指令範例
`TemplateRef`：可以取得模板內容的參考。

`ViewContainerRef`： 可以取得容器在所屬檢視中位置的錨點元素。
- 可以用來在指令中動態插入或移除模板片段。

> 通常 `ViewContainerRef` 與 `TemplateRef` 一起使用，以便在指令中動態渲染模板內容。

```ts
export class AuthDirective {
  user = input.required<Tuser>({ alias: 'appAuth' });
  loginService = inject(Login);
  private templateRef = inject(TemplateRef);
  private viewContainerRef = inject(ViewContainerRef);
  
  constructor() {
    effect(() => {
      if (this.loginService.login() === 'admin') {
        this.viewContainerRef.createEmbeddedView(this.templateRef); // 將模板內容插入到檢視中位置的錨點元素
      } else {
        this.viewContainerRef.clear();
      }
    });
  }
} 

export type Tuser = 'admin' | 'guest';
```
`*` 是 Angular 結構型指令的語法糖，實際上 Angular 會將其轉換為 `<ng-template>` 元素，並將指令應用於該模板。
```html
<div *appAuth="'admin'">admin 會顯示</div>
<!--實際上 Angular 會轉換-->
<template appAuth="'admin'">
  <div>admin 會顯示</div>
</template>
```

## 結論
今天介紹了 Angular 中的指令的基礎用法，包括屬性指令和結構指令。明天會介紹 pipes 應用。
