<script lang="ts" setup>
import { useAppStore, useLayout, useThemeConfig } from 'valaxy'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const app = useAppStore()
const isHome = useLayout('home')
const themeConfig = useThemeConfig()

const route = useRoute()
const isPage = computed(() => route.path.startsWith('/page'))
</script>

<template>
  <main class="yun-main " :class="(isHome && !app.isSidebarOpen) && 'pl-0'" flex="~ col" w="full">
    <YunNavBar/>
    <div class="aside ">
      <ValaxySidebar>
        <slot name="sidebar">
          <YunSidebar />
        </slot>
      </ValaxySidebar>
    </div>

  <div class="mm-content">
    <template v-if="!isPage">
      <!-- <YunBanner v-if="themeConfig.banner.enable" /> -->
      <!-- <YunSay v-if="themeConfig.say.enable" w="full" /> -->
    </template>

    <YunNotice
      v-if="themeConfig.notice.enable"
      :content="themeConfig.notice.content" mt="4"
    />

    <slot name="board" />

    <slot>
      <router-view />
    </slot>
  </div>

    <YunFooter class="footer" />
  </main>
</template>

<style lang="scss" scoped>
.yun-main{
  max-width: 1200px;
  margin: auto;
  display: grid;
  gap: 16px;
  padding-left: 0;
  .aside{
    grid-row: 2;
    grid-column: 1;
    height: 100%;

  }
  @media screen and (max-width: 720px) {
    .aside{
      display: none;
    }
      .mm-content{
    grid-row: 2/3;
    grid-column: 1;
  }
  }
  .mm-content{
    grid-row: 2/3;
    grid-column: 2;
  }
  .footer{
    grid-row: 3;
    grid-column: 1/3;
  }
}
</style>
