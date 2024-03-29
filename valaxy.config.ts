import { defineValaxyConfig } from 'valaxy'
import type { UserThemeConfig } from 'valaxy-theme-yun'

// add icons what you will need
const safelist = [
  'i-ri-home-line',
  'i-ri-rss-line'
]

/**
 * User Config
 */
export default defineValaxyConfig<UserThemeConfig>({
  // site config see site.config.ts

  theme: "yun",

  themeConfig: {
    banner: {
      enable: true,
      title: "MoMeiの小站",
      // title: "TEST",
      cloud: {
        enable: true,
      },
    },

    pages: [
      // {
      //   name: '我的小伙伴们',
      //   url: '/links/',
      //   icon: 'i-ri-genderless-line',
      //   color: 'dodgerblue',
      // },
      // {
      //   name: '喜欢的女孩子',
      //   url: '/girls/',
      //   icon: 'i-ri-women-line',
      //   color: 'hotpink',
      // },
    ],

    footer: {
      since: 2023,
      beian: {
        enable: false,
        icp: "苏ICP备17038157号",
      },
    },
    bg_image:{
      enable:true,
      url:'/bgs/banner.jpg',
      opacity:1
    }
  },

  unocss: {
    safelist,
    theme: {
      screens: {
        tablet: "350px",
      },
    },
  },
});
