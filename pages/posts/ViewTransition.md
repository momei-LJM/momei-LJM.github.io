---
title: View Transitions Api
date: 2023-12-13
updated: 2023-12-13
categories: 前端小记
tags:
  - css
  - animation
excerpt_type: html
top: 1
---

### 概述

> [View Transitions Api](https://developer.mozilla.org/zh-CN/docs/Web/API/View_Transitions_API)
> View Transitions API 提供了一种机制，可以在更新 DOM 内容的同时，轻松地创建不同 DOM 状态之间的动画过渡。同时还可以在单个步骤中更新 DOM 内容。
> ps:不同dom之间的视图过渡

### 常见的过渡/动画创建方式

1. [transition/keyframes](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transition) （ 补间动画，帧动画 ）
2. [requestAnimationFrame](https://developer.mozilla.org/zh-CN/docs/Web/API/window/requestAnimationFrame) （ js 动画，每帧回调 ）
3. [Web Animation Api](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Animations_API)（ 和css动画一样在合成层渲染，js更好的干预和控制 ）
4. [View Transitions Api](https://developer.mozilla.org/zh-CN/docs/Web/API/View_Transitions_API) （ 两个视图或者dom之间的过渡 ）
<!-- more -->

### View Transitions Api

过渡的本质是两个屏幕的截图之间的过渡，这两个屏幕截图是两个伪元素，在`startViewTransition(callback)`执行时，浏览器截取当前屏幕截图作为旧的视图`::view-transition-old`伪元素， 然后执行`callback`回调更新dom，更新完成后，截取新的dom视图`::view-transition-new`，这两个截图位于屏幕顶层，开始渲染过渡。实际上这个时候截图之下已经完成更新，仅仅是两个伪元素在绘制。

生命周期：

1. `document.startViewTransition(callback)`，开启一个视图过渡
2. 执行 `callback` 完成dom更新后，兑现 `ViewTransition.updateCallbackDone` Promise
3. 兑现 `ViewTransition.ready` Promise，在这个阶段，即将开始动画，可以在这个阶段自定义动画，比如使用 `Web Animation Api` 新建一个动画，附着给 `::view-transition-new`
4. 动画结束后，兑现 `ViewTransition.finished` Promise

### demo1 文字过渡（同一个元素）

<i-frame src="/contents/viewTransitions/textAnimate.html" height="300px"></i-frame><br/>

1. 使用 views-transition-api 针对同一个dom元素，实现元素的过渡，虽然是一个dom，单实际上是两个伪元素的过渡，所以可以针对伪元素做控制，实现动画过渡。
2. 当开启视图过渡时，默认使用 `view-transition-name:root` 这组过渡，是透明度的淡入淡出。所以给一组自定义过渡名称。
3. 给旧元素隐藏，新元素附着动画。

#### code

css:

```css
/* 动画 */
@keyframes AAA {
  from {
    transform: translateY(-50%);
    opacity: 0;
  }
  to {
    transform: translateY(0%);
    opacity: 1;
  }
}

.text {
  font-size: 140px;
  /* 新的过渡租名称 */
  view-transition-name: cc;
}

/* 隐藏旧视图 */
::view-transition-old(cc) {
  display: none;
}
/* 新视图附着动画 */
::view-transition-new(cc) {
  animation: AAA forwards;
}
::view-transition-old(cc),
::view-transition-new(cc) {
  animation-duration: 0.6s;
}
```

javascript:

```javascript
const text = document.querySelector(".text");

let toggle = false;

addEventListener("click", (event) => {
  // 开启视图过渡
  if (document.startViewTransition) {
    const transition = document.startViewTransition(() => {
      updateText();
      toggle = !toggle;
    });
  } else {
    updateText();
    toggle = !toggle;
  }
});

const updateText = () => {
  text.textContent = Number(text.textContent) + 1;
};
```

### demo2 dom切换 （不同元素）

<i-frame src="/contents/viewTransitions/tabAnimate.html" height="300px"></i-frame><br/>

做一个简易的tab切换，实现两个不同元素之间的过渡，这在其他的实现手段中可能是比较复杂的，但是使用 `View Transitions Api`，这会变得异常简单。

#### code

css:

```css
.block1 {
  width: 100px;
  height: 50px;
  border-radius: 10px;
  background-color: #ac59bd;
  view-transition-name: bb;
  display: flex;
  padding: 10px;
}

.block2 {
  padding: 10px;
  width: 100%;
  height: 280px;
  border-radius: 10px;
  background-color: rgb(79, 171, 247);
  display: none;
  view-transition-name: bb;
}

::view-transition-old(bb),
::view-transition-new(bb) {
  height: 100%;
  width: 100%;
}
```

js:

```javascript
const block1 = document.querySelector(".block1");
const block2 = document.querySelector(".block2");

let toggle = false;
addEventListener("click", (event) => {
  const transition = document.startViewTransition(() => {
    updateBlock();
    toggle = !toggle;
  });
});

const updateBlock = () => {
  if (toggle) {
    block2.style.display = "none";
    block1.style.display = "block";
  } else {
    block2.style.display = "block";
    block1.style.display = "none";
  }
};
```

### 总结

1. 实际上想要页面有一个简单过渡，只需要一行js代码即可：`document.startViewTransition(callback)`，使用默认的淡入淡出
2. 更适合两个dom或者页面切换的时候使用
3. 本站框架 Valaxy 的主题切换也是基于 View Transitions Api，实现上可参考：[主题切换](https://juejin.cn/post/7207810396420325413)
