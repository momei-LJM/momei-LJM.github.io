<template>
  <div class="mm-nav">
    <div class="nav-bar rounded-b-[16px] flex items-center pl-10 p-r-10">
      <div class="yun-icon-btn text-lg">墨眉Blog</div>
      <YunSidebarNav class="ml-auto" />
      <div class="ml-auto">
        <YunConfig />
      </div>
    </div>
  </div>
</template>
<style lang="scss" >
.mm-nav {
  height: 474px;
  grid-column: 1/3;

  .nav-bar {
    margin: auto;
    max-width: 1200px;
    height: 72px;
    background-color: var(--va-c-bg-light);
    transition: background-color var(--va-transition-duration);
    position: sticky;
    top: 0;
    filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.15));
  }

}
  @media screen and (max-width: 720px){
    .mm-nav{
      grid-column: 1;
    }
  }
</style>
