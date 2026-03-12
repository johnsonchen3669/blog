---
title: Day 7 - 資料繫結
description: "說明 Angular 的 Property Binding、Attribute Binding、Class Binding 與 Style Binding 用法。"
pubDate: 2025-09-06
lastModDate: ''
ogImage: true
toc: true
share: false
giscus: true
search: true
---
上一篇文章，我們介紹了動態處理資料的字串插值，這篇會介紹另一個重要技術：Binding
## 繫結 Binding 
- 透過在屬性值周圍加上 `[]` 來綁定屬性值，動態更新資料。
- 繫結的值可以是變數、表達式或函式呼叫。
## 屬性繫結 Property Binding
- 直接綁定到 DOM 元素的屬性（property），例如：`[disabled]="isDisabled"`  
- 會根據變數值動態更新 DOM 屬性，會直接影響 DOM 物件的行為，推薦用於互動性元件。

```html
<!-- `isDisabled` 為 `true` 時，按鈕會被禁用 -->
<button [disabled]="isDisabled"></button>
<!--
雖然看起來像是在綁定 `<img>` 標籤本身的 src 屬性 ，但實際上是會將底層 HTMLImageElement DOM 物件的 src 屬性綁定到 `someSrc` 變數中儲存的值。
-->
<img [src]="someSrc">
```

## 屬性值繫結 Attribute Binding  
- 只會設定或移除 HTML 屬性，不會動態更新 DOM 屬性。
- 只影響 HTML 標籤本身，通常用於自訂屬性或特殊情境，像是無障礙屬性（ARIA）。

```html
<!--
當綁定 ARIA 屬性時，無法針對底層 DOM 物件屬性進行操作，因為這些屬性沒有對應的物件屬性，
因此可以透過在想要動態綁定的屬性名稱前面加上 `attr`，來綁定到 HTML 的屬性（attribute）上
-->
<div 
  [attr.aria-valuenow]="currentVal" 
  [attr.aria-valuemax]="maxVal"
  aria-valuemin="0">
  ...
</div>
```

## 綁定和字串插值搭配運用

- 若運用情境單純，也可以在屬性中使用字串插值，Angular 會自動處理，將賦值視為 Property Binding。
```html
<img src="profile-photo.jpg" alt="Profile photo of {{ firstName }}" >
```
- 綁定原生 HTML 屬性時，需要在 屬性名稱前加上 `attr.`，來區別是綁定 HTML 屬性還是 DOM 屬性。
```html
<button attr.aria-label="Save changes to {{ objectType }}">
```

## 類別繫結 Class Binding
- 單一類別繫結：可以針對單一 class 進行動態綁定樣式
	- `[class.className]` 語法，將 class 名稱與布林值綁定。
- 多重類別繫結：可以針對多個 class 進行動態綁定樣式
	- 使用字串語法，將 class 名稱以空格分隔。 `[class]="className1 className2"`
	- 使用物件語法，將 class 名稱作為鍵，布林值作為值。 `[class]="{ className1: condition1, className2: condition2 }`
	- 使用陣列語法，將 class 名稱作為陣列元素。`[class]="['className1', 'className2']`
```html
<div [class.active]="isActive" 
	[class]="{ 'text-large': isLargeText, 'text-bold': isBoldText }">
	Content>
</div>
```
## 樣式繫結 Style Binding
- 單一樣式繫結：可以針對單一 CSS 屬性進行動態綁定樣式
	- `[style.property]` 語法，將 CSS 屬性名稱與值綁定。
		- `-`：連字符（dash）會被轉換為駝峰式命名（camelCase），例如 `font-size` 會變成 `fontSize`。
		- 可以加上單位，例如 `px`、`rem` 等。 `[style.fontSize.px]="value"` 或`[style.fontSize.rem]="value"`
- 多重樣式繫結：可以針對多個 CSS 屬性進行動態綁定樣式
	- 使用字串語法，將 CSS 屬性名稱與值以分號分隔。 `[style]="property1: value1; property2: value2"`
	- 使用物件語法，將 CSS 屬性名稱作為鍵，值作為值。 `[style]="{ 'property1': value1, 'property2': value2 }`

```html
<h2 [style.font-size]="'5rem'">
	Title
<h2>
```
##  專案實作
今日目標，依照模板建立 Todo List 的元件結構
- header
- add-todo
- todo-list
- todo-list/todo-item
[day 7 分享](https://github.com/johnsonchen3669/angular-demo-todo/commit/7c6d002dc9c9308b49959490055e05f32d36c279)
[day 7 分享 (模組)](https://github.com/johnsonchen3669/angular-demo-todo/commit/f1caea5c9b3183bf39fe900188be4da75b35038a)
## 結論
今天介紹了 Angular 中的繫結技術，這是讓應用程式能夠動態更新資料和樣式的關鍵技術。下一篇來介紹 event listeners 事件監聽，讓我們能夠處理使用者互動事件。
