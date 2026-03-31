---
title: Day 27 - Routing （二）
description: "接續介紹 Angular 路由的進階功能，包含 redirect、resolve、route guards 與 lazy loading。"
slug: routing-advanced
series: angular-training
order: 27
tags:
  - angular
  - angular-training
  - routing
  - route-guard
  - lazy-loading
pubDate: 2025-09-27
lastModDate: ''
ogImage: true
toc: true
share: false
giscus: true
search: true
---
今天會介紹一些昨天沒提到的路由功能，像是路由設定屬性、路由守衛以及延遲加載路由等功能
## 路由設定屬性

`**`： 通配符路由，用來匹配所有未定義的路由，通常用於顯示 404 頁面。
```ts
{
	path: '**',
	component: NotFoundComponent
}
```

`redirectTo`：用來將某個路由重定向到另一個路由。

 `pathMatch`：用來指定路徑匹配的策略
- `full`：表示路徑必須完全匹配，才會觸發重定向。
- `prefix`：表示只要路徑是以指定的字串開頭，就會觸發重定向。

```ts
export const routes: Routes = [
  // 當網址完全為空時，才重定向到 /home
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // 當網址開頭為 old，重定向到 /new
  { path: 'old', redirectTo: 'new', pathMatch: 'prefix' },

  // 其他路由
  { path: 'home', component: HomeComponent },
  { path: 'new', component: NewComponent },
];
```

路由也可以夾帶 `data` 屬性，來傳遞靜態資料給元件。
```ts
{
	path: 'tasks/:taskId',
	component: TaskDetailComponent,
	data: { message: '這是任務詳情頁面' }
}
```
```ts
message = input<string>(); // 取得路由的靜態資料 title
```

`ressolve`：用來在路由切換前預先取得資料，確保元件在載入時已經有需要的資料。

`ResolveFn` 是提供用來定義路由 Resolver 的型別。它讓你可以在進入路由前，先取得或處理資料，並將結果注入到對應的元件。
- `ActivatedRouteSnapshot` ：代表即將被啟用的路由，用來取得該層路由的路由參數、查詢參數、靜態資料等。
- `RouterStateSnapshot`：可以取得目前整體的路由狀態，包括所有巢狀路由的資訊

```ts
export const resolveTaskName: ResolveFn<string> = (activateRouteSnapshot: ActivatedRouteSnapshot, routerState: RouterStateSnapshot
) => {
	const taskId = activateRouteSnapshot.paramMap.get('taskId');
	return `任務 ${taskId}`;
};
```
```ts
{
	path: 'tasks/:taskId',
	component: TaskDetailComponent,
	resolve: { resolveTitle: resolveTaskName }
}
```
```ts
resolveTitle = input<string>(); // 取得路由解析後的資料 resolveTitle
```

`title` :可以更換頁面標題
- 除了靜態設定外，也可以動態更改，可以傳入自定義的ResolveFn，
```ts
{
	path: 'tasks',
	component: TaskListComponent,
	title: '任務列表'
	// title: resolveTaskListTitle
}
```
## ActivatedRoute
用來取得當前路由的資訊，例如路由參數、查詢參數等。
 - snapshot：用來同步取得當前路由的資訊，缺點是無法即時反映路由變化。適合在元件初始化時使用且不需要監聽路由變化的情境。
```ts
this.activatedRoute.snapshot.paramMap.get('taskId');
```

透過 ActivatedRoute 也可以在元件內訂閱 data 屬性來取得靜態資料或解析後的資料，這樣可以即時根據路由變化更新資料。
```ts
ngOnInit() {
	 this.activatedRoute.data.subscribe({
		 next: (data) => {
			 console.log(data['title']); // 取得路由的靜態資料 title
			 console.log(data['resolveTitle']); // 取得路由解析後的資料 resolveTitle
		 }
	 });
}
```

## Roate Guard
路由守衛用來控制路由的存取權限，確保只有符合條件的使用者才能進入特定的路由。
- `canActivate`：進入路由前，判斷是否允許進入某個路由。常用於登入驗證或權限檢查
- `canActivateChild`：進入子路由前，判斷是否允許進入某個路由的子路由。通常用於有巢狀子路由時，統一檢查權限
- `canDeactivate`：離開路由前，判斷是否允許離開當前路由。常用於表單未儲存時提醒使用者。
- `canMatch`判斷路由是否符合條件，決定是否要套用該路由。可用於動態路由選擇，比 canActivate 更早執行。


使用 `CanMatchFn` 來實作 `canMatch` 守衛
- `route`：當前路由的資訊
- `segments`：目前 URL 被分割後的片段陣列

> 可透過 `RedirectCommand(...)` 建立一個重導指令，用於導航到指定的 URL。

```ts
export canMatchGuard: CanMatchFn = (route, segments) => {
  const router  = inject(Router);
	const isLoggedIn = checkUserLoginStatus(); // 假設有一個函式可以檢查使用者是否登入
	if (!isLoggedIn) {
		// 若未登入，導向登入頁面
		return new RedirectCommand(router.parseUrl('/login'));
	}
	return isLoggedIn; // 若已登入，允許匹配路由
};
```
```ts
{
	path: 'protected',
	component: ProtectedComponent,
	canMatch: [canMatchGuard]
}
```

預設情況下，只有路由參數才會觸發路由守衛和解析器重新執行，若需要在查詢參數或片段變化時也重新執行，可以使用 `runGuardsAndResolvers` 選項來設定。

`runGuardsAndResolvers`：用來指定在什麼情況下重新執行路由守衛和解析器
- `paramsChange`：只有路由參數變動時才會重新執行（預設）。
- `pathParamsChange`：只有路徑參數變動時才會重新執行。
- `pathParamsOrQueryParamsChange`：當路由參數或查詢參數改變時重新執行

```ts
{
  path: 'user/:id',
  component: UserComponent,
  canActivate: [UserGuard],
  resolve: { user: UserResolver },
  runGuardsAndResolvers: 'pathParamsOrQueryParamsChange'
}
// 當 `/user/123?tab=info` 變成 `/user/123?tab=profile` 時，守衛和解析器會重新執行。
// 當 `/user/123` 變成 `/user/456` 時，也會重新執行。
```
## lazy loading route
讓初始化應用程式時，不會立即載入所有的元件，而是等到使用者導航到相關路由時，才會動態載入對應的元件。會有助於減少初始載入時間，更好用戶體驗。

`loadComponent`：將原本的 component 屬性替換成 loadComponent 屬性，並提供一個函式來動態載入元件。
```ts
// 使用 import 動態載入所需的元件或模組，並回傳一個 Promise。透過 then 方法取得並回傳對應的元件或模組。
export const routes: Routes = [
  {
    path: 'about',
    loadComponent: () => import('./about/about.component').then(m => m.AboutComponent)
  }
];
```
`loadChildren`：將原本的 children 屬性替換成 loadChildren 屬性，並提供一個函式來動態載入原本的子路由。
```ts
export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes)
  }
];
```

若需讓 Service 僅在特定路由 lazy loading 時載入，可直接在該路由的 providers屬性中提供該服務，讓服務的作用域限定於該路由及其子路由。此時不需在 Service 上設定 `@Injectable({ providedIn: 'root' })`。
```ts
export const routes: Routes = [

  {
    path: 'feature',
    loadChildren: () => import('./feature/feature.module').then(m => m.FeatureModule),
    providers: [FeatureService] // 只在此路由作用域提供
  }

];
```

## 結論
今天介紹了路由設定屬性、路由守衛以及延遲加載路由等功能。
