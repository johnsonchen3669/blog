---
title: Day 18 - Service
description: "說明 Angular Service 的用途、註冊方式，以及 constructor 與 inject 的注入寫法。"
slug: services
series: angular-training
order: 18
tags:
  - angular
  - angular-training
  - service
  - dependency-injection
pubDate: 2025-09-18
lastModDate: ''
ogImage: true
toc: true
share: false
giscus: true
search: true
---
在前面篇章中，有介紹 input/output 與父子元件溝通的方式，但在實際應用中，會遇到需要多個元件共享資料或邏輯的情況，而一但需要跨越兩個元件以上，input/output 的方式就會變得複雜且難以維護，這時候就需要使用 Service 來解決這個問題。
## Service
在 Angular 中，Service是一個用於封裝業務邏輯、數據存取的類別，提供服務給一個或多個組件使用。

### 快速建立 Service
透過 Angular CLI，可以快速建立 Service，指令如下：
```bash
ng g service <service-name> 
ng g s <service-name>
```

Service 需要標記為可注入，表示這個類別可以被注入到其他類別中使用，否則在其他元件會無法被注入。
- 內部可以包含方法、屬性等，來提供所需的功能。
```ts
@Injectable({ providedIn: 'root' })
export class TasksService {	
	private tasks: Task[] = [];

	getTasks(): Task[] {
		return this.tasks;
	}
}
```

### 標記服務
Angular 標記服務為可注入的三種方式
1. @Injectable() 裝飾器
2. bootstrapApplication 中的 providers
3. 元件的 providers 屬性

**@Injectable() 裝飾器**
- 通常搭配 `providedIn` 屬性（如 `providedIn: 'root'`），表示在整個應用程式中都提供。
- 建議用於大多數情境，簡潔且易於維護。
```ts
@Injectable({ providedIn: 'root' })
export class TasksService { ... }
```

另外兩種方式較少使用，僅在特定情境下，適合想要控制服務的作用範圍時。

**bootstrapApplication 中的 providers**
- 於應用啟動時直接註冊服務，適合全域服務。
```ts
bootstrapApplication(AppComponent, {
	providers: [TasksService]
});
```

**元件的 providers 屬性**
- 在元件層級註冊服務，該服務只在此元件及其子元件中有效。
- 每個元件有獨立狀態，適合需要區域性服務的情境。
```ts
@Component({
	selector: 'app-task',
	providers: [TasksService],
	...
})
```

## 使用方式

而目前在元件內注入 Service 有兩種方式：
1. 在元件的建構函式中注入
2. 使用 `inject` 函式注入 (Angular 14+)

### constructor
使用類別的建構函式來注入 Service，是過往最常見的方式。

在建構函式的參數中指定所需的服務類型，當 Angular 建立這個元件時會把可用的服務實例傳入建構子，這是 Angular 的依賴注入機制在運作。

```ts
// 參數前沒有加修飾子，Angular 不會自動把它當成類別的屬性；也就是說，必須在 constructor 裡手動指派才能在其他方法中使用。
export class TaskComponent {
    private tasksService: TasksService;
    constructor(tasksService: TasksService) { 
            this.tasksService = tasksService;
        }
    }
}
```
在建構函式的參數中，加入 `private` 或 `public` 等修飾子，會自動把這個參數當成類別的屬性，這樣就可以在類別的其他方法中使用這個服務。
```ts
// 傳統較常見的寫法
export class TaskComponent {
	constructor(private tasksService: TasksService) { }
}
```
### inject
`inject` 是 Angular 14 引入的一個新函式，可以在類別內直接使用，更加直觀，能夠一眼看出這個類別依賴了哪些服務。
```ts
export class TaskComponent {
	private tasksService = inject(TasksService);
}
```

## 專案製作
今日目標：以 Service 來管理待辦事項
- 建立 TasksService，將前面章節中建立的待辦事項邏輯移到 Service 中
- 完成基礎的待辦事項功能

[day 18 分享](https://github.com/johnsonchen3669/angular-demo-todo/commit/dfab0beedbc52363c7f3469f60ff99fdb73e2aa9)
[AngularDemoTodo](https://johnsonchen3669.github.io/angular-demo-todo/)
## 結論
透過 Service，可以讓多個元件共享邏輯與資料，減少重複程式碼，明天會介紹元件的生命週期。
