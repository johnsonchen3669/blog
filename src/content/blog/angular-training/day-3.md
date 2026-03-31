---
title: 專案架構 | Angular 新手練功日誌
description: "介紹 Angular 專案目錄結構、檔案命名慣例，以及 main.ts 的啟動入口。"
slug: project-structure
series: angular-training
order: 3
tags:
  - angular
  - angular-training
  - project-structure
  - bootstrap
pubDate: 2025-09-03
lastModDate: ''
ogImage: true
toc: true
share: false
giscus: true
search: true
---
上一篇文章了解如何建立的專案後，今天我們就來了解專案的架構
![專案架構](https://i.meee.com.tw/OE4BNJk.png)

- `tsconfig.app.json`、`tsconfig.json`、`tsconfig.spec.json`：這三個是 TypeScript 的相關設定檔，設定一些 TypeScript 編譯的選項，除非熟悉 TypeScript 設定，否則不建議更動。
- `package.json`、`package-lock.json`：這兩個是 npm 的相關設定檔，記錄專案所需的套件和版本資訊，當我們安裝新的套件時，會自動更新這些檔案。
- `angular.json`：這是 Angular CLI 的主要設定檔，跟 typeScript 設定檔一樣，通常不太需要更動，除非需要自訂一些建置選項。
- `.editorconfig`：這是用來統一團隊成員在編輯器中的格式設定，例如縮排、換行等。
- `.gitignore`：這是用來忽略不需要加入版本控制的檔案，例如 node_modules 資料夾。
- `src` ：這是我們主要開發的資料夾。
	- `app`：尤其是其中的 app 資料夾，幾乎所有的程式碼都會放在這個資料夾中。
	- `styles.css`：這是全域的樣式檔案，可以在這裡定義一些全域的 CSS 樣式。
	- `index.html`：這是應用程式的入口檔案，所有的元件都會被載入到這個檔案中。
	- `main.ts`：這是應用程式的主要 TypeScript 檔案，負責啟動 Angular 應用程式。
- `public`：這是用來放置靜態資源的資料夾，例如圖片等，在專案需要進行建置時，這些檔案會被直接複製到建置後的輸出資料夾中。

## 檔案命名
根據 Angular CLI 的版本，會有不同的命名慣例
- 在之前 Angular 版本中預設是以添加後綴的方式來命名檔案，例如：`app.component.ts`。
- 從 Angular 20 開始,預設情況下 Angular CLI 不會為元件、指令、服務和管道產生後綴。例如：`app.ts`。

由於 Angular 維持有後綴命名慣例已經有一段時間了，因此這系列的文章也會以這種方式來命名檔案。讓我們在 `angular.json` 中的 schematics 加上這段設定，這樣可以在使用 Angular CLI 快速生成檔案的相關指令 （如 `ng generate component`、`ng generate service` 等）時，會自動產生有後綴的檔案。

```json
{  
"projects": {  
	"<project-name>": {  
	...  
	"schematics": {  
		"@schematics/angular:component": { "type": "component" },  
		"@schematics/angular:directive": { "type": "directive" },  
		"@schematics/angular:service": { "type": "service" },  
		"@schematics/angular:guard": { "typeSeparator": "." },  
		"@schematics/angular:interceptor": { "typeSeparator": "." },  
		"@schematics/angular:module": { "typeSeparator": "." },  
		"@schematics/angular:pipe": { "typeSeparator": "." },  
		"@schematics/angular:resolver": { "typeSeparator": "." }  
	},  
...  
}
```

> schematics 的設定會影響你使用 Angular CLI ，產生檔案的預設選項。例如，你可以設定產生元件時是否自動建立測試檔、是否加上樣式檔案、預設使用哪種樣式（CSS、SCSS）等。

## 專案進入點
由於 Angular 預設採用 Single Page Application (SPA) 架構，所有 UI 的渲染都在瀏覽器端進行。因此，index.html 只包含一個 app-root 標籤，內容會由 Angular 框架在執行時動態產生與更新。

> SPA 單頁式應用程式
> - Single Page Application (SPA) 是一種網頁應用程式架構，允許使用者在單一網頁上進行多次互動，而不需要重新載入整個頁面。
> - 所有 UI 渲染都在客戶端進行，並且透過 AJAX 或 Fetch API 與後端伺服器進行資料交換。這樣的設計可以提供更流暢的使用者體驗，因為頁面不需要頻繁地重新載入。
> - 缺點是 SEO 支援較差，因為實際上的內容是由 JavaScript 動態生成的，搜尋引擎可能無法正確索引這些內容。

在 Angular 專案中，應用程式的進入點是 `main.ts` 檔案，負責啟動 Angular 應用程式。啟動時，Angular 會將根元件 App 動態載入到 index.html 中的 app-root 標籤內。

就像圖片看到的一樣，原始碼不會有任何內容，所有的內容都是由 Angular 動態產生的，TypeScript 原始碼會被編譯成 JavaScript，這些檔案會被載入到 index.html 中，然後由瀏覽器執行，動態產生 DOM 結構。
![原始碼](https://i.meee.com.tw/Cq7SgR0.png)
![實際網頁](https://i.meee.com.tw/z0Ni88i.png)

根據 Angular 版本不同，啟動方式略有差異，但核心概念一致。
目前 Angular 推薦的啟動方式：
```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
```
當然根據的版本不同，你可能會看到不同的寫法，例如傳統的模組化寫法：
```ts
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule);
```
 這兩種寫法主要是獨立元件的寫法以及和傳統的模組化寫法。這在接下來的文章中會有更詳細的介紹。

## 結論
這篇文章主要介紹了 Angular 專案的基本架構與應用程式進入點，讓大家對於 Angular 專案的結構有初步的了解。下一篇文章會先介紹 Angular 框架的最小單位 - 元件(Component)。
