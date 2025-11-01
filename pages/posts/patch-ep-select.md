---
title: patch ElSelect 组件支持 focus选中
date: 2025-11-01
updated: 2025-11-01
categories: 前端小记
excerpt_type: html
top: 1
---

### 🧩 背景

在 element-plus 的 `ElSelect` 组件中，在禁用状态下，展示的值无法被 focus 选中。

在我的业务场景中，一个大表单的详情是以禁用状态展示，操作人员需要频繁的获取信息，行为上是 `focus` 输入框或者选择框，`ctrl+a`+`ctrl+c` 来复制内容。

在 `2.5.0` 版本之前，是支持这种能力的，但是在后续版本中，`ElSelect` 组件结果重构，改变了这一行为。为了既能保持改业务的强需求，又能享受升级的便利性，最好的方式是对组件进行源码处理。

提过 pr 后，官方成员认为当前行为是和原生 select 一致的，不会进行修改。
那就只能自己动手，源码 patch 一下了。

<!-- more -->

### 分析原因 & 实现

原因是在 `ElSelect` 组件中，原本的`select` 元素被替换成了一个 `div` 元素，而 `div` 元素在默认状态下，是不支持监听键盘事件聚焦的,只有像 `input` 和 `textarea` 这样的表单元素才支持。

`div` 元素可以通过设置 [tabindex](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Global_attributes/tabindex) 属性来实现聚焦功能。

1. 设置 `tabindex="0"`，使得 `div` 元素可以通过键盘导航获得焦点。
2. 监听 `keydown` 事件，处理选中操作。

设置 tabindex

```html
<div
  v-if="shouldShowPlaceholder"
  :class="[
    nsSelect.e('selected-item'),
    nsSelect.e('placeholder'),
    nsSelect.is(
      'transparent',
      !hasModelValue || (expanded && !states.inputValue)
    ),
  ]"
  tabindex="0"
  @keydown="onKeyDown"
></div>
```

`filterable` 模式下 会被前面元素遮盖，所以在 禁用模式下也支持隐藏，不会覆盖后面的兄弟元素

```js
 nsSelect.is('hidden', !filterable),//[!code --]
 nsSelect.is('hidden', selectDisabled || !filterable),//[!code ++]
```

处理选中

```typescript
const onKeyDown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
    e.preventDefault()
    e.stopPropagation()
    const selection = window.getSelection()
    if (!selection) return
    const range = document.createRange()
    const targetElement = e.currentTarget || e.target
    range.selectNodeContents(targetElement as Node)
    selection.removeAllRanges()
    selection.addRange(range)
  }
}
```

处理样式, `user-select: none` 让文本处于了不可选中状态，去除

```scss
@include e(selected-item) {
  display: flex;
  flex-wrap: wrap;
  user-select: none; //[!code --]
}
```

### [pnpm patch](https://pnpm.io/zh/cli/patch)

如果是 `pnpm` 项目，可以通过 `pnpm patch` 来进行源码 patch，而不需要 安装 `patch-package` 这类包。

```bash
pnpm patch element-plus
```

会在 `node_modules/.pnpm_patches/` 目录下生成一份源码。
找到` el-select/src/select2.mjs` 文件，对编译后的文件修改。

```js
//setup js逻辑写这
const _sfc_main = defineComponent({...})

//模版上的属性写这里就行
//setup 的方法都可以通过 _ctx.xxx 来访问
function _sfc_render(_ctx, _cache){...}
```

修改完成后，运行

```bash
pnpm patch-commit <path>
```

将修改生成 patch 文件，提交到版本控制中。就会在目录下生成目录 `patches/`，里面会包含修改的diff文件。

至此，就完成了对 `ElSelect` 组件的 patch。
