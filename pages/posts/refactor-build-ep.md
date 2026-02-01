---
title: tsdown 重构组件库打包
date: 2026-2-1
updated: 2026-2-1
categories: 前端小记
excerpt_type: html
tags:
top: 1
---

### 背景

对公司组件库进行迭代优化，构建升级是其中重要的一环。原来的构建工具是基于 `rollup` 以及相关插件实现构建。但在前端工具链快速发展的今天，仍有优化空间。

现有问题

- **构建速度较慢**: 在 `macOS` 上构建需要一分钟左右，在 CI 环境下需要更长时间
- **构建配置复杂**: 由于 `rollup` 高度的插件化，对比如：模块解析、`cjs` 转换、`esbuild` 提速等都需要单独安装插件，不够简化。
- **面向未来**: `vite` 生态发展迅速，且 `rolldown` 作为即将到来的高性能底层打包引擎，未来可期，我们也希望统一成 `rolldown` 的生态工具。

为此，我选择了 `tsdown` 作为新的构建工具，进行重构。

<!-- more -->

### 选择 tsdown 的原因

[tsdown](https://tsdown.dev/zh-cn/) 是一个基于 `rolldown` 的库打包工具：

- **高性能**: 由于基于 `rolldown`，高性能
- **开箱即用**: 简化配置，内置对 `vue`、`react` 等框架的支持
- **面向库**: 支持生成 `dts`，支持多种输出格式

### 组件库的构建设计

- **fullBundle**: 将整个库打包到一个 js 文件中，需要支持 `umd` 和 `esm` 格式；为浏览器直接引入准备
- **模块构建**: 分别构建 `cjs` 和 `esm` 模块，不打包外部依赖，供现代打包工具使用，作为 `npm` 包安装
- **类型声明**: 生成 `d.ts` 类型声明文件（包括 `ts`, `vue`），提升开发体验
- **css 处理**: 需要单独构建 `css` 文件，和 `js` 组件分离；同时需要支持作为 `sideEffect` 引入 (按需引入的必要手段)
- **国际化语言构建**：组件库支持多语言，需要对语言文件进行构建

### 对比 tsdown 和 rollup 的插件配置

`rollup`:

```ts
const plugins: Plugin[] = [
  ElementPlusAlias(),
  DefineOptions(), // defineOptions 宏构建支持
  vue({
    isProduction: true,
  }),
  vueJsx(),
  nodeResolve({
    extensions: ['.mjs', '.js', '.json', '.ts'],
  }), // node 模块解析插件
  commonjs(), // cjs 模块转换插件
  esbuild({
    exclude: [],
    sourceMap: minify,
    target,
    loaders: {
      '.vue': 'ts',
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
    treeShaking: true,
    legalComments: 'eof',
  }), // esbuild 提速插件
]
if (minify) {
  plugins.push(minifyPlugin({ sourceMap: true })) // 混淆压缩插件
}
```

`tsdown`:

```ts
const plugins: UserConfig['plugins'] = [
  ElementPlusAlias(),
  Vue({ isProduction: true }),
  vueJsx(),
]
```

发现`rollup`的配置明显冗长许多，而作为现代化的构建工具，`tsdown`已经内置了对常见场景的支持，省去了大量配置。

### 构建 fullBundle

对于 fullBundle 的构建，我们需要同时支持 `umd` 和 `esm` 格式，并且需要对外暴露全量的组件库。

> `tsdown` 需要同时配置 `external` 和 `noExternal` 来控制依赖的处理方式。和以往的 `rollup` 只需要配置 `external` 不同。

> `outExtensions` 用于自定义输出文件的扩展名，我们需要根据是否混淆来区分 `.js` 和 `.min.js`。

> `tsdown` 的输出会带上格式前缀，对于`umd`格式会加上 `.umd.`，为了兼容以前的命名，我们手动重命名。

```ts
const createBaseConfig = (
  minify: boolean,
  outDir: string,
  full = true
): InlineConfig => ({
  plugins,
  target,
  external: generateExternal({ full }),
  noExternal: noExternal({ full }),
  outDir,
  minify: getMinifyConfig(minify),
  sourcemap: minify,
  dts: false,
  clean: false,
  platform: 'browser',
  banner,
  tsconfig,
})

async function buildFullEntry(minify: boolean) {
  const baseConfig = createBaseConfig(minify, path.resolve(epOutput, 'dist'))
  const entry = { 'index.full': path.resolve(epRoot, 'index.ts') }
  const outputConfigs: InlineConfig[] = [
    {
      ...baseConfig,
      entry,
      treeshake: true,
      outExtensions: getOutExtensions('js', minify),
      format: 'umd',
      outputOptions: { globals: { vue: 'Vue' } },
      exports: false,
      globalName: PKG_CAMELCASE_NAME,
      sourcemap: minify,
    },
    {
      ...baseConfig,
      entry,
      treeshake: true,
      outExtensions: getOutExtensions('mjs', minify),
      format: 'esm',
      sourcemap: minify,
      exports: false,
    },
  ]

  const results = await Promise.all(outputConfigs.map(config => build(config)))

  const outputDir = path.resolve(epOutput, 'dist')
  const filePatterns = generateUMDPatterns('index.full', minify)
  handleUMDRename(outputDir, filePatterns)

  return results
}
```

### 打包模块

模块打包相对简单许多，我们需要保留模块的目录结构，同时生成 `cjs` 和 `esm` 两种格式：使用 `tsdown`的 ` unbundle: true` 配置项即可

这里的打包需要将子模块也一并打包，因为应用侧会通过直接引用子模块的方式按需引入工具方法；

> tip: 我一开始在组件库主入口引用这些子模块的`index.ts`文件，这样这里就不需要罗列所有的子模块了；但是结果上看，这样的输出结果，虽然保留了相对目录结构，但是子模块的入口文件可能会丢失，比如原来的入口文件导入工具方法从统一的`index.ts` 导入，结果是从源源码文件导入。

```text
subModule
 -fool.js --| 直接引用
 -index.js  | //index丢失了
index.js----|
```

```ts
const baseConfig: InlineConfig = {
  plugins, //同理插件
  target, //输出目标
  clean: false, //不清空输出目录
  tsconfig, //tsconfig路径
  platform: 'browser', //平台
  external: generateExternal({ full: false }),
  noExternal: noExternal({ full: false }),
  unbundle: true, //保留目录结构
  sourcemap: true, //生成sourcemap
  exports: false, //这里是jsapi构建，不需要指定package.json的exports字段
  dts: false, //不生成dts，后面单独生成
}
function buildModulesComponents() {
  //所有打包的入口文件；rollup的配置是glob了所有的文件作为输入，没看懂为什么
  const packagesEntrys = [
    utilRoot,
    localeRoot,
    hookRoot,
    directiveRoot,
    constantsRoot,
  ].map(dir => path.resolve(dir, 'index.ts'))

  //主文件入口
  const mainEntry = path.resolve(epRoot, 'index.ts')

  return Promise.all(
    buildConfigEntries.map(async ([module, config]) => {
      const buildConfig: InlineConfig = {
        ...baseConfig,
        treeshake: { moduleSideEffects: false },
        format: config.format,
        outDir: config.output.path,
        outExtensions: () => {
          return { js: `.${config.ext}` }
        },
        outputOptions: {
          exports: module === 'cjs' ? 'named' : undefined,
        },
      }
      return Promise.all([
        build({ ...buildConfig, entry: mainEntry }),
        build({
          ...buildConfig,
          entry: packagesEntrys,
        }),
      ])
    })
  )
}
```

### style 构建

使用 `lightningcss` 进行样式高性能压缩

以下是构建函数，作为 `gulp` 流式处理的一个 `transform` 插件使用：

```ts
function compressWithLightningCss() {
  return new Transform({
    objectMode: true,
    transform(chunk, _encoding, callback) {
      const file = chunk as Vinyl
      if (file.isNull()) {
        callback(null, file)
        return
      }
      if (file.isStream()) {
        callback(new Error('Streaming not supported'))
        return
      }
      const cssString = file.contents!.toString()
      try {
        const { code } = lightningTransform({
          filename: file.path,
          code: new Uint8Array(Buffer.from(cssString)),
          minify: true,
          sourceMap: false,
          // Preserve color values (avoid color transform)
          // 不能阻止 颜色的简写优化
          exclude: Features.Colors | Features.FontFamilySystemUi,
        })

        const name = path.basename(file.path)
        file.contents = Buffer.from(code)
        consola.success(
          `${chalk.cyan(name)}: ${chalk.yellow(
            cssString.length / 1000
          )} KB -> ${chalk.green(code.length / 1000)} KB`
        )
        callback(null, file)
      } catch (err) {
        callback(err as any)
      }
    },
  })
}
```

### dts 构建

`tsdown` 内置了 `dts` 生成支持，它是在一个转换管道上处理的，理论上生成的速度会更快，但是实际的使用中，有一些问题：

1. 会和当前的目录结构有冲突（它完全遵循当前目录结构，影响输出）
2. 由于多目录不同配置的输出，类型声明其实每个都要单独生成，效率反而是降低了

所以还是选择使用了`vue-tsc`:
直接对整个项目生成`dts`文件，既包含了`ts`文件的类型声明，也包含了`vue`文件的类型声明。

最后拷贝到输出产物中即可

```ts
export const generateTypesDefinitions = async () => {
  await run(
    'npx vue-tsc -p tsconfig.web.json --declaration --emitDeclarationOnly --declarationDir dist/types'
  )
  const typesDir = path.join(buildOutput, 'types', 'packages')
  const filePaths = await glob(`**/*.d.ts`, {
    cwd: typesDir,
    absolute: true,
  })
  const rewriteTasks = filePaths.map(async filePath => {
    const content = await readFile(filePath, 'utf8')
    await writeFile(filePath, pathRewriter('esm')(content), 'utf8')
  })
  await Promise.all(rewriteTasks)
  const sourceDir = path.join(typesDir, 'element-plus')
  await copy(sourceDir, typesDir)
  await remove(sourceDir)
}
```

### 总结

- 提高了构建速度：从原来的 1 分钟左右，提升到 20 秒以内
- 简化了构建配置：减少了大量的插件配置，提升可维护性
- 面向未来： `rolldown` 生态的支持，为未来的优化和升级打下基础

注意：

- `dts` 生成方式的选择上，需要根据项目的具体情况进行权衡
- `noExternal` 和 `external` 的配置和传统不太一样
