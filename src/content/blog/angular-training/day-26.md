---
title: Routing （一） | Angular 新手練功日誌
description: "整理 Angular Routing 的基礎用法，包含路由設定、導航、動態路由與巢狀路由。"
slug: routing-basics
series: angular-training
order: 26
tags:
  - angular
  - angular-training
  - routing
  - router
pubDate: 2025-09-26
lastModDate: ''
ogImage: true
toc: true
share: false
giscus: true
search: true
---
Angular 預設是一個單頁應用程式（SPA），為了實現不同頁面內容的切換，提供了強大的路由功能。透過路由，使用者可以根據網址（URL）的變化，動態顯示不同的元件，就像在多個頁面之間切換一樣，但實際上不需要重新載入整個網頁。這就是 client-side routing 的特點。

## 建立路由
可以在 `app.routes.ts` 中透過建立 `Routes` 陣列來定義路由設定，每個路由物件包含以下主要的屬性
- `path`：路由的路徑，對應 URL 的一部分
- `component`：當路由匹配時要顯示的元件
```ts
export const routes: Routes = [
  {
	  path: '',
	  component: HomeComponent
  },
	{
		path: 'tasks',
		component: TasksComponent
	}
]
```
建立完路由後，需要在 `main.ts` 中使用 `provideRouter` 來註冊路由設定，這樣應用程式才能識別並處理路由。
```ts
bootstrapApplication(AppComponent, {
	providers: [provideRouter(routes)]
})
```

最後需要在應用程式的根元件模板中加入 `router-outlet`，來顯示根據路由設定所對應的元件內容。路由切換時，會在這個標籤內動態載入對應的元件。

> 需在元件中引入 RouterOutlet，才能在模板中使用 `<router-outlet>` 標籤。

```ts
import { RouterOutlet } from '@angular/router';
@Component({
	...
	imports: [RouterOutlet]
	...
})
```
```html
<router-outlet /> 
```

## 路由導航
使用 `router-link` 指令來建立導航連結，點擊後會改變 URL 並觸發路由切換。

> 需要引入 RouterLink 指令，才能在模板中使用 `routerLink` 屬性。

```ts
import { RouterLink } from '@angular/router';
@Component({
	...
	imports: [RouterLink]
	...
})
```
```html
<a routerLink="/tasks">任務列表</a>
```

使用 `..` 來導航到上一層父路由
> `queryParams`：用來設定查詢參數

```html
<!-- task-detail.component.html -->

<!-- 實際網址會變成 /users?ref=dashboard -->
<a [routerLink]="['..']" [queryParams]="{ ref: 'dashboard' }">返回使用者列表</a>
```

`routerLinkActive` 指令，用來為當前路由匹配的連結添加 CSS 類別，通常用於標示當前頁面。

> 需要引入 RouterLinkActive 指令，才能在模板中使用 `routerLinkActive` 屬性。

```ts
import { RouterLinkActive } from '@angular/router';
@Component({
	...
	imports: [RouterLinkActive]
	...
})
```
```html
<a routerLink="/tasks" routerLinkActive="active">任務列表</a>
```

需要在元件中使用程式導航時，可使用 `Router` 來直接導航到指定的路由。
- `navigate` ：`Router` 的方法，用來導航到指定的路由。
```ts
export class SomeComponent {
	private router = inject(Router);
	
	goToTasks() {
		this.router.navigate(['/tasks']);
	}
}
```
若是提交表格後，想要禁止使用者使用瀏覽器的返回按鈕回到前一頁，可以使用 `replaceUrl` 選項來取代當前的歷史紀錄條目。
```ts
this.router.navigate(['/'], { replaceUrl: true });
```

## 動態路由
可以在路由路徑中使用 `:parameterName` 來定義動態路由參數。

> `:` 後面的參數名稱，可以自訂，但要與取得參數時使用的名稱一致。

```ts
{
   path: 'tasks/:taskId', <domain>/tasks/1
   component: TaskDetailComponent
}
```
在使用動態路由時，繫結連結需要傳入參數值時，可以使用字串拼接或陣列語法。
```html
<a [routerLink]="'/tasks/' + task.id">{{ task.title }}</a>
<a [routerLink]="['/tasks', task.id]">{{ task.title }}</a>
```

而在元件中取得路由參數或查詢參數有兩種方式：
1. 使用 input 可以取得路由參數或查詢參數

> 需要在 provideRouter 時使用 `withComponentInputBinding`，來啟用 input 綁定路由參數的功能。

```ts
bootstrapApplication(AppComponent, {
	providers: [provideRouter(routes,withComponentInputBinding())]
})
```
```ts
export class TaskDetailComponent {
	taskId = input<string>(); // 取得路由參數 taskId
	query = input<string | null>(); // 取得查詢參數 query
	// 例如： /tasks/1?query=angular
}
```
2. 使用 `ActivatedRoute` 服務

 > paramMap：用來取得路由參數的 Observable 物件，可觀察路由參數的變化。 
 
```ts
export class TaskDetailComponent {
	private activatedRoute = inject(ActivatedRoute);
	
	this.activatedRoute.paramMap.subscribe({
		next: (params) => {
		  // 取得路由參數 taskId
			conole.log(params.get('taskId'));
			// 取得查詢參數 query
			console.log(params['query']);
		}
	});
}
```

## 巢狀路由
可以在路由設定中定義子路由，來建立巢狀的路由結構。
```ts
{
	path: 'user/:userId',
	component: UserComponent,
	children: [
		{
			path: 'tasks,
			component: TaskDetailComponent
		}
	]	
}
```
也需要在父元件的模板中加入 `<router-outlet>`，來顯示子路由對應的元件。
```html
<h2>任務列表</h2>
<router-outlet></router-outlet>
```
在巢狀路由中路徑是相對於父路由的，所以在內部中導航時，可不需要加上父元件的路徑。
```html
<!-- 不需要加上父元件的路徑 -->
<a [routerLink]="[task]">{{ task.title }}</a>
```

若需要巢狀路由繼承父路由的參數的話，可以在 provideRouter 時使用 `withRouterConfig` 來設定 `paramsInheritanceStrategy` 路由引數的繼承策略，這樣才可以使用 input 的方式來取得父路由的參數。
- `emptyOnly`：只有當路由本身具有空路徑時，才會繼承父路由的引數。
- `always`：無論路由本身是否具有空路徑，都會繼承父路由的引數。

```ts
bootstrapApplication(AppComponent, {
	providers: [provideRouter(routes,withComponentInputBinding(),withRouterConfig({
	  paramsInheritanceStrategy: 'always'
	}))]
})
```

## 結論
今天介紹了 Angular 路由的基本概念與使用方式，包含建立路由、導航、動態路由以及巢狀路由等。明天會繼續介紹進階的路由相關功能。




