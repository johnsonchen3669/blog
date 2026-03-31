---
title: RxJs | Angular 新手練功日誌
description: "說明 RxJS Observable 的建立、訂閱、取消訂閱與常用 pipe 操作符。"
slug: rxjs
series: angular-training
order: 24
tags:
  - angular
  - angular-training
  - rxjs
  - observable
pubDate: 2025-09-24
lastModDate: ''
ogImage: true
toc: true
share: false
giscus: true
search: true
---
RxJs 是一個用於處理非同步資料流的函式庫，在 Angular 中被廣泛使用，特別是在處理 HTTP 請求、事件和其他非同步操作時。

今天僅會介紹一些 RxJs 的基本概念和用法，RxJs 中還有提供許多功能可以對 Observable 進行操作，可以參考官方文件或其他資源來深入了解。
## Observable
RxJs 的核心概念是 Observable（可觀察對象），它代表一個可以發射多個值的資料流。可以是同步的，也可以是非同步的。

### 建立方式
需要透過實例化 `Observable` 類別來建立一個 Observable，會在建構函式中傳入一個回呼函式，這個函式會接收一個 `subscriber` 物件，透過這個物件可以發射值、錯誤或完成通知。
- `next`： 用來發射下一個值，在訂閱期間可以使用任意次數 。
- `error`： 用來發射錯誤通知，會終止 Observable，並且最多只能發射一次錯誤。
- `complete`： 用來發射完成通知，表示已經完成，和錯誤一樣，最多只能發射一次。

> 慣例上，Observable 變數名稱通常會以 `$` 結尾，以表示它是一個 Observable。

```ts
import { Observable } from 'rxjs';
const observable$ = new Observable<string>(subscriber => {
	// 可以在這裡發射值
	subscriber.next('Hello');
	// 模擬非同步操作
	setTimeout(() => {
		subscriber.next('RxJS');
		subscriber.complete(); // 完成發射
	}, 1000);
	return () => {
		// 這裡是 Teardown 邏輯，可以用來釋放資源
		console.log('Teardown');
	};
});
```

在使用者主動呼叫 `unsubscribe()` 取消訂閱、 `complete` 或 `error` 通知後，Observable
會進入 Teardown 階段，這個階段可以用來釋放資源，例如：取消計時器，避免會持續執行。
```ts
const observable$ = new Observable<string>(subscriber => {
  let count = 0;
  const intervalId = setInterval(() => {
		subscriber.next(`Count: ${count++}`);
		if (count > 5) {
			subscriber.complete(); // 完成發射
		}
	}, 1000);
	return () => {
		// 清除計時器
		clearInterval(intervalId);
		console.log('Teardown');
	};
});
```

### 使用方式
在使用時，會使用 `subscribe` 方法來訂閱 Observable
- 傳入一個回呼函式，這個函式會在每次發射值時被呼叫。
```ts
observable$.subscribe(value => {
	console.log(value);
});
```

也可以傳入一個觀察者物件，這個物件可以定義三個方法，可以分別處理不同的通知：
- `next`： 可取得發射的值，用來處理資料。
- `error`： 可取得錯誤物件，用來處理錯誤。
- `complete`： 沒有參數傳入，用來處理完成通知。
```ts
observable$.subscribe({
  next: value => console.log(value),
  error: err => console.log(err.message),
  complete: () => console.log('Completed')
});
```

在元件中使用時，通常會在 `ngOnInit` 生命週期中訂閱，並在 `ngOnDestroy` 中取消訂閱，以避免記憶體洩漏。
- 訂閱後會回傳一個 `Subscription` 物件，可以其中的 `unsubscribe` 方法來取消訂閱。
```ts
export class MyComponent implements OnInit, OnDestroy {
	private subscription: Subscription;
	
	const observable$ = ...

	ngOnInit() {
		this.subscription = observable$.subscribe(value => {
			console.log(value);
		});
	}

	ngOnDestroy() {
		this.subscription.unsubscribe(); // 取消訂閱
	}
}
```

### 預處理
RxJS 提供了許多操作符來對 Observable 進行轉換、過濾、合併等操作，這些操作符可以通過 `pipe` 方法來鏈接，並創建一個新的 Observable。若有多個操作符的話，可以用逗號`,`分隔。
- `map`： 用來轉換發射的值。
- `catchError`： 用來捕捉錯誤並進行處理，需要回傳一個新的 Observable。

> `pipe`  是組合操作符，需要放在 `subscribe` 之前，當 `subscribe` 被調用時，上面的所有操作符才會開始執行

```ts
// 在 pipe 中使用 map 操作符
observable$.pipe(
	map(value => value.toUpperCase()), // 將值轉換為大寫
	catchError(err => {
		console.error('Error occurred:', err); // 可以記錄錯誤
		return throwError(() => new Error('新的錯誤訊息')); 
	})
).subscribe({
   next: (value) => {console.log(value) }, // 轉換後的值
   error: (err) => {console.error(err) }, // 得到處理後的錯誤訊息
 });
```

`pipe` 可以無限鏈接操作符，並且會依照順序執行
- `tap`： 用來偵測每次發射的值，但不會改變值，也可以傳入觀察者物件，用 next、error、complete 方法來偵測不同的通知。
- `filter`： 用來過濾發射的值，只有符合條件的值才會被發射。
```ts
apiObservable$.pipe(
	tap(value => console.log('Received:', value)), // 偵測每次發射的值
).pipe(
	filter(value => value.active), // 過濾條件
).subscribe({
	 next: (value) => {console.log(value) }, // 過濾後的值
});
```

## 結論
今天介紹了 RxJS 的基本概念和用法，特別是 Observable 的建立和使用方式。明天會介紹如何在Ａngular 中使用非同步資料處理。
