<template>
  <div class="background-containder" :class="{'marsk': !appStore.isDark}"/>
</template>

<script lang="ts" setup>
import { useAppStore } from "valaxy";

const appStore = useAppStore()


</script>

<style>
.marsk:before{
    content: "";
    pointer-events: none;
    z-index: 0;
    background-image: radial-gradient(circle, #40b1ea 1px, #0000 1px);
    background-size: 30px 30px;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    -webkit-mask: linear-gradient(90deg, #0000 0%, #000 35% 55%, #0000 100%), linear-gradient(#0000 0%, #000 35% 55%, #0000 100%);
    mask: linear-gradient(90deg, #0000 0%, #000 35% 55%, #0000 100%), linear-gradient(#0000 0%, #000 35% 55%, #0000 100%);
}
</style>
