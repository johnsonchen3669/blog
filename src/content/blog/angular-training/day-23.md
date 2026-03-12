---
title: Day 23 - 回應式表單
description: "介紹回應式表單的建立、驗證、FormArray 與巢狀 FormGroup 用法。"
pubDate: 2025-09-23
lastModDate: ''
ogImage: true
toc: true
share: false
giscus: true
search: true
---
今天介紹回應式表單 Reactive Forms ，它不在模板中定義表單，而是在元件類別中使用 `FormControl`、`FormGroup` 等來建立表單，適合複雜的表單需求。

[範例](https://stackblitz.com/edit/stackblitz-starters-xlcdnper?file=src%2Fapp.ts)
### 建立回應式表單
在元件類別中建立 `FormGroup`，需傳入一個物件，定義表單的結構與控制項。傳入物件的鍵值會對應一個 `FormControl` 、 `FormArray` 或嵌套的 `FormGroup`。
- `FormGroup`：表示一組相關的表單控制項，通常用於將多個控制項組合在一起，例如：使用者資訊表單。
- `FormControl`：表示單一的表單控制項，例如：輸入框、選取框等。
- `FormArray`：表示一組按索引排列的表單控制項陣列，適合動態數量的同類控制項，例如：例如多個電話、多個地址。

> 在元件中需要引入 `ReactiveFormsModule`。

```ts
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
@Component({
	...
	imports: [ReactiveFormsModule],
  ...
})
export class MyComponent {
	form = new FormGroup({
		name: new FormControl(''),
		email: new FormControl(''),
	});

	onSubmit() {
		console.log(this.form.value);
	}
}
```
需要在模板中使用 `[formControl]` 指令來綁定表單控制項，對應到建立的 `FormGroup` 中的鍵值。

```html
<div class="control">
	<label for="name">Name</label>
	<input id="name" type="text" [formControl]="form.controls.name" />
</div>
<div class="control">
	<label for="name">Email</label>
	<input id="email" type="email" [formControl]="form.controls.email" />
</div>
```

若直接在 `<form>` 標籤上使用 `[formGroup]` 指令來綁定整個表單組，也可以省略 `[formControl]`，使用 `formControlName` 指令來直接綁定對應的 `FormControl`/  `FormGroup` / `FormArray` 的鍵值。

```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
	<div class="control">
		<label for="name">Name</label>
		<input id="name" type="text" formControlName="name" />
	</div>
	<div class="control">
		<label for="email">Email</label>
		<input id="email" type="email" formControlName="email" />
	</div>
	<button type="submit">Submit</button>
</form>
```

若需要操作表單的值，可以使用 `patchValue`，來更新部分表單控制項的值。
```ts
this.form.patchValue({
	name: 'New Name'
});
```

### Form Array 和 Form Group 差異
`FormArray` 和 `FormGroup` 類似，但它是以陣列的形式來管理控制項
- `FormGroup`：固定欄位、每個欄位有明確名稱 。
- `FormArray`欄位數量可新增/刪除、以索引為主 。
```ts
const phones = new FormArray([
  new FormControl('0912-000-000')
]);

// 新增/移除
this.phonesArray.push(new FormControl('', Validators.required));
this.phonesArray.removeAt(0);
```
### 驗證
透過傳入第二個的參數，可以設定 `FormControl` 驗證規則。
- `Validators` 提供了多種內建的驗證器。
- `asyncValidators`：用於非同步驗證，可傳入自訂的非同步驗證函式，例如從伺服器驗證資料。
```ts
form = new FormGroup({
		name: new FormControl('', { validators: [Validators.required, Validators.minLength(5)] }),
		email: new FormControl('',{ validators: [Validators.required, Validators.email] }, asyncValidators: [emailIsUnique],),
	});
```

可以直接表單控制項的 `errors`、`touched`、`dirty`、`valid` 等屬性來檢查驗證狀態。
```ts
get nameInvalid() {
	return this.form.controls.name.invalid && this.form.controls.name.dirty && this.form.controls.name.touched;
}
```

```html
@if(nameInvalid) {
	<p class="error">Name is required.</p>
}
```

### 自訂驗證
自訂驗證函式，需傳入一個 `AbstractControl` 參數，並回傳一個物件表示驗證失敗，或回傳 `null` 表示驗證通過。

> `AbstractControl` 是 Angular 中表單控制項的抽象類別，可以代表 `FormControl`、`FormGroup` 或 `FormArray`

```ts
function passwordMatch(control: AbstractControl) {
	if(control.value.includes('ABC')) {'){
	 return null;
	}
	// { 自定義錯誤名稱 : true 或具體的錯誤資訊}
	return { passwordMatch: true };
}
```

### 巢狀表單 
巢狀 `FormGroup`，可以在表單中建立子表單組，並在建立時設定驗證規則
```ts
form = new FormGroup({
    passwordGroup: new FormGroup(
      {
        password: new FormControl('', [
          Validators.required,
          Validators.minLength(6),
        ]),
        confirmPassword: new FormControl('', Validators.required),
      },
      { validators: [passwordMatch] } // 整個 FormGroup 的驗證規則
    )
});
```

使用 `formGroupName` 也可以同樣綁定巢狀的 `FormGroup`
```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
	<div formGroupName="passwordGroup" class="password-group">
		<div class="control">
			<label for="password">密碼</label>
			<input id="password" type="password" formControlName="password" />
		</div>
		<div class="control">
			<label for="confirmPassword">確認密碼</label>
			<input
				id="confirmPassword"
				type="password"
				formControlName="confirmPassword"
			/>
		</div>
	</div>
</form>
```

## 結論
今天介紹了基本的回應式表單使用方式，包含建立表單、驗證、巢狀表單等，明天會介紹 RxJS 在 Angular 的應用。 
