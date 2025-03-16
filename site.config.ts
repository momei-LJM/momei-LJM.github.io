import { defineSiteConfig } from 'valaxy'
import { getGravatarURL } from './utils/useGravartar';
const EMAIL = "2262754355@qq.com"
export default defineSiteConfig({
  url: "https://momei-ljm.github.io/",
  lang: "zh-CN",
  title: "Momei的Blog",
  subtitle: "",
  author: {
    name: "墨眉",
    avatar: getGravatarURL(EMAIL),
    status: {
      emoji: "👦" ,
      message: "nothing left",
    },
  },
  description: "前端笔记簿",
  social: [

  ],
  sponsor: {
    enable: true,
    description:'THANKS'
  },
  statistics: {
    enable:true
  },
  search: {
    enable: true,
    type: "fuse",
  },


});
