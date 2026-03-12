---
title: Day 22 - 範本驅動型表單
description: "說明範本驅動型表單的建立方式，包含 ngModel、ngSubmit 與驗證狀態處理。"
pubDate: 2025-09-22
lastModDate: ''
ogImage: true
toc: true
share: false
giscus: true
search: true
---
目前在 Angular 中表單處理方式，主要有兩種：
1. 範本驅動型表單 (Template-driven Forms)
2. 反應式表單 (Reactive Forms)

> Angular Signal-Based Forms 有傳出推出計畫，是未來值得關注的方向。

本文介紹範本驅動型表單的使用方式。
[範例](https://stackblitz.com/edit/stackblitz-starters-njggdsmy?file=src%2Fmain.ts)
## 範本驅動型表單
範本驅動型表單是依靠模板中的指令 `ngModel` 來建立和操作底層物件模型。
- 適合基礎表單需求，可重複使用性較差，擴充性不如反應式表單。

`ngModel` Angular 提供的屬性指令，用於在表單元素和組件屬性之間建立雙向綁定。需要搭配 name 屬性，才能正確註冊到表單中。

```html
<form (ngSubmit)="onSubmit()">
	<p>
		<label for="name">Name</label>
		<input type="text" id="name" name="name" [(ngModel)]="name" />
	</p>
</form>
```
`ngSubmit`：用於處理表單提交事件，當表單被提交時，會觸發指定的方法。
```ts
name: string = '';
onSubmit() {
	console.log(this.name);
}
```

但也不是只能雙向綁定，可以單純用來註冊表單控制項到 NgForm。
```html
<form #form="ngForm" (ngSubmit)="onSubmit(form)">
	<p>
		<label for="name">Name</label>
		<input type="text" id="name" name="name" ngModel/>
	</p>
</form>
```
在監聽送出表單時，就可取得表單送出時的值。
```ts
onSubmit(formData: NgForm) {
    console.log(formData); // 表單物件，包含所有表單控制項的值、狀態等資訊
    formData.form.reset(); // 重置表單
}
```
### 驗證

範本驅動型表單主要在模板中定義和管理表單，所以像是些驗證邏輯、表單狀態等，都是在模板中處理。
例如：必填 `required`、最小長度 `minlength`、最大長度 `maxlength` 等驗證規則，會使用 HTML 屬性來定義。
- 設定 HTML 屬性來定義規則，會被 Angular 轉化成屬性指令，且會禁用瀏覽器的預設驗證，改由 Angular 來管理驗證狀態。
- 也可以設定 `pattern` 屬性來定義正則表達式驗證規則。
```html
<label for="name">Name</label>
<!-- 最小長度驗證 -->
<input type="text" id="name" name="name" ngModel required minlength="5"/> 
<label for="email">Email</label>
<!-- email 驗證 -->
<input type="email" id="email" name="email" ngModel email/>
```

可搭配樣板變數，取得表單控制項的狀態，並根據狀態顯示錯誤訊息。
- `touched`：表示使用者是否曾經觸碰過該控制項。
- `dirty`：表示控制項的值是否被修改過。
- `invalid`：表示控制項的值是否不符合驗證規則。

```html
<form #form="ngForm" (ngSubmit)="onSubmit(form)">
 <div class="form-control">
		<label for="name">Name</label>
		<input type="text" id="name" name="name" ngModel required minlength="5" #nameCtrl="ngModel"/>
		@if(nameCtrl.touched && nameCtrl.dirty && nameCtrl.invalid) {
			<div>
				name 為必填，且長度需大於 5
			</div>
		}
	</div>
</form>
```

表單有設定驗證後，Angular 會注入一些特殊的 CSS 類別到控制項中。在 CSS 中，也可以這些狀態來改變樣式。例如：
- `ng-touched`：表示使用者曾經觸碰過該控制項。
- `ng-invalid`：表示控制項的值不符合驗證規則。
```css
.control:has(input.ng-invalid.ng-touched) > input {
  border-color: var(--danger);
}
```

## 結論
今天介紹了範本驅動型表單的基本使用方式，適合簡單的表單需求。明天會介紹反應式表單，適合較複雜的表單需求。
