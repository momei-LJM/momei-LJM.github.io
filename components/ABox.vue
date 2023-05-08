<template>
  <div class="a-box">
    <slot >
    <h3 >hellow word</h3>
  </slot>
  </div>
 
  
</template>

<script setup lang="ts">

</script>

<style scoped lang="scss">
h3{
  color: red;
}
@keyframes ss {
  from{
    opacity: 0;
    transform: translateY(10%);
  }to{
    opacity: 1;
  }
}
.a-box{
  animation: ss linear  .5s ;
}
</style>
