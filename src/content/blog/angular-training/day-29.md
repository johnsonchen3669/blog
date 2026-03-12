---
title: Day 29 - Animations
description: "說明 Angular 新舊動畫 API 的差異，涵蓋 animate.enter、animate.leave 與第三方整合。"
pubDate: 2025-09-29
lastModDate: ''
ogImage: true
toc: true
share: false
giscus: true
search: true
---
今天會體驗一下新動畫 API `animate.enter`、`animate.leave`，讓我們能更簡單地為元件添加進場動畫效果。

Angular 作為主流前端框架之一，從早期版本就內建了強大的動畫系統。目前動畫 API 也推出了新版本，使用 `animate.enter` and `animate.leave`，讓動畫的撰寫更貼近現代 Web 標準，並且更容易與 CSS 動畫或第三方動畫庫整合。

[範例](https://stackblitz.com/edit/stackblitz-starters-phds16ns?file=src%2Fapp%2Fapp.ts)
## 舊有動畫 API
Angular 早期的動畫系統，開發者需在元件的 animations 屬性中定義動畫 trigger，並在模板中以 `@triggerName` 綁定。

```ts
import { Component } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class AppComponent {
  isShown = false;

  toggle() {
    this.isShown = !this.isShown;
  }
}
```

```html
<h2>舊寫法 <code>@fadeInOut</code> 範例</h2>
<button type="button" (click)="toggle()">切換顯示</button>
<div *ngIf="isShown" class="box" @fadeInOut>
  <p>這個方塊有進出場動畫</p>
</div>
```

> 相關 api 預計在 Angular 23 中移除，Angular 團隊建議將原生 CSS 與新的動畫 api 搭配使用

這種寫法雖然功能強大，但對於簡單動畫來說顯得繁瑣，且不易與第三方動畫庫整合。

## 新一代動畫 API
目前引進了 `animate.enter` 與 `animate.leave` 兩個新 API 。主要特色包括：
- 使用的繫結語法和其他屬性繫結用法相同，可以使用 `[]`來綁定類別，或使用 `()` 來綁定函式。
- 可以與 Angular 的流程控制語法（如 `@if`）搭配使用，實現進場/出場動畫。
- 可整合第三方動畫庫，如  [GSAP](https://gsap.com/) 、 [anime.js](https://animejs.com/) 等。

> 若要在繫結事件中傳入參數，`$event` 物件的類型為 [`AnimationCallbackEvent`](https://angular.dev/api/core/AnimationCallbackEvent)。

`animate.enter` ：可以在元素進入 DOM 時加入動畫效果。可以使用 CSS 類別定義動畫，包括過渡動畫或關鍵影格動畫。
- 動畫完成後，會從 DOM 中移除在 `animate.enter` 中指定的一個或多個類別

```html
<h2><code>animate</code> 範例</h2>
<button type="button" (click)="toggle()">切換顯示</button>

// 需要與流程控制語法搭配使用，才會觸發
@if (isShown()) {
<div class="box" [animate.enter]="enterClass()">
  <p>這個方塊有進出場動畫</p>
</div>
}
```
可搭配 `keyframes` 做出淡入滑動的動畫效果
```css
.fade-in {
  animation: slide-fade 1s;

}
@keyframes slide-fade {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```
```ts
  isShown = signal(false);

  toggle() {
    this.isShown.update((isShown) => !isShown);
  }

  enterClass = signal('fade-in');
```

`animate.leave`：可以在元素離開 DOM 時設定動畫。可以使用 CSS 類別定義動畫，包括過渡動畫或關鍵影格動畫。
- 當動畫完成時，會自動從 DOM 中刪除動畫元素。

```html
<h2><code>animate</code> 範例</h2>
<button type="button" (click)="toggle()">切換顯示</button>
@if (isShown()) {
<div class="box" animate.leave="leaving">
  <p>這個方塊有進出場動畫</p>
</div>
}
```
可搭配漸變淡出的動畫效果
```css
.leaving {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 500ms ease-out, transform 500ms ease-out;
}
```
```ts
isShown = signal(true);
toggle() {
	this.isShown.update((isShown) => !isShown);
}
```

可以更加方便地與第三方動畫庫整合，例如 GSAP
```html
<h2><code>GSAP</code> 動畫範例</h2>
<button type="button" (click)="toggleGsapBox()">GSAP 動畫</button>
@if (isShownGsap()) {
<div #gsapBox class="box" (animate.enter)="animateGsap()">
  <p>這個方塊有進出場動畫</p>
</div>
}
```
```ts
  isShownGsap = signal(false);
  gsapBox = viewChild.required<ElementRef<HTMLDivElement>>('gsapBox');

  toggleGsapBox() {
    this.isShownGsap.update((isShown) => !isShown);
  }

  animateGsap() {
    const box = this.gsapBox();
    if (box) {
      gsap.to(box.nativeElement, {
        x: 120,
        rotation: 360,
        duration: 1,
        yoyo: true,
        repeat: 1,
      });
    }
  }
```

## 結論
今天介紹了目前基礎的 Angular animation API 用法，讓我們能更簡單地為元件添加進出場動畫效果。
