---
title: unplugin-vue-components 源码解析
date: 2025-8-10
updated: 2025-8-10
categories: 前端小记
excerpt_type: html
tags:
top: 1
---

我们经常会使用 `unplugin-vue-components` 这个插件来自动引入组件，提升开发效率。

好奇它是如何实现的呢？因此来拆解一下源码（以 `vite` 为例）～

<!-- more -->

### 插件执行逻辑

在 `unplugin-vue-components` 中，插件的初始化是通过 `createUnplugin` 函数来实现的。这个函数接收一个配置对象，并返回一个插件实例。

```ts
import { createUnplugin } from "unplugin";

var unplugin_default = createUnplugin((options = {}) => {
  const filter = createFilter(
    options.include || [
      /\.vue$/,
      /\.vue\?vue/,
      /\.vue\.[tj]sx?\?vue/,
      /\.vue\?v=/,
    ],
    options.exclude || [
      /[\\/]node_modules[\\/]/,
      /[\\/]\.git[\\/]/,
      /[\\/]\.nuxt[\\/]/,
    ]
  );
  const ctx = new Context(options);
  const api = {
    async findComponent(name, filename) {
      return await ctx.findComponent(
        name,
        "component",
        filename ? [filename] : []
      );
    },
    stringifyImport(info) {
      return stringifyComponentImport(info, ctx);
    },
  };
  return {
    name: "unplugin-vue-components",
    enforce: "post",
    api,
    transformInclude(id) {
      return filter(id);
    },
    async transform(code, id) {
      if (!shouldTransform(code)) return null;
      try {
        const result = await ctx.transform(code, id);
        ctx.generateDeclaration();
        ctx.generateComponentsJson();
        return result;
      } catch (e) {
        this.error(e);
      }
    },
    vite: {
      configResolved(config) {
        ctx.setRoot(config.root);
        ctx.sourcemap = true;
        if (config.plugins.find((i) => i.name === "vite-plugin-vue2"))
          ctx.setTransformer("vue2");
        debugger;
        if (ctx.options.dts) {
          ctx.searchGlob();
          if (!existsSync(ctx.options.dts)) ctx.generateDeclaration();
        }
        if (ctx.options.dumpComponentsInfo && ctx.dumpComponentsInfoPath) {
          if (!existsSync(ctx.dumpComponentsInfoPath))
            ctx.generateComponentsJson();
        }
        if (config.build.watch && config.command === "build")
          ctx.setupWatcher(chokidar.watch(ctx.options.globs));
      },
      configureServer(server) {
        ctx.setupViteServer(server);
      },
    },
  };
});
```

可以看到大体的步骤：

1. 开发服务器配置解析部分(`configResolved`)：
1. `ctx.searchGlob()`,glob 扫描 所有的组件，然后添加组件
1. 如果开启了 `dts` 选项，声明文件不存在，则生成类型声明文件
1. 开发服务器启动部分：监听服务器

### step1: `ctx.searchGlob()`

```ts
export function searchComponents(ctx: Context) {
  const root = ctx.root;
  // glob 扫描所有的组件
  const files = globSync(ctx.options.globs, {
    ignore: ctx.options.globsExclude,
    onlyFiles: true,
    cwd: root,
    absolute: true,
    expandDirectories: false,
  });
  //...
  //内部注册（缓存）所有组件配置
  ctx.addComponents(files);
}

function addComponents(paths) {
  debug.components("add", paths);
  const size = this._componentPaths.size;
  //缓存所有 id:path
  toArray(paths).forEach((p) => this._componentPaths.add(p));
  //一开始启动服务器，size是空的，所以走到 updateComponentNameMap
  if (this._componentPaths.size !== size) {
    this.updateComponentNameMap();
    return true;
  }
  return false;
}

function updateComponentNameMap() {
  //清空 _componentNameMap，重新配置
  this._componentNameMap = {};
  Array.from(this._componentPaths).forEach((path) => {
    //根据路径解析文件名- 比如：
    // src/components/MyButton.vue => MyButton
    // src/components/MyButton2/index.vue => MyButton2
    const fileName = getNameFromFilePath(path, this.options);

    //组件名 pascalCase 转换
    const name = this.options.prefix
      ? `${pascalCase(this.options.prefix)}${pascalCase(fileName)}`
      : pascalCase(fileName);
    //...

    //同名组件是否支持覆盖
    if (this._componentNameMap[name] && !this.options.allowOverrides) {
      console.warn(
        `[unplugin-vue-components] component "${name}"(${path}) has naming conflicts with other components, ignored.`
      );
      return;
    }

    //组件信息缓存映射
    this._componentNameMap[name] = {
      as: name,
      from: path,
    };
  });
}
```

### step2: `ctx.generateDeclaration()`

生成 `dts`

```ts
//内部直接调用
function _generateDeclaration(removeUnused = !this._server) {
  if (!this.options.dts) return;
  return writeDeclaration(this, this.options.dts, removeUnused);
}

export async function writeDeclaration(
  ctx: Context,
  filepath: string,
  removeUnused = false
) {
  const originalContent = existsSync(filepath)
    ? await readFile(filepath, "utf-8")
    : "";
  const originalImports = removeUnused
    ? undefined
    : parseDeclaration(originalContent);

  //这里就是 根据 componentNameMap name 和 path 字符串解析和拼接 生成 dts code
  //比如： {avatar : "typeof import('./src/components/global/avatar.vue')['default']}"}
  const code = getDeclaration(ctx, filepath, originalImports);
  if (!code) return;
  //dts 内容写入
  if (code !== originalContent) await writeFile(filepath, code);
}
```

### step3: 监听文件变化（增/删）

开发服务器启动阶段，监听组件的增删操作，更新组件缓存和 `dts` 文件。

```ts
function setupWatcher(watcher: fs.FSWatcher) {
  const { globs } = this.options;

  watcher.on("unlink", (path) => {
    //首先必须是 指定的 glob 才会监听
    if (!matchGlobs(path, globs)) return;

    path = slash(path);
    //删除了组件，则移除 ctx 中组件缓存数据
    this.removeComponents(path);
    //更新 dts
    this.onUpdate(path);
  });
  watcher.on("add", (path) => {
    //首先必须是 指定的 glob 才会监听
    if (!matchGlobs(path, globs)) return;

    path = slash(path);
    //新增了组件，则更新 ctx 中组件缓存数据
    this.addComponents(path);
    //更新 dts
    this.onUpdate(path);
  });
}
```

到这里 扫描组件 ，生成 `dts` 就完成了

### step4: transform -解析模版组件

转换 sfc code ,解析模版组件，增加组件导入；直接看内部实现

```ts
function transformer(ctx, transformer$1) {
  return async (code, id, path) => {
    //已经搜索过了，次函数会被跳过
    ctx.searchGlob();
    const sfcPath = ctx.normalizePath(path);
    debug$1(sfcPath);
    const s = new MagicString(code);

    //主要关注这个函数
    await transformComponent(code, transformer$1, s, ctx, sfcPath);

    if (ctx.options.directives)
      await transformDirective(code, transformer$1, s, ctx, sfcPath);
    s.prepend(DISABLE_COMMENT);
    const result = { code: s.toString() };
    if (ctx.sourcemap)
      result.map = s.generateMap({
        source: id,
        includeContent: true,
        hires: "boundary",
      });
    return result;
  };
}

function resolveVue3(
  code: string,
  s: MagicString,
  transformerUserResolveFunctions: boolean
) {
  const results: ResolveResult[] = [];

  //这里拿到 vuesfc 编译后的code
  //模版内：如果是组件会被 _resolveComponent 包裹
  //比如：<ComponentA/> =>   const _component_ComponentA = _resolveComponent("ComponentA");
  //可以去 sfc playground 查看编译结果

  //因此，我门可以正则匹配到组件名
  for (const match of code.matchAll(/_?resolveComponent\d*\("(.+?)"\)/g)) {
    if (!transformerUserResolveFunctions && !match[0].startsWith("_")) {
      continue;
    }
    const matchedName = match[1];
    if (match.index != null && matchedName && !matchedName.startsWith("_")) {
      const start = match.index;
      const end = start + match[0].length;
      //对组件应映射 原名 => 新名（修改sourcemap, sourcemap 可以直接生成对应源码）
      //replace 可以重命名组件，可以标识哪些组件是 uplugin-vue-components 处理的
      //后续可以基于此处理
      results.push({
        rawName: matchedName,
        replace: (resolved) => s.overwrite(start, end, resolved),
      });
    }
  }

  return results;
}
```

### step5: 增加自动导入

续上 step 的 `transformer`

```ts
async function transformComponent(
  code: string,
  transformer: SupportedTransformer,
  s: MagicString,
  ctx: Context,
  sfcPath: string
) {
  let no = 0;

  //这里 debug resolve函数
  //{rawName:string; replace:function}[]
  //results 是 一个数组，包括解析完的组件名和 sourcemap 替换函数

  const results =
    transformer === "vue2"
      ? resolveVue2(code, s)
      : resolveVue3(code, s, ctx.options.transformerUserResolveFunctions);

  for (const { rawName, replace } of results) {
    debug(`| ${rawName}`);
    const name = pascalCase(rawName);
    ctx.updateUsageMap(sfcPath, [name]);
    //根据 组件名 从一开始注册的缓存中获取组件信息 e.g:
    //{
    //  as: "ComponentA",
    //  from: "/Users/momei/code/sourceCode/unplugin-vue-components/examples/.    vite-vue3/src/components/ComponentA.vue",
    //}

    //findComponent 函数调用自定义的解析器，比如element-plus,定义导入的规则
    //比如增加side effects
    const component = await ctx.findComponent(name, "component", [sfcPath]);
    if (component) {
      //如果，则给组件重命名，可以标识是插件处理的
      const varName = `__unplugin_components_${no}`;
      //复写 sourcemap
      s.prepend(
        //为组件增加导入（自动导入的核心）
        //"import __unplugin_components_0 from '/Users/momei/code/sourceCode/unplugin-vue-components/examples/vite-vue3/src/components/ComponentA.vue'"

        //这里还会对 sideeffect 进行合并，比如 element-plus 的样式
        `${stringifyComponentImport({ ...component, as: varName }, ctx)};\n`
      );
      no += 1;
      replace(varName);
    }
  }

  debug(`^ (${no})`);
}

function stringifyComponentImport(
  { as: name, from: path, name: importName, sideEffects }: ComponentInfo,
  ctx: Context
) {
  path = getTransformedPath(path, ctx.options.importPathTransform);

  const imports = [stringifyImport({ as: name, from: path, name: importName })];

  if (sideEffects)
    toArray(sideEffects).forEach((i) => imports.push(stringifyImport(i)));

  return imports.join(";");
}
```

这步完成后，sourcemap 生成一下 code 后，就完成了自动导入

### 总结

通过以上的分析，我们可以看到 `unplugin-vue-components` 插件是如何实现组件的自动引入的。它通过解析模板、提取组件、生成 import 语句等步骤，极大地提升了开发效率。
