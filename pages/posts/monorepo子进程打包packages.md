---
title: monorepo子进程打包packages
date: 2023-6-19
updated: 2023-6-19
categories: 前端小记
excerpt_type: html
tags:
  - vue
  -	monorepo
  - rollup
top: 1
---

### 如何并发build多个package

通常情况下一个项目下有一个 rollup.config.js 文件来做打包配置。在多包情况下也可以在根目录下配置一个 rollup.config.js文件，

在配置文件中动态的获取入口和输出目录。

<span class="text-red-600">如何动态获取？</span>

我们可以在构建的时候控制命令参数传给进程，使用 node 的进程 ``` process.env ``` 获取。

### 配置packages路径

```js
import path from 'node:path'
import { fileURLToPath } from 'url'


export const projRoot = path.resolve(fileURLToPath(import.meta.url), '../','../')
export const pkgRoot = path.resolve(projRoot, 'packages')

export const directivesRoot = path.resolve(pkgRoot, 'directives')
export const componentsRoot = path.resolve(pkgRoot, 'components')
export const hooksRoot = path.resolve(pkgRoot, 'hooks')
export const stylesRoot = path.resolve(pkgRoot, 'styles')
export const utilsRoot = path.resolve(pkgRoot, 'utils')
```

> 由于是 esmodule ,是无法识别 __dirname 的，可以使用 fileURLToPath方法转换模块路径为相对路径

<!-- more -->

### 配置 build 脚本

先配置需要打包的 package ,安装  [execa](https://www.npmjs.com/package/execa) ,使我们可以用来使用子进程。

```js
const build = async (target) => {
  if (existsSync(`${target}/dist`)) {
    rmSync(`${target}/dist`, { recursive: true })
  }
  await execa(
    'rollup',
    [
      '-c',
      '--configPlugin',
      'rollup-plugin-esbuild',
      '--environment',
      `TARGET:${target}`,
    ],
    {
      stdio: 'inherit',
    }
  )
}
```

> 若已有 dist 目录，先删除目录，在启动打包命令。若果使用 rollup.config.ts 编写的配置，可以使用 rollup-plugin-esbuild 编译运行配置文件。

### 控制并发

使用 promise 写一个控制并发的函数，提升性能。

```js
async function runParallel(maxConcurrency, source, iteratorFn) {
  const ret = []
  const executing = []
  for (const item of source) {
    const p = Promise.resolve().then(() => iteratorFn(item))
    ret.push(p)

    if (maxConcurrency <= source.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1))
      executing.push(e)
      if (executing.length >= maxConcurrency) {
        await Promise.race(executing)
      }
    }
  }
  return Promise.all(ret)
}
//并发执行打包命令
runParallel(cpus().length,targets,build)
```

### 配置 rollup.config.ts 文件

```js
import { resolve } from 'path'
import { RollupOptions, defineConfig } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
const target = process.env.TARGET

const pkgsDir = resolve('./packages')
const targetDir = resolve(pkgsDir, target)
export default defineConfig([
  {
    input: resolve('.', `${targetDir}/index.ts`),
    plugins: [esbuild()],
    output: [
      {
        file: `${targetDir}/dist/es/index.mjs`,
        format: 'es',
      },
      {
        file: `${targetDir}/dist/lib/index.cjs`,
        format: 'cjs',
      },
    ],
  },
])

```

最后在 pakckage.json 配置执行脚本即可打包。