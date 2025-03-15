<template>
  <div class="bg">
    <div ref="$box" className="box" style=" transform: 'rotateX(-33.5deg) rotateY(45deg)' ">
      <div className="font">font</div>
      <div className="back">back</div>
      <div className="bottom">bottom</div>
      <div className="left">left</div>
      <div className="right">right</div>
      <div className="top">top</div>
    </div>
  </div>

</template>

<script lang="ts" setup>
import { onMounted, useTemplateRef } from 'vue'


  const $box = useTemplateRef<HTMLDivElement>("$box")
  const speed = 1

  let onMouseDown = false
  let startX = 0
  let startY = 0

  let rotateX = -33.5
  let rotateY = 45

  const rotateCube = (x: number, y: number) => {
    rotateY += x
    rotateX -= y
  }

  onMounted(() => {
    $box.value?.addEventListener('mousedown', e => {
      startX = e.clientX / speed
      startY = e.clientY / speed
      onMouseDown = true
    })

    window.addEventListener('mouseup', () => (onMouseDown = false))
    window.addEventListener('mousemove', e => {
      if (onMouseDown) {
        const curX = e.clientX / speed
        const curY = e.clientY / speed
        const dX = curX - startX
        const dY = curY - startY
        startX = curX
        startY = curY
        rotateCube(dX, dY)
        $box.value!.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
      }
    })
  })
</script>

<style lang="scss" scoped>
@media screen and  (max-width: 800px) {
  .bg{
  --w: 45vw;
  }
}
@media  screen and (min-width: 800px) {
  .bg{
  --w: 200px;
  }
}
.bg{
  padding-top: 20px;
  height: calc(var(--w)*1.2);
}
.box {
  width: var(--w);
  height: var(--w);
  transform-style: preserve-3d;
  transform-origin: center;
  margin: 20px auto;
  position: relative;
  transform: rotateX(-33.5deg) rotateY(45deg);
  // animation: A 2s infinite ease-in-out;
}
.box > div {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: #04ed65a4;
  text-align: center;
  line-height: var(--w);
  font-weight: bold;
  border: 1px solid white;
  backface-visibility: hidden;
  user-select: none;
  cursor: pointer;
}
.font {
  transform: translateZ(calc(var(--w) / 2));
}
.back {
  transform: rotateX(180deg) translateZ(calc(var(--w) / 2));
}
.bottom {
  transform: rotateX(-90deg) translateZ(calc(var(--w) / 2));
}
.left {
  transform: rotateY(-90deg) translateZ(calc(var(--w) / 2));
}
.right {
  transform: rotateY(90deg) translateZ(calc(var(--w) / 2));
}
.top {
  transform: rotateX(90deg) translateZ(calc(var(--w) / 2));
}

@keyframes A {
  0% {
    transform: rotateX(-33.5deg) rotateY(45deg);
  }
  40%,
  to {
    transform: rotateX(-33.5deg) rotateY(315deg);
  }
}

</style>
