---
title: JsBrigde和路由实现
date: 2024-11-05
updated: 2024-11-05
categories: 前端小记
excerpt_type: html
tags:
top: 1
---

### WebView

<!-- 这是一张图片，ocr 内容为： -->

![](/contents/hm1.png)

#### 如何通信

通信实现两个基本能力：

- 应用侧调用js侧方法
- js侧调用应用侧方法

<!-- more -->

<!-- 这是一张图片，ocr 内容为： -->

![](/contents/hm2.png)

应用侧通过执行 `runJavascriptExt`，调用js侧的函数

js侧通过创建一个`iframe`，加载约定的url路径，会被应用侧`webview`组件拦截

这是一个循环：

1. 应用侧执行注入的js代码（包含触发load的方法）
2. js侧改变loadUrl
3. 应用侧拦截到url，再次执行js侧代码，获取数据
4. ...loop

在实际情况中，会有相互回调通知的过程，将其抽取封装出来，就是jsBridge

### jsBridge

#### 基本构成

<!-- 这是一张图片，ocr 内容为： -->

![](/contents/hm3.png)

- globalStore 将一对一的jsBridge和webview实例存储起来，应用场景在跨页通知时，触发`send`方法，将向所有的webview实例派发消息

应用侧：

- messageHandlers：存储通过registe方法注册的原生事件
- responseCallbacks：当应用侧调用前端成功后，如果有回调需求，将会以`[uId = callback]`形式存储回调事件

前端：

- messageQueue：存储通知应用侧的消息
- messageHandlers：存储通过registe方法注册的js事件
- responseCallbacks：当前端调用应用侧成功后，如果有回调需求，将会以`[uId = callback]`形式存储回调事件
- msgFromHom：供应用侧`runJavaScriptExt`执行的方法

#### 通信方法实现

<!-- 这是一张图片，ocr 内容为： -->

![](/contents/hm4.png)

应用侧：

- send：本质上是执行前端的一段js代码，传递json对象
- call：是对send传递对象的数据封装
- register：注册事件

前端：

- send：向消息队列存储一个事件对象
- call：对send传递对象的数据封装
- register：注册事件

> 前端最终的调用都是通过send向消息队列中存一个数据对象，然后更新iframe的url，触发webview拦截，应用侧再执行前端的`fetchQueue`方法，获取消息

### 路由实现

路由有两种实现方式

- Router
- Navigation

### 区别

<!-- 这是一张图片，ocr 内容为： -->

![](/contents/hm5.png)

相比Router，Navigation

- <font style="color:rgb(36, 39, 40);">基于通用</font>[UIBuilder](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/arkts-builder-V5)<font style="color:rgb(36, 39, 40);">能力，由开发者决定页面别名和页面UI对应关系，提供更加灵活的页面配置能力</font>
- <font style="color:rgb(36, 39, 40);">灵活的切换动效</font>
- <font style="color:rgb(36, 39, 40);">开放了页面栈对象，开发者可以继承，能更好的管理页面显示</font>
- <font style="color:rgb(36, 39, 40);">可以删除路由栈中指定路由</font>
- <font style="color:rgb(36, 39, 40);">...</font>

<!-- 这是一张图片，ocr 内容为： -->

![](/contents/hm6.png)

### 路由搭建

1. 我们的页面始终依赖于webview组件，所以路由不能声明路由，只能选择动态路由
2. 始终复用webview组件，但作为页面，需要和参数做映射
3. 首页tab的缓存实现

<!-- 这是一张图片，ocr 内容为： -->

![](/contents/hm7.png)

路由实现结合router和navigation一起实现

- pages：约定两个entry路由（router）,Login和Index页面，应用默认进入Index
- Index页面默认内置Tab组件，组件分别放置webview组件和需要的原生页面，tab可以实现页面的懒加载和缓存
- 为Index分配一个路由栈对象
- 每个页面都可以获取路由栈对象进行路由操作
- 如果跳转登录页直接通过Router跳转（为什么不用navigation?可以直接走Index完整的生命周期，而不是将特殊逻辑内嵌在Index中）
