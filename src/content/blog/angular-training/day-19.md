---
title: 元件生命週期 | Angular 新手練功日誌
description: "介紹 Angular 元件從建立到銷毀的生命週期，包含常見 hooks 與渲染、清理時機。"
slug: component-lifecycle
series: angular-training
order: 19
tags:
  - angular
  - angular-training
  - lifecycle
  - effects
pubDate: 2025-09-19
lastModDate: ''
ogImage: true
toc: true
share: false
giscus: true
search: true
---
今天會介紹元件的生命週期，從建立到銷毀之間發生的一系列步驟。每個步驟代表 Angular 渲染元件並隨時間檢查元件更新過程的不同部分。

若需要在特定時間點執行邏輯，元件可以繼承多個介面來實現不同的生命週期鉤子 (lifecycle hooks)，會強制元件實現這些介面的方法，提醒開發者在適當的時間點執行特定的邏輯。
- 可以多個介面一起使用，例如 `implements OnInit, OnDestroy`
- 每個介面的名稱都與對應的方法相同，但不帶 `ng` 前綴。

接下來會依照元件生命週期的順序來介紹各個階段：
## 創建 Creation  

`constructor`：JavaScript Class 的建構函式，當 Angular 創建元件時調用，這是初始化元件的地方。
- 不適用在複雜的元件初始化工作，因為在這個階段，Angular 還沒有完全設置好元件的輸入屬性。
```ts
export class MyComponent {
	data = input.required<string>();

	constructor() {
		// 不適合在這裡進行複雜的初始化，可能會取不到想要取得的值
		console.log('Constructor called, data is not yet initialized:', this.data);
	}
}
```
## 改變偵測 Change Detection 

`ngInit`：在元件初始化完成後調用，適合進行一次性的初始化操作。
- 元件接收到的輸入，可以在這裡進行處理。
- `implements OnInit`：實現 `OnInit` 介面，確保元件在初始化時調用 `ngOnInit` 方法。
```ts
export class MyComponent implements OnInit {
	data = input.required<string>();

	ngOnInit() {
		// 初始化邏輯
		console.log('Component initialized with data:', this.data);
	}
}
```

`ngOnChanges`：當元件的輸入屬性 (input) 發生變化時調用。
- `implements OnChanges`：實現 `OnChanges` 介面，確保元件在輸入屬性變化時調用 `ngOnChanges` 方法。

```ts
export class MyComponent implements OnChanges {
	data = input.required<string>();

	ngOnChanges(changes: SimpleChanges) {　// SimpleChange：傳遞給 `ngOnChanges` 的類型。
		if (changes['data']) {
			const prev = changes['data'].previousValue;
			const curr = changes['data'].currentValue;
			console.log(`Data changed from ${prev} to ${curr}`);
		}
	}
}
```

`ngDoCheck`：當 Angular 檢測到變化時調用，。
- 除非必要，不建議調用，因為會在每次變化檢測時調用。

`ngAfterContentInit`：當元件的內容初始化完成後調用，只會調用一次。
- 可以用來獲取投影 `ng-content` 的內容，並在初始化後進行處理。
```ts
export class MyComponent implements AfterContentInit {
	@ContentChild('projectedContent') projectedContent!: ElementRef;

	ngAfterContentInit() {
		// 可以操作投影進來的內容
		console.log('Projected content:', this.projectedContent.nativeElement.textContent);
	}
}
```

`ngAfterContentChecked`：當元件的內容檢測完成後調用，適合處理內容變化。
- 除非必要，不建議調用，運行頻率非常高，可能會嚴重影響頁面效能。


`ngAfterViewInit`：當元件的畫面初始化完成後調用，只會調用一次。
- 可以獲取到模板參考變數的 DOM 元素或元件實例。
```ts
export class MyComponent implements AfterViewInit {
	@ViewChild('myDiv') myDiv!: ElementRef;

	ngAfterViewInit() {
		// 可以操作畫面中的 DOM 元素
		console.log('View initialized, myDiv:', this.myDiv.nativeElement);
	}
}
```

`ngAfterViewChecked`：當元件的畫面檢測完成後調用。
- 除非必要，不建議調用，運行頻率非常高，可能會嚴重影響頁面效能。
## 渲染 Rendering
和其他生命週期鉤子不同。它們不是類別方法，而是接受回調函式的獨立函式。通常是在元件的建構子中使用，這兩個函式更貼近「渲染完成」的時機，適合處理 DOM 相關的即時操作。

`afterNextRender`
- 適合處理下一次渲染相關的操作。例如：新增待辦事項後自動聚焦輸入框。


`afterEveryRender`
- 適合處理每次渲染相關的操作。
	
```ts
contructor() {
	afterNextRender(() => {
		console.log('Next render completed');
	});
	afterEveryRender(() => {
		console.log('Render completed');
	});
}
```
## 毀滅 Destruction  
`ngOnDestroy`：當元件被銷毀時調用，適合清理資源或取消訂閱。
```ts
export class TodoListComponent implements OnDestroy {
  tasks = input<ITodoItem[]>();

  ngOnDestroy(): void {
    // 在這裡清理資源或取消訂閱
    // 例如：this.subscription.unsubscribe();
  }
}
```

`DestroyRef`
- 在 Angular 16 中引入，提供了一種更簡潔的方式來管理元件的銷毀。
- 不需再實作 `OnDestroy` 介面，直接用  `DestroyRef` 的 `onDestroy` 方法註冊清理邏輯即可
- 可使用來取消訂閱或清理資源。

```ts
export class TodoListComponent {
  tasks = input<ITodoItem[]>();

  // 注入 DestroyRef
  private destroyRef = inject(DestroyRef);
  private timerSub: Subscription;

  constructor() {
    // 範例：訂閱一個 interval
    this.timerSub = interval(1000).subscribe(val => {
      // ...執行某些操作
    });

    // 使用 DestroyRef 註冊清理邏輯
    this.destroyRef.onDestroy(() => {
      this.timerSub.unsubscribe();
      // 其他清理邏輯
    });
  }
}
```

## 額外補充：Signal 與 Effect
`effect`
- 在 Angular 16 中引入的響應式 API，屬於 Angular Signals API 的一部分。
- 可以用來監聽元件的狀態變化，並在 signal 變化時執行特定操作。

> 若沒有讀取 signal，effect 只會在建立時執行一次，不會自動重新執行。

```ts
export class TodoListComponent {
  tasks = input<ITodoItem[]>();

  constructor() {
    effect(() => {
      // 當 tasks 變化時自動執行
      console.log('tasks changed:', this.tasks());
    });
  }
}
```


有時可能需要在 effect 函式再次執行前做一些清理工作，例如：清除某個計時器等。
- 提供了 `onCleanup` 鉤子，可以在 effect 函式裡執行它，來定義每次 effect 重新執行前要做的事情

```ts
export class TodoListComponent {
  tasks = input<ITodoItem[]>();

  constructor() {
    effect(() => {
      const timer = setInterval(() => {
        console.log('計時器觸發');
      }, 1000);

      // 當 effect 重新執行或元件銷毀時，自動清除計時器
      onCleanup(() => {
        clearInterval(timer);
        console.log('計時器已清除');
      });
    });
  }
}
```
## 結論
今天介紹了 Angular 元件的生命週期的一些基礎用法，明天會介紹指令的相關用法。
