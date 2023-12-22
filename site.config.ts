import { defineSiteConfig } from 'valaxy'
import { getGravatarURL } from './utils/useGravartar';
const EMAIL = "2262754355@qq.com"
export default defineSiteConfig({
  url: "https://momei-ljm.github.io/",
  lang: "zh-CN",
  title: "墨眉的小站",
  subtitle: "",
  author: {
    name: "墨眉",
    avatar: getGravatarURL(EMAIL),
    status: {
      emoji: "JS",
      message: "JSCoder",
    },
  },
  description: "前端笔记簿（有时）",
  social: [

  ],

  search: {
    enable: true,
    type: "fuse",
  },


});
