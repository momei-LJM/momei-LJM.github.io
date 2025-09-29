---
title: Shadow DOM & Tailwind 在 Chrome 扩展中的应用
date: 2025-9-28
updated: 2025-9-28
categories: 前端小记
excerpt_type: html
tags:
top: 1
---

之前在开发一款 `Chrome` 扩展插件，目标是在 `content-script` 方式下开发。

既然是直接在DOM页面插入组件，优先考虑样式不会影响页面，所以考虑 使用 `Shadow DOM` 来隔离样式。

在此场景下开发时，遇到了一些问题和思考，记录如下：

1. `tailwind V4` 在 `Shadow DOM` 下的兼容性问题
2. vite 下 `hmr` 的问题
3. 思考

### Tailwind V4

<!-- more -->

在 `tailwind V4` 版本中，大量的使用了 ['Houdini API']('https://developer.mozilla.org/zh-CN/docs/Glossary/Houdini') 作为 CSS 变量的实现方式，而 `Houdini API` 目前在 `Shadow DOM` 下并不支持。

呈现出来的结果就是：当我将 样式注入到 `Shadow DOM` 下时，发现 `tailwind` 的样式基本不可用，相应的`Shacn 组件` 样式也会失去作用。

如果要解决这个问题，只有将样式全部注入到整个外部页面的文档中，这样必然会对页面产生影响，显然是不合适的。

所以我选择了降级 `tailwind` 版本到 `V3`。

### 样式注入 & Vite HMR

我使用了 `crxjs` 插件去做热更新。

实际上在将样式注入到 `Shadow DOM` 下时，样式表是不可以直接在页面或者组件中导入的，这样 `vite` 会将样式生成 `link`标签插入到`html`的 `head` 中，这样样式显然会污染页面。

在 `content.css` 中依然不能配置样式，经过实践，依然是直接注入到文档的。

尝试过虚拟插件（我不知道如何对虚拟插件实现hmr，结果上这种方式是ok的），所以其实最终我选择的方式是通过外部链接的方式引入css，然后通过 `fetch` 的方式获取样式，然后注入到 `shadow DOM` 下。

<span class="text-red">问题：</span> 外部链接是不会走到 `vite` 的 `hmr` 机制的。

所以需要实时监听和编译 `tailwind` 的样式，并通知前端去重新拉取样式。

```TypeScript [vite-plugin-content-css.ts]
const isDev = process.env.NODE_ENV === 'development'

export default function vitePluginContentCss(): Plugin {
  let compiledCss: string | null = null

  const targetPath = resolve(process.cwd(), 'dist/src/output.css')
  const cssPath = resolve(process.cwd(), 'src/styles/content.css')
  const tailwindConfigPath = resolve(process.cwd(), 'tailwind.config.js')

  const genCss = async () => {
    try {
      const cssContent = await readFile(cssPath, 'utf-8')
      // 即时编译css样式文件
      const result = await postcss([
        tailwindcss(tailwindConfigPath),
        autoprefixer(),
      ]).process(cssContent, {
        from: cssPath,
        to: targetPath,
      })
      compiledCss = result.css.replace(/:root/g, ':host')
    } catch (error) {
      console.error('Failed to compile CSS:', error)
      compiledCss = ''
    } finally {
      writeFileSync(targetPath, compiledCss, 'utf-8')
    }
  }
  return {
    name: 'vite-plugin-content-css',

    async buildStart() {
      // 在构建开始时编译CSS（仅在非开发环境）
      if (!isDev) {
        genCss()
      }
    },
    configureServer() {
      genCss()
    },
    async handleHotUpdate(ctx) {
      // 这里不能发送自定义hmr消息，因为被crxjs过滤掉了
      // 所以自能走通用的hmr生命周期
      // 任何文件变化都重新编译 CSS 以获取最新的类名
      console.log('File changed, recompiling CSS...')

      await genCss()

      return ctx.modules
    },
  }
}

```

```TypeScript [shadow-dom.ts]{23-29}
/**
 * inject styles into the shadow DOM
 * @param styleContainer
 */
export async function injectStyles(styleContainer: ShadowRoot) {
  try {
    const div = document.createElement('div')
    const styleElement = document.createElement('style')

    // 如果已有样式元素，先移除
    if (currentStyleElement) {
      currentStyleElement.remove()
    }

    styleContainer.appendChild(div)
    div.appendChild(styleElement)
    currentStyleElement = styleElement

    const response = await fetch(chrome.runtime.getURL('src/output.css'))
    const css = await response.text()
    styleElement.textContent = css
    // 设置 HMR 监听器（只设置一次）
    if (import.meta.hot) {
      import.meta.hot.on('vite:beforeUpdate', () => {
        console.log('Received CSS update event:')
        // 重新获取并注入样式
        reloadStyles()
      })
    }
  } catch (error) {
    console.error('Failed to inject styles:', error)
  }
}

/**
 * 重新加载样式
 */
async function reloadStyles() {
  try {
    if (!currentStyleElement) return

    const response = await fetch(chrome.runtime.getURL('src/output.css'))
    const css = await response.text()
    currentStyleElement.textContent = css
    console.log('Styles reloaded successfully')
  } catch (error) {
    console.error('Failed to reload styles:', error)
  }
}
```

### 思考

`Shadow DOM` 不兼容 `tailwind V4` 这个问题，实际上是 `Houdini API` 目前并不完善的一个体现，那在微前端等场景下，`Shadow DOM` 作为隔离样式的手段（wujie），应该也会遇到类似的问题，。
