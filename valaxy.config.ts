import { defineValaxyConfig } from 'valaxy'
import type { UserThemeConfig } from 'valaxy-theme-yun'
import { addonComponents } from "valaxy-addon-components";
import { addonBangumi } from "valaxy-addon-bangumi";
// add icons what you will need
const safelist = ["i-ri-home-line", "i-ri-github-fill"];

/**
 * User Config
 */
export default defineValaxyConfig<UserThemeConfig>({
  // site config see site.config.ts
  theme: "yun",
  addons: [
    addonComponents(),
    addonBangumi({
      api: "https://bangumi.momei.me/api/vercel",
      bilibiliUid: "39247631",
      bgmEnabled: false,
    }),
  ],
  themeConfig: {
    type: "nimbo",
    banner: {
      enable: true,
      title: "墨眉の小站",
      cloud: {
        enable: true,
      },
    },

    pages: [
      {
        name: '归档',
        url: '/archives/',
        icon: 'i-ri-archive-line',
        color:'#FF3CAC'
      },
      {
        name: '分类',
        url: '/categories/',
        icon: 'i-ri-folder-2-line',
        color:"#fda085"
      },
      {
        name: '标签',
        url: '/tags/',
        icon: 'i-ri-price-tag-3-line',
        color: '#4facfe',
      },
      {
        name: '追番列表',
        url: '/bangumi/',
        icon: 'i-ri-bilibili-line',
        color: '#fb7299',
      },

    ],

    footer: {
      since: 2023,
      beian: {
        enable: false,
        icp: "苏ICP备17038157号",
      },
    },
    bg_image: {
      enable: true,
      url: "https://files.codelife.cc/wallhaven/full/2e/wallhaven-2emqgx.png?x-oss-process=image/resize,limit_0,m_fill,w_2560,h_1440/quality,Q_93/format,webp",
      opacity: 1,
    },
  },

  unocss: { safelist },
});
