<script lang="ts" setup>
import {useAppStore,useLayout } from 'valaxy'
// import { useAppStore, useLayout } from '..'

const app = useAppStore()
const isHome = useLayout('home')
</script>

<template>
  <ValaxyOverlay class="md:hidden" :show="app.isSidebarOpen" @click="app.toggleSidebar()" />

  <!-- <ValaxyHamburger :active="app.isSidebarOpen" class="menu-btn sidebar-toggle yun-icon-btn" :class="isHome ? '' : 'md:hidden'" @click="app.toggleSidebar()" /> -->

  <aside class="va-card transition sidebar" :class="[app.isSidebarOpen && 'open', !isHome && 'md:translate-x-0']">
    <div class="bar-content">
 <slot ></slot>
    </div>

  </aside>
</template>

<style>
.menu-btn {
  display: inline-flex;
  /* position: fixed; */
  left: 0.8rem;
  top: 0.6rem;
  line-height: 1;
  z-index: var(--yun-z-menu-btn);
  cursor: pointer;
}
.sidebar{
  background-color: transparent!important;
  padding: 16px 0 16px 16px;
  /* margin: 20px; */
  transform: translateX(0)!important;
  position: sticky !important;
  top: 0;
  box-shadow: none!important;
  &:hover{
    box-shadow: none!important;
  }


}
  .bar-content{
     background-color: var(--va-c-bg-light);
    border-radius: 16px;
     height: 100%;
  }
</style>
