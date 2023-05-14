<template>
  <div>
<iframe class="if" :src="src"></iframe>
<!-- <iframe src="/aa.html"></iframe> -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props:{
    src:{
      type:String
    }
  },
  setup () {
    

    return {}
  }
})
</script>

<style scoped lang="scss">
.if{
  height: 500px;
}
</style>