<template>
  <div className="orbit-container">
    <div className="circle"></div>
    <div v-for="(item) in items" className="item" :key="item.name" :onMouseEnter="stop" :onMouseLeave="start"
      :style="calcStyle(item)">
      {{ item.name }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const DISTANCE_X = 300
const DISTANCE_H = 300
// js 辅助定位，计算初始元素在轨迹上的位置（角度）
const items = ref(Array.from({ length: 5 }, (_, index) => ({ name: `ball-${index}`, rotate: (index * 360) / 5 })))

const update = () => {
  items.value.forEach((item) => { item.rotate = item.rotate + 0.5 })
  start()
}
// 计算圆上坐标、
// 角度转弧度
// x: r * cos(θ)
// y: r * sin(θ)
const getPosition = (rotate: number) => {
  rotate = (rotate * Math.PI) / 180
  const x = DISTANCE_X * Math.cos(rotate)
  const y = DISTANCE_H * Math.sin(rotate)
  return { x, y }
}

const calcStyle = (item: any) => {
  const { x, y } = getPosition(item.rotate)
  return { transform: `translate3d(${x}px, ${0.34202 * y}px,${0.939693 * y}px)` }
}

const rafRef = ref<number | null>(null)

const start = () => {
  rafRef.value = window.requestAnimationFrame(update)
}

const stop = () => {
  window.cancelAnimationFrame(rafRef.value!)
}
start()

</script>
<style lang="scss" scoped>
@media screen and (max-width: 768px) {
  .orbit-container {
    transform: scale(.3);
  }
}

@media screen and (min-width: 768px) {
  .orbit-container {
    transform: scale(.8);
  }
}

.orbit-container {
  width: 100%;
  height: 600px;
  position: relative;
  transform-style: preserve-3d;
  perspective: 479px;

  //轨迹，椭圆
  .circle {
    position: absolute;
    width: 600px;
    height: 600px;
    border: 2px solid #fafafa;
    left: 50%;
    top: 50%;
    transform: translate3d(-50%, -50%, 0px) rotateX(40deg);
    border-radius: 50%;
  }

  .item {
    position: absolute;
    left: calc(50% - 25px);
    top: calc(50% - 25px);
    background-color: #04b4ff;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    text-align: center;
    line-height: 50px;
    cursor: pointer;
  }
}
</style>
