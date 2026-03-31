---
title: HTTP Client | Angular 新手練功日誌
description: "介紹 Angular HttpClient 的設定方式、HTTP 請求、型別化回應與攔截器。"
slug: http-client
series: angular-training
order: 25
tags:
  - angular
  - angular-training
  - http-client
  - api
pubDate: 2025-09-25
lastModDate: ''
ogImage: true
toc: true
share: false
giscus: true
search: true
---
在處理動態資料時，經常需要與後端伺服器進行溝通，這通常透過 HTTP 請求來完成。今天要介紹如何在 Angular 中實現這一功能。

## HttpClient
`HttpClient` 是 Angular 提供的一個服務，用於發送 HTTP 請求並處理回應。它基於 RxJS，這意味著它的許多方法都會回傳 Observable ，所以就可以透過上一章接觸到的 RxJS 來處理非同步資料流，使用 subscribe 來訂閱，並根據回傳的結果來做相對應的處理。

### 注入 HttpClient
在元件中使用 HttpClient 之前，需要設定 provide ，才能在元件中注入，可以在元件中設定，但較常見的是在應用程式啟動時設定，就可以在所有元件中使用。
- `provideHttpClient` 用來設定 HttpClient 服務。

```ts
bootstrapApplication(AppComponent, {
	  providers: [ provideHttpClient() ]
})
```
設定完後，就可以在元件中注入 HttpClient 了。
```ts
// 在元件中注入 HttpClient
private httpClient = inject(HttpClient);
```

若要在使用模組時提供 HttpClient，則需要在根模組中加入 `provideHttpClient` 到 `providers` 陣列中
```ts
@NgModule({
  ...
  providers: [provideHttpClient()],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

### 發送 HTTP 請求
HttpClient 有提供多種方法來發送 HTTP 請求，像是常見的 GET、POST、PUT、DELETE 等。
```ts
this.httpClient.get('localhost:3000/tasks')
this.httpClient.post('localhost:3000/tasks', { name: 'New Task' })
```

由於 HttpClient 的方法會回傳 Observable ，可以使用 RxJS 來處理非同步資料流
```ts
this.httpClient.get('http://localhost:3000/tasks').subscribe({
	  next: (resData) => {
		  console.log(resData);
	  },
	  error: (err) => {
		  console.error(err);
		},
		complete: () => {
		  console.log('Completed');
		}
});
```

可搭配 destroyRef 來取消訂閱 Observable。

> `destroyRef` 用於管理元件的生命週期，在元件銷毀時自動清理資源

```ts
private destroyRef = inject(DestroyRef);

ngOnInit() {
 const subscription = this.httpClient ...
	 
 this.destroyRef.onDestroy(() => {
		this.subscription.unsubscribe();
	});
}
```

HttpClient 的方法也可以設定回傳的資料型別 
```ts
this.httpClient.get<{ tasks: Tasks[] }>('http://localhost:3000/tasks')
```

## HTTP 攔截器  HTTP Interceptors
攔截器是一種特殊的服務，可以攔截並修改 HTTP 請求和回應，做出一些額外的處理，例如：記錄請求資訊、錯誤處理等。
目前推薦使用函式方式來定義攔截器，這樣可以避免建立多餘的類別。

在 `provideHttpClient` 中使用 `withInterceptors` 來註冊攔截器，將設定好的攔截器函式傳入陣列中。
```ts
function loggingInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn){
  return next(request).pipe(
     tap({
			next: (event) => {
				if(event.type === HttpEventType.Response) {
					console.log('Response received:', event);
				}
			},
		})
  )
}

bootstrapApplication(AppComponent, {
	  providers: [
	    provideHttpClient({
	      withInterceptors([loggingInterceptor]
	    }),
	  ],
})
```

除了函式方式，也可以使用類別方式來定義攔截器，這種方式較少使用。
```ts
@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      tap({
        next: (event) => {
          if (event.type === HttpEventType.Response) {
            console.log('Response received:', event);
          }
        },
      })
    );
  }
}
```

用這種類別方式定義的攔截器，**註冊方式也不同**，要用 `withInterceptorsFromDi()` 啟用攔截器
並在 `providers` 陣列中加入自訂的攔截器 provider。
- `provide`： 設定為 `HTTP_INTERCEPTORS`，這是 Angular 提供的 token，用來標識 HTTP 攔截器。
- `useClass`：指定要使用的攔截器類別。
- `multi: true`：表示這個 provider 可以有多個攔截器。

> 如果你有多個類別 HTTP 攔截器，按順序加入 providers 陣列中即可。

```ts

  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()), // 讓 DI 攔截器生效
    { provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true }
  ]
```

## 結論
今天介紹了如何在 Angular 中使用 HttpClient 來發送 HTTP 請求，並處理回應資料。明天會介紹路由相關的內容。
