---
title: Day 2 - 環境安裝
description: "整理 Angular 20 開發所需環境、Angular CLI 安裝步驟與新專案建立流程。"
slug: environment-setup
series: angular-training
order: 2
tags:
  - angular
  - angular-training
  - setup
  - angular-cli
pubDate: 2025-09-02
lastModDate: ''
ogImage: true
toc: true
share: false
giscus: true
search: true
---
這系列的文章會主要以 Angular 20 為主，這邊附上推薦的安裝環境給大家參考。

## 必須條件
- **Node.js** - [v20.19.0 或更新版本](https://angular.dev/reference/versions)
- **文字編輯器** - 建議使用 [Visual Studio Code](https://code.visualstudio.com/)

若還沒有安裝環境，可以至 [Node.js](https://nodejs.org/en/) 官網下載 LTS 版本並安裝。
有管理 Node.js 版本的需求的話，也可以直接利用 nvm 或 fnm 來管理，網路上有許多相關的教學文章，這邊就不多做介紹。

安裝完成後可以在終端機中輸入以下指令來確認是否安裝成功
```bash
node --version
```
## Angular CLI

[Angular CLI](https://angular.dev/tools/cli) 是 Angular 官方提供的命令列工具，可以幫助我們快速建立和管理 Angular 專案。
可以透過 npm 來安裝 Angular CLI，請在終端機中輸入以下指令：
```bash
npm install -g @angular/cli
```

安裝完成後，可以輸入以下指令來確認是否安裝成功：
```bash
ng version
```

可以透過以下指令來查看所有可用的指令：
```bash
ng help
```

Angular CLI 有許多好用的指令，而在接下來的文章中，也會提到一些常用的指令給大家參考。

### 建立新專案
接下來使用以下指令來建立一個新的 Angular 專案，請將 `<project-name>` 替換成你想要的專案名稱：
```bash
ng new <project-name>
ng n <project-name>	// 簡寫
```

第一次安裝，我們先使用最基礎的設定，熟悉後大家可以依照個人需求來調整其他設定
```text
不啟用 zoneless（維持預設 zone.js）。
選擇 CSS：最常用、最簡單的樣式。
不啟用 SSR/SSG：只建立純前端 SPA。
```
![](https://i.meee.com.tw/6JXdN80.png)

進入專案資料夾中，安裝所需套件後，並執行測試，使用 `npm run start` 會使用 `ng serve` 指令來啟動開發本地伺服器，預設會在 `http://localhost:4200/` 
```bash
cd <project-name>
npm run start
```

## 推薦安裝套件
- [Angular Language Service - Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=Angular.ng-template)
	- 提供 Angular 模板語法的語法高亮、錯誤檢查和自動完成。
	- 支援 TypeScript 和 HTML 的智能提示。
	- 提供組件、指令和管道的快速導航。
- [Angular Essentials (Version 18) - Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=johnpapa.angular-essentials)
	- 提供 Angular 開發所需的常用插件集合
- [Angular DevTools - Chrome 線上應用程式商店](https://chromewebstore.google.com/detail/angular-devtools/ienfalfjdbdpebioblfackkekamfmbnh?pli=1)
	- 提供 Angular 應用程式偵錯和分析功能。
	- 支援檢查元件樹、變更檢測和路由狀態
	- [DevTools • Overview • Angular](https://angular.dev/tools/devtools)
- [Angular state inspector - Chrome 線上應用程式商店](https://chromewebstore.google.com/detail/angular-state-inspector/nelkodgfpddgpdbcjinaaalphkfffbem)
	- 提供 Angular 應用程式的狀態檢查工具。
	- 支援檢查元件狀態、輸入和輸出

## 結論

今天整理了 Angular CLI 相關的安裝流程及推薦安裝的插件，並且成功建立一個新的專案。接下來下一篇會來介紹建立的檔案結構。
