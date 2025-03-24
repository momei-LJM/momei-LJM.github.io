---
title: pnpm&monorepo
date: 2025-3-23
updated: 2025-3-23
categories: 前端小记
excerpt_type: html
tags:
  -	光神笔记
top: 1
---

### 大纲

<img style="width:150px" src="https://images.seeklogo.com/logo-png/43/1/pnpm-logo-png_seeklogo-430956.png">

- pnpm 特点（幽灵依赖，磁盘复用，软硬链接）
- workspace
- changeset
- monorepo 打包
- catalog
- 常用命令

<!-- more -->


### pnpm 特点

pnpm 解决的问题：

#### 幽灵依赖

为了实现依赖包的复用，现代包管理器比如`npm`或者`yarn` 会将依赖扁平化到`node_modules`目录下,这样实现了依赖复用，即相同的包只安装一次；但同时也引入了新的问题：项目可以使用本项目依赖以外的其他依赖，俗称幽灵依赖。
问题：如果某天依赖不在使用，项目就会报错。
解决：pnpm 将项目依赖提升至外层node_modules，其余依赖在具体项目中使用软链接 指向.pnpm 中的依赖

#### 磁盘复用

`npm`只能每次install都会重复下载，浪费了磁盘；
`pnpm`有一个全局store，存储所有的用户依赖；项目中通过硬链接访问store中的依赖，不会重复下载。

#### 软硬链接

软链接，类似快捷方式，是一个可读的文件，内容指向源文件
硬链接，直接链接源文件；
使用起来没什么区别

### workspace

<span class="text-red">先抛问题：monorepo解决什么问题？</span>

-  <span class="text-amber">如果一个单体项目，同时联调多个 package ,每次都 link 吗？</span>
-  <span class="text-amber">如果多个单体项目，linter，format, tsconfig，build都是一样的，每次都cv安装吗？</span>
-  <span class="text-amber">如果构建流对依赖是有顺序要求的，手动维护吗？</span>


一般在使用`monorepo`的时候，会使用 `workspace`功能；

```
packages/
|-package1
|-package2
```

```yaml
# pnpm-workspace.yaml
packages:
  - "packages/*"
```

1. 调试：`pnpm --filter package2 i package1 --workspace`;直接安装工作空间的依赖
2. 把通用依赖安装到根目录：`pnpm i xxx -w`;

> `-w --workspace-root` 指安装到根目录, `--workspace` 指从工作空间安装

> 通用依赖指的是不参与发包的依赖，才可以 `-w`，参与发包的任然需要安装到具体项目

3. 构建：可以编写统一脚本，如：``pnpm -C packagea run build&& pnpm -C packageb run build`;

### [changeset](https://github.com/changesets/changesets/blob/main/docs/command-line-options.md)
changeset 是一个用于管理 monorepo 中的版本控制工具，它允许你为每个包单独管理版本，并生成一个 CHANGELOG.md 文件，用于记录每个包的更新内容。

```shell
pnpm add -DW @changesets/cli
```

1. 初始化：`npx changeset init`;
2. 添加包：`npx changeset add`;会让选择包含的包生成 `changelog`
3. 更新版本：`npx changeset version`;会让选择包更新版本 `major` `minor` `patch`
4. 发布：`npx changeset publish`;

### catalog

catalog 可以统一项目依赖版本号

```ymal
# pnpm-workspace.yaml
packages:
  - "packages/*"
catalog:
  react: ^16.14.0

```

```json
 "devDependencies": {
    "react": "catalog:"
  },
```

发布后会使用catalog的具体版本号

### 常用命令

1. `pnpm i -w` 安装到根目录;
2. `pnpm i --filter package1` 安装到工作空间中指定的包;
3. `pnpm -C run xxx` 指定 到具体包执行 npm scripts ;
4. `pnpm --filter exec npx xxx` 指定到具体包执行 命令 ;
5. `pnpm -r exec xxx` 递归每一个目录执行命令 ;
6. `changeset init` 初始化 changeset;
7. `changeset add` 添加包;
8. `changeset version` 更新版本;
9. `changeset publish` 发布;
