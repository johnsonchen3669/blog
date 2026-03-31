---
title: Pipes | Angular 新手練功日誌
description: "介紹 Angular Pipes 的使用方式，包含內建管道、自訂管道與常見格式化範例。"
slug: pipes
series: angular-training
order: 21
tags:
  - angular
  - angular-training
  - pipes
  - formatting
pubDate: 2025-09-21
lastModDate: ''
ogImage: true
toc: true
share: false
giscus: true
search: true
---
管道 Pipes 是 Angular 模板表達式中的一個特殊運算符，使用 `|` 來轉換數據在畫面上顯示的格式
官方有再提供 `@angular/common` 許多內建管道，像是 `Decimal Pipe` 可將數字轉換為帶有小數點的字串、轉換大小寫可使用 `LowerCasePipe`、`UpperCasePipe` 等

今天會提供 `Currecy Pipe`、`DatePipe` 的範例，並說明如何自訂管道。
[範例](https://stackblitz.com/edit/stackblitz-starters-vjt9g8rk?file=src%2Fmain.ts)
## 使用方法
1. 在元件的 `imports` 陣列中引入所需的管道
2. 在模板中使用 `|` 來應用管道
3. . 可選擇性地使用 `:` 來傳遞參數給管道; 傳入多個參數的寫法仍是按照順序使用冒號，例如 `{{ value | myPipe:arg1:arg2 }}`

## Currecy Pipe
根據當地的貨幣格式，將數字轉換為貨幣字串。
可添加參數，詳情可參考官方文件
例如： 十進位表示選項 `{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}`
- 小數點前的最小整數位數，預設 1
- 小數點後的最小位數，預設 2
- 小數點後的最大位數，預設 2
```html
<!--$1,234.00-->
<p> {{ 1234 | currency}}</p> 
<!--$1,234 -->
<p> {{ 1234 | currency: '$':'symbol':'1.0-0' }}</p>
```

## DatePipe
用於格式化日期。
可傳入參數來指定日期格式，官方有提供多種預設格式，例如 `shortDate`、`mediumDate`、`fullDate` 等。
也可以自訂格式，例如 `y/MM/dd`、`MM/dd/yyyy` 等，詳情可參考官方文件。

```html
<!--Sunday, September 21, 2025-->
<time>{{ date | date:'fullDate' }}</time><br/>
<!--2025/09/21-->
<time>{{ date| date:'y/MM/dd'}}</time>
```

## 自訂 Pipes
自訂 `pipe` 需要 `@Pipe` 裝飾器，並實作 `PipeTransform` 介面，實作 `transform` 方法來定義轉換邏輯。
 - `name` 屬性用來指定管道的名稱，這個名稱會在模板中使用。
 - `standalone: true` 表示這個管道是獨立的，可以直接在元件中使用，和之前元件介紹的概念相同。
### 快速生成 Pipes
```bash
ng generate pipe <pipe-name>
ng g p <pipe-name>
```

**民國年轉換管道範例**

`transform`方法可以接收任意多個參數。
- `value`：第一個一定是 `value`，代表要轉換的輸入值。
- 之後的參數就是在模板用冒號傳進來的值。
```ts
import { Pipe, PipeTransform } from '@angular/core';

type RocFormat = 'full' | 'year' | 'numeric';

@Pipe({
 name: 'rocYear'
})
export class RocYearPipe implements PipeTransform {
  transform(value: Date | string | number | null | undefined, format: RocFormat = 'full'): string {
    if (value == null || value === '') return '';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const gy = date.getFullYear();
    const roc = gy - 1911;
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');

    if (format === 'year') return `民國${roc}年`;
    if (format === 'numeric') return `${roc}/${mm}/${dd}`; // 數字格式
    return `民國${roc}年${mm}月${dd}日`;
  }
}
```
```html
  <time>{{ date| rocYear: 'numeric' }}</time>
```

## 結論
今天介紹了 Angular 中的管道 Pipes，瞭解了基礎使用方法，最後也說明了如何自訂管道。明天會介紹範本型表單。
