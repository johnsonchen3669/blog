---
title: 模組 | Angular 新手練功日誌
description: "介紹 Angular Module 的用途、@NgModule 設定，以及模組化應用程式的組織方式。"
slug: modules
series: angular-training
order: 5
tags:
  - angular
  - angular-training
  - modules
  - ngmodule
pubDate: 2025-09-05
lastModDate: ''
ogImage: true
toc: true
share: false
giscus: true
search: true
---
今天要介紹傳統 Angular 建立應用程式的方式 - 模組（Module）。
## Angular Module
Angular 模組是過去 Angular 應用程式的基本組織，用於將相關的組件、指令、管道和服務等功能集合在一起。而基於模組的元件需要在模組中註冊，並且只能在該模組中使用。

![](https://i.meee.com.tw/c0GpfCz.png)

目前版本若要建立基於模組的元件，需要在 `@Component` 裝飾器中將 `standalone` 屬性設為 `false`。
```ts
@Component({
  ...
  standalone: false,  // 設定為基於模組的元件
})
```  
## 建立方式
一開始，我們先在 Angular 根元件附近建立一個根模組 Root Module，命名為 `app.module.ts`。
- 根模組是應用程式的入口點，負責引導和啟動應用程式。
- 根模組通常會包含應用程式的主要組件、路由設定和其他全域配置。

模組需要有兩個關鍵部分：
- `@NgModule` 裝飾器：用於定義模組的相關設定。
- 模組類別：通常僅包含模組的名稱，沒有其他邏輯。

### @NgModule
`@NgModule` 是定義了模組的相關設定。
- 它包含了模組的元件、指令、管道、服務等相關資訊，基本上所有的 Angular 相關功能都需要在模組中進行註冊和管理。

裝飾器中常用的屬性有：
- `declarations`：聲明模組中包含的元件、指令和管道，代表可以在這個模組中使用這些元件。
	- 引入的元件不能是獨立元件 (需加上 `standalone: false`)。
- `bootstrap`：指定應用程式的根元件時，需要加上這設定。
- `imports`：引入其他模組給當前模組內聲明的元件使用。可兼容獨立元件和基於模組的元件。
	- `BrowserModule`：每個 Angular 應用程式當使用 Angular Module 時都需要引入的模組，提供瀏覽器相關的功能。 ( 只在能在根模組中引入一次 )
	- `CommonModule`：給其他子模組使用的模組，提供常用的指令和管道。
	- 獨立元件：設定 `standalone: true` 的元件，可以和模組搭配使用。
- `exports`：將模組中的組件、指令和管道導出，以便其他模組可以使用。
	- 可做為中繼模組，將組件、指令和管道導出給最上層模組使用。
	  
> 如果沒有正確引入`BrowserModule` 或 `CommonModule`  ，Angular 應用會出現錯誤。
> - 在根模組中必須引入 `BrowserModule`，否則應用無法在瀏覽器中正確啟動
> - 在子模組中必須引入 `CommonModule`，否則子模組中的元件無法使用 Angular 提供的常用指令和管道。

**根模組範例**
- 根模組需要必須在 `bootstrap` 屬性中指定應用程式的根元件。
- 根模組通常會引入 `BrowserModule` 模組。
```ts
import { NgModule } from '@angular/core';
import { App } from './app';
import { HeaderComponent } from './header/header.component';
import { RouterOutlet } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  declarations: [App, HeaderComponent],
  imports: [BrowserModule, RouterOutlet],
  bootstrap: [App],
})

export class AppModule {}
```

**子模組範例**
- 子模組需要在根模組（或其他需要用到這些元件的模組）中引入，並且在 `imports` 屬性中註冊。
- 子模組導出子元件後，其他模組就可以使用這些元件。
- 子模組通常會引入 `CommonModule` 模組。
```ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskListComponent } from './task-list/task-list.component';
import { TaskItemComponent } from './task-item/task-item.component';

@NgModule({
  declarations: [TaskListComponent, TaskItemComponent],
  imports: [CommonModule],
  exports: [TaskListComponent, TaskItemComponent] // 導出子元件
})
export class TasksModule {}
```

建立模組後，需要在 `main.ts` 中啟動應用程式。
- 目前 Angular 20 使用模組的方式和之前版本略有不同，以下是兩種方式的比較：
```ts
import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app.module';

platformBrowser().bootstrapModule(AppModule)
```

- Angular 20  之前的版本
```ts
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule);
```
## 快速建立模組

```bash
ng generate module <module-name>
ng g m <module-name> // 簡寫
```

## 獨立元件和模組的比較

**獨立元件**
- 不需要依賴模組，可以直接使用。
- 需要在每個元件中使用 `imports` 屬性來引入所需的模組或其他元件。

**模組**
- 需要在模組中註冊元件，並且只能在該模組中使用。
- 不容易追蹤元件的依賴關係，因為需要查看模組的 `imports` 屬性來了解元件所依賴的模組和其他元件。

由於模組的複雜性且不易排查問題等原因，Angular 官方目前推薦使用獨立元件來建立應用程式，但舊專案仍然會使用模組的方式來組織元件，因此了解模組的使用方式仍然很重要。
## 專案實作
今天的目標是將昨日的獨立元件改為基於模組的元件。
- 可以另開專案或 git 分支來實作模組的使用方式
- 建立 `app.module.ts`
- 所有引入元件都需要改為基於模組的元件
- 改變 `main.ts` 的啟動方式

[day 5 分享](https://github.com/johnsonchen3669/angular-demo-todo/commit/a7347db812623a4ab99a8a462e092ff5109d3bb3)
## 結論
這篇文章介紹了 Angular 模組的基本概念和使用方式，讓大家了解如何使用模組。下一篇文章會介紹元件內部相關的使用方式
