---
title: vue-router history部署后刷新404
date: 2023-6-9
updated: 2023-6-9
categories: 前端小记
excerpt_type: html
tags:
  - vue-router
  - nginx
top: 1
---

### hash模式

[hash](https://developer.mozilla.org/zh-CN/docs/Web/API/Location/hash)模式是在域名和 path 之间使用```#```进行分隔，```#```及其后面的 url 片段标识符就是 hash 字符串。

> 例如： 127.0.0.1/#/login  , hash  就是  #/login  

hash 的特点是页面刷新和改变 hash ，hash 不会被带入网络请求。

> 例如：当我们分别请求  [https://juejin.cn/](https://juejin.cn/) 和 [https://juejin.cn/#aaa](https://juejin.cn/#aaa) ,会发现 network 中始终只有  https://juejin.cn/ 的 网络请求。再次说明了 hash 不会影响网络请求结果。

<a-box>
<img src="/contents/postAssets/rt.png" />
</a-box>


所以，实际上我们的路由每次刷新都是请求的相同的 url ，返回的始终是一个页面，由于是 SPA 的特性，实际上已经加载完所有需要的页面资源了，页面的切换不过是通过监听 hash 的改变，执行 js 脚本来更换视图模块。

<!-- more -->

### history

知道hash的概念后，history也就更好理解了。history恰恰和hash相反。history没有了```#```分隔，每次改变url后刷新页面都会发送请求。

那如果请求一个服务器不存在的资源，自然就404了。

### 如何解决？

关于如何解决history模式刷新404问题，之前百度回答也好，八股文也好，似乎我只有这么一个印象：‘这种模式后台配置支持’。

我：？？？~~~什么玩意儿~~~

直到最近看了nginx，才对这个恍然大悟。

### nginx配置

```nginx
location / {
		//$uri表示域名右面的path，表示请求一个资源文件，$uri/表示请求文件目录
		//这段配置的意思是   请求过来时，先找文件资源，找不到再找目录，都找不到则重定向到index.html
		//最后一个参数表示重定向路径
        try_files $uri $uri/ /index.html;
    }
```

### 总结

1. 浏览器输入url，刷新，过程发生了什么
2. hash和history模式在浏览器上的区别
3. 后台配置？使用nginx配置