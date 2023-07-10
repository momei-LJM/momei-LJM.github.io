---
​---
title: js实现瀑布流
date: 2023-7-10
updated: 2023-7-10
categories: 前端小记
excerpt_type: html
tags:
  - demo
top: 1
​---
---

### 为什么使用 Js 实现瀑布流

>  瀑布流的本质：获取获取最小高度的列，向其中添加图片，使列之间保持一个尽可能接近的高度。

### 能否使用 Css 实现？flex ? grid ?

不能，css 并不能计算出列的最小高度，所以必须使用 js 实时计算。

### Steps

1. 在 window resize的时候计算列的数量
2. 缓存一个 < 列 ，高度 > 的对象，每次塞图片，更新对象的列高度
3. 从缓存 map 中找到最小高的列，向其中塞入图片
4. 在 窗口 resize 的时候， 对已有元素重排
5. 触底加载更多图片

<!-- more -->

### Code

```js
    // 预设每列的宽度
    const IMG_W = 200;
    const GAP = 10;
    const container = document.querySelector(".container");
    // img dom集合
    const imgsSet = new Set();
    // [列=高度]映射
    let colMap = {};

    // 获取最小高index
    const calcIndex = (v = "min") => {
      const hs = Object.values(colMap);
      const val = v === "min" ? Math.min(...hs) : Math.max(...hs);
      const index = hs.findIndex((i) => i === val);
      return index;
    };

    const createImgs = (imgs) => {
      const colNum = Object.keys(colMap).length;
      const colDoms = document.querySelectorAll(".col");
      imgs.forEach((src) => {
        const minIndex = calcIndex();

        // 创建img
        const img = new Image();
        img.src = src;
        img.referrerPolicy = "no-referrer";
        // 计算高度

        colDoms[minIndex].append(img);
        colMap[minIndex] += img.offsetHeight;

        imgsSet.add(img);
      });
    };

    // 重排
    const reflow = () => {
      container.innerHTML = null;
      colMap = {};
      calcCols();
      const colDoms = document.querySelectorAll(".col");
      imgsSet.forEach((img) => {
        const minIndex = calcIndex();
        // 计算高度
        colDoms[minIndex].append(img);
        colMap[minIndex] += img.offsetHeight;
      });
    };

    // 计算列数
    const calcCols = () => {
      const colNum = Math.floor(container.clientWidth / IMG_W);
      console.log("colNum", colNum);
      for (let i = 0; i < colNum; i++) {
        colMap[i] = 0;
        const div = document.createElement("div");
        div.classList.add("col");
        div.style.width = `${IMG_W}px`;
        div.style.top = 0;
        div.style.left = `${i * (IMG_W + GAP)}px`;
        container.append(div);
      }
    };
    // 随机顺序生成图片
    const genImgList = (number) => {
      const imgList = [];
      for (let i = 0; i < number; i++) {
        const index = Math.round(Math.random() * 3);
        imgList.push(imgs[index]);
      }
      return imgList;
    };

    const init = () => {
      calcCols();
      createImgs(genImgList(10));
    };

    init();

    // 窗口变化 在已有dom基础上做重排计算
    window.addEventListener("resize", reflow);
    // 滚动 最大高度临近100px触发加载更多
    window.addEventListener("scroll", () => {
      const st = document.documentElement.scrollTop;
      const ct = document.documentElement.clientHeight;
      if (colMap[calcIndex("max")] - st - ct < 100) {
        createImgs(genImgList(10));
      }
    });
```

