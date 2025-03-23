<template>
  <div ref="domRef" :class="{'a-box':show}" >
    <slot>
      <h3>hellow word</h3>
    </slot>
  </div>


</template>

<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core';
import { ref } from 'vue';

const domRef = ref<HTMLElement>();

const show = ref(false);

 useIntersectionObserver(domRef,() => {
   show.value = true;

})
</script>

<style scoped lang="scss">
h3 {
  color: red;
}

@keyframes ss {
  from {
    opacity: 0;
    transform: translateY(10%);
  }

  to {
    opacity: 1;
  }
}

.a-box {
  animation: ss linear .5s;
}
</style>
