---
title: Web Animations API 写一个动画指令
date: 2023-6-10
updated: 2023-6-10
categories: 前端小记
excerpt_type: html
tags:
  - demo
  - vue
  -	Web Animations API
top: 1
---

### [Web Animations API](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API)

> 通过 Web 动画 API，我们可以将交互式动画从样式表移动到  JavaScript，将表现与行为分开。我们不再需要依赖 DOM 重的技术，如将 CSS 属性和范围类写入元素来控制播放方向。

<span class="text-red-600"> 和 Css 动画有什么区别？</span>

CSS 动画和 Web Animations API 都可以用于创建动画，但它们之间有一些区别。CSS 动画是通过 CSS 属性来控制的，而 Web Animations API 是通过 JavaScript 来控制的。此外，Web Animations API 还提供了更多的功能，例如更好的时间控制和更好的事件处理。

<span class="text-red-600" > 性能方面如何？</span>

Web Animations API 提供了更多的控制和更好的性能，因为它可以调用不同于浏览器主线程的其他线程去渲染该动画（这些线程包括合成线程、动画线程和渲染线程。合成线程负责将页面的各个部分组合成一张图像，动画线程负责计算动画的状态，而渲染线程负责将图像绘制到屏幕上）

所以一些复杂的动画可选择 Web Animations API 。

> 记录一篇掘金文章 [什么是Web Animations API？](https://juejin.cn/post/7065093728737689614)
<!-- more -->
### IntersectionObserver

> [IntersectionObserver](https://developer.mozilla.org/zh-CN/docs/Web/API/IntersectionObserver)  接口（从属于 [Intersection Observer API](https://developer.mozilla.org/zh-CN/docs/Web/API/Intersection_Observer_API)）提供了一种异步观察目标元素与其祖先元素或顶级文档 [视口](https://developer.mozilla.org/zh-CN/docs/Glossary/Viewport)（viewport）交叉状态的方法。其祖先元素或视口被称为根（root）。

简而言之，可以监听元素交叉状态并提供回调。我们使用该 API 来检测元素是否进入视口，以此判断动画执行时机。

### 封装 vue 指令

vue 指令代码和 注释

```typescript
import { DirectiveBinding, ObjectDirective } from 'vue'
export interface TWebAnimate {
  keyFrames: Keyframe[]
  options?: any
}
const defaultAnimate = {
  keyFrames: [
    {
      opacity: 0.5,
      transform: 'translateY(30px)',
    },
    {
      opacity: 1,
      transform: 'translateY(0px)',
    },
  ],
  options: {
    duration: 500,
  },
}
// 元素进出视口元素回调
const callBack = (entries: IntersectionObserverEntry[]) => {
  entries.forEach((entry) => {
    const arg = animateMap.get(entry.target)
    if (entry.isIntersecting && arg) {
      entry.target.animate(arg.keyFrames, arg.options)
      animateMap.delete(entry.target)
    }
  })
}
// 判断是否为视口以下元素 -> 需要加载
const isNeedLoad = (el: Element) => {
  return !!(el.getBoundingClientRect().top > window.innerHeight)
}

const observer = new IntersectionObserver(callBack)

// weakMap 避免内存泄漏  用于记录需要执行动画的Dom
const animateMap = new WeakMap<object, TWebAnimate>()

//  ObjectDirective<HTMLElement, TWebAnimate>
export const vLoadItem: any = {
  mounted: (el: HTMLElement, binding: DirectiveBinding) => {
    // 外部自定义动画，若没有指定，则使用默认动画
    const val = binding.value ?? defaultAnimate
    const args = { ...val }

    if (isNeedLoad(el)) {
      animateMap.set(el, args)
    }
    observer.observe(el)
  },
  unmounted: (el: HTMLElement) => {
    observer.unobserve(el)
  },
}

```

写一个dom结构测试

```html
<template>
  <div>
    <div v-load-item class="item"></div>
    <div v-load-item class="item"></div>
    <div v-load-item class="item"></div>
    <div v-load-item class="item"></div>
    <div v-load-item class="item"></div>
    <div v-load-item class="item"></div>
    <div v-load-item class="item"></div>
    <div v-load-item class="item"></div>
    <div v-load-item class="item"></div>
    <div v-load-item class="item"></div>
  </div>
</template>
```

结果：
<a-box>
<img src="/contents/postAssets/2023610.gif" />
</a-box>
