<template>
  <div>
<iframe :style="style" :src="src"></iframe>
  </div>
</template>

<script lang="ts">
import { defineComponent ,computed} from 'vue'

export default defineComponent({
  props:{
    src:{
      type:String
    },
    width:{
      type:String,
      default:'100%'
    },
    height:{
      type:String,
      default:'500px'
    }
  },
  setup (props) {
    const style = computed(()=>({width:props.width,height:props.height}))
    return {style}
  }
})
</script>

<style scoped lang="scss">
.if{
  height: 500px;
}
</style>