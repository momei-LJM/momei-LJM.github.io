---
title: vue组件库搭建
date: 2023-5-21
updated: 2023-5-21
categories: 前端小记
excerpt_type: html
tags:
  - demo
  - 组件库
  - monorepo
top: 1
---





### 环境搭建

1. 安装 pnpm  ，使用 pnpm 包管理器管理项目
2. 使用 vite 作为开发服务器和打包工具
3. 安装 sass 预处理器，安装 vue 
### monorepo

1. 新建一个 pacakages 文件夹，里面存放多个项目仓库

2. 新建一个 pnpm-work-space.yaml 文件,指定 [workspace](https://pnpm.io/zh/workspaces), pnpm 如果安装本地包在工作空间中存在，那么会直接链接包。不存在声明范围内的包， pnpm 会拒绝解析安装。

   packages下面的在 package.json 中指定 name 包名，通过 -w 安装，例如： pnpm i @momei-ui/components -w 

   ```yaml
   packages:
     - packages/*
     - play
   ```
<!-- more -->
### 目录结构

如下：<img src="/contents/postAssets/dir.png" width="60%" >

​	packages:项目包

​	play:开发调试项目，在play里面新建一个 vite.config.ts ，play的 vite 就作为调试页面的开发服务器。我们在根目录的 packages.json 中添加脚本： "dev": "pnpm -C play dev", 启动的就是play下面的 dev 脚本，启动 vite 服务器。

### 分层思路



1.  packages/@momeiui/components ：是编写的组件 SFC 和 ts 代码，每一个组件都有一个导出的入口文件: index.ts ,导出单文件组件和 widthInstall (按需引入 vue.use() 使用)。

2.  pacakages/momei-ui :在 momei-ui 中的入口文件，引入所有组件，默认导出一个插件，遍历所有组件注册，这样项目中引入时，使用 use() 方法注册后，就全局注册了所有组件。

3.  pacakages/@momei-ui/styles :存放所有组件的样式表和通用样式变量、方法等，有一个入口文件 index.scss 导入所有样式。这样我们在项目的入口文引入所有样式，也可引入单独组件样式表。

4.  pacakages/@momei-ui/utils :存放一些函数方法。

   > 这写包都可以在根目录安装， pnpm 在 workspace 找到后，会作为一个包链接到 node_modules 下，这样子项目就可以直接使用了，也可以相互引用。

5.  play :作为调试项目，和普通的 vue 项目一样，只需要一个入口 main.ts 和 app.vue ，在入口全局注册 pacakages/momei-ui 所有组件，启动 vite 服务器，就可以调试了！

### buid配置

```typescript
// vite.config.js
import { resolve } from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: ["./packages/momei-ui/main.ts"],
      name: "momeiLib",
      // the proper extensions will be added
      fileName: "momei-lib",
      formats: ["es", "umd", "iife"],
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ["vue"],
      plugins: [],
      output: [
        {
          //打包格式
          format: "es",
          //打包后文件名
          entryFileNames: "[name].mjs",
          //让打包目录和我们目录对应
          preserveModules: true,
          exports: "named",
          //配置打包根目录
          dir: "./dist/es",
        },
        {
          //打包格式
          format: "cjs",
          //打包后文件名
          entryFileNames: "[name].cjs",
          //让打包目录和我们目录对应
          preserveModules: true,
          exports: "named",
          //配置打包根目录
          dir: "./dist/lib",
        },
      ],
    },
  },
});

```

