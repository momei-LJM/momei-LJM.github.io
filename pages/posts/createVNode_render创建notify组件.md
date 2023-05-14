---
title: createVNode/render创建notify组件
date: 2023-3-21
updated: 2023-3-21
categories: 前端小记
excerpt_type: html
tags:
  - vue3
  - createVNode/render
top: 1
---
### 概述
阅读element notify组件（~~摸鱼真爽~~）。
> createVNode/render 相比于模板语法有更高的自由度，在需要js的完全编程能力时非常有用。


### 编程式触发创建

1. 定义组件模板（component）
2. 定义props参数和触发事件
3. 缓存vnode，后续通过vnode缓存计算定位高度
<!-- more -->


<a name="hVKGk"></a>
### createVNode/h函数
> 传入的props对象的响应式，需要手动修改vnode的component的props属性

<a name="H1iIf"></a>
### 编程式触发创建

1. 定义组件模板（component）
2. 定义props参数和触发事件
3. 缓存vnode，后续通过vnode缓存计算定位高度
<a name="OC8hm"></a>
### 组件关闭和销毁

1. 组件关闭通过 `v-show=visible`控制组件显示，确保完整的声明周期
2. 通过transition组件的@after-leave 控制组件的销毁，销毁事件在createVNode阶段定义
<a name="fIdCV"></a>
### 组件模板

1. 定义组件 显示/关闭 过渡，`<Transition/>`包裹，动画离开后触发销毁事件
2. 根据props动态计算style
3. 样式设置：设置定位位移过渡
```vue
<template>
  <Transition @after-leave="$emit('destroy')">
    <div v-show="visible" class="box" :id="id" :style="style"
      >{{ message }}
      <div @click="close">关闭</div>
    </div>
  </Transition>
</template>


<script lang="ts">
import { computed, ComputedRef, defineComponent, onMounted, ref } from 'vue'


export default defineComponent({
  props: {
    message: {
      type: String
    },
    id: {
      type: String
    },
    offset: {
      type: Number
    }
  },
  emits: ['close', 'destroy'],
  setup(props, { emit }) {
    const style = computed(() => ({ top: props.offset + 'px' }))
    const close = () => {
      visible.value = false
      emit('close', props.id)
    }
    const visible = ref(false)
    onMounted(() => {
      visible.value = true
    })
    return { style, close, visible }
  }
})
</script>


<style scoped lang="scss">
.box {
  width: 200px;
  height: 100px;
  background: #000;
  color: white;
  position: absolute;
  right: 0;
  transition: all 0.2s;
}
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}


.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
```
<a name="N7lsc"></a>
### 创建hook
```typescript
import { VNode, createVNode, render } from 'vue'
import MessageBox from '../messageBox.vue'
const GAP_SIZE = 16
let seed = 1
const vnodeCache: { id: string; vnode: VNode }[] = []
export const notify = (options = {}) => {
  const appendTo = document.body
  const container = document.createElement('div')
  const id = `messageBoxId--${seed++}`
  // 缓存开罩属性
  let cacheHeight = ''
  let letcheIDX = 0
  const vnode = createVNode(MessageBox, {
    ...options,
    offset: vnodeCache.reduce((pre, curr) => pre + curr.vnode?.el?.offsetHeight + GAP_SIZE, options?.offset || 0),
    id,
    // 关闭时  删除缓存内dom信息，同时保存当前快照
    onClose: (id: string) => {
      letcheIDX = vnodeCache.findIndex(item => item.id === id)
      cacheHeight = vnodeCache[letcheIDX]?.vnode?.el?.offsetHeight
      vnodeCache.splice(letcheIDX, 1)
    },
    onDestroy: () => {
      // 销毁dom
      render(null, container)
      const len = vnodeCache.length
      // 设置位移  组件内部设置 定位动画过渡
      for (let i = letcheIDX; i < len; i++) {
        const { component } = vnodeCache[i]!.vnode
        const oldSet = component!.props.offset
        component!.props.offset = (oldSet as any).offset - Number(cacheHeight) - GAP_SIZE
      }
    }
  })
  // 缓存dom
  vnodeCache.push({ id, vnode })
  render(vnode, container)
  // 插入dom
  appendTo.appendChild(container.firstElementChild!)
}
```
