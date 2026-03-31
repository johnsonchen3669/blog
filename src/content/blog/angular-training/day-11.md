---
title: 控制流程 switch | Angular 新手練功日誌
description: "整理 Angular 模板中的 switch 條件控制，涵蓋 @switch 與舊版 ngSwitch 的寫法。"
slug: control-flow-switch
series: angular-training
order: 11
tags:
  - angular
  - angular-training
  - control-flow
  - switch
pubDate: 2025-09-11
lastModDate: ''
ogImage: true
toc: true
share: false
giscus: true
search: true
---
今天要介紹在模板中，如何使用 switch 條件語句來控制顯示的內容。
目前主要有兩種寫法：
- `@switch` 語法 ( Angular 17+ )
- 使用舊版的 `ngSwitch` 指令
## @switch

`@switch (條件)`：根據條件值選擇顯示內容。
- `@case (值)`：條件等於這個值時顯示內容。
- `@default`：沒有任何 case 匹配時顯示內容。
- 沒有符合任何`@case`、及沒有 `@default` 區塊時，則不顯示任何內容。
- 比較方式是使用 `===`，不會有 fallthrough，因此不需要在區塊中使用相當於 `break` 或 `return` 語句。

> **fallthrough** 指的是當某個 case 執行完後，沒有使用 break 或 return 等語句，程式會繼續執行下一個 case 的內容。

```html
@switch (status) {
  @case ('success') {
    <div>成功</div>
  }
  @case ('fail') {
    <div>失敗</div>
  }
  @default {
    <div>未知狀態</div>
  }
}
```
## ngSwitch
舊版的寫法，使用 `ngSwitch` 指令來實現條件切換。
- `[ngSwitch]="value"`：根據變數的值切換顯示內容。 
- `*ngSwitchCase`：每個 case 對應一個值。
- `*ngSwitchDefault`：預設顯示（沒有符合的 case 時）。
```html
<div [ngSwitch]="fruit">
  <div *ngSwitchCase="'apple'">蘋果</div>
  <div *ngSwitchCase="'banana'">香蕉</div>
  <div *ngSwitchCase="'orange'">柳橙</div>
  <div *ngSwitchDefault>未知水果</div>
</div>
```

和`*ngIf`一樣，`ngSwitch` 指令也需要引入 `CommonModule`。
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

獨立元件可只引入 `NgSwitch`
```ts
// 獨立元件
import { CommonModule } from '@angular/common';
import { NgSwitch } from '@angular/common';

@Component({
  ...
  // imports: [CommonModule], 
  imports: [NgSwitch],
	...
})
```

> 在 Angular 22 後，ngSwitch 會正式棄用，僅建議在舊專案中使用。

## 專案製作
今日目標：練習事件觸發，按下按鈕時，可以增加待辦清單數量
-  先定義任務的資料結構
- 在 add-todo 元件中，建立一個暫時的清單
- 按下按鈕後，會增加清單內任務數量

[day 11 分享](https://github.com/johnsonchen3669/angular-demo-todo/commit/5bd051a28e8aa7cc43272bd438e8c6f8f7e1eb46)
## 結論
今天介紹了兩種在 Angular 模板中使用 switch 條件語句的方法：`@switch` 語法和舊版的 `ngSwitch` 指令。
明天介紹如何在模板中使用迴圈語句來顯示列表內容。
