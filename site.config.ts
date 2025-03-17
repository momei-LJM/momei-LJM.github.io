import { defineSiteConfig } from 'valaxy'
import { getGravatarURL } from './utils/useGravartar';
const EMAIL = "2262754355@qq.com"
const QQ_AVATAR = "https://q1.qlogo.cn/g?b=qq&nk=2262754355&s=140"
export default defineSiteConfig({
  url: "https://www.momei.me",
  lang: "zh-CN",
  title: "Momei的Blog",
  subtitle: "",
  author: {
    name: "墨眉",
    avatar: QQ_AVATAR,
    status: {
      emoji: "👦",
      message: "nothing left",
    },
  },
  description: "前端笔记簿",
  social: [],
  sponsor: {
    enable: true,
    description: "THANKS",
  },
  statistics: {
    enable: true,
  },
  search: {
    enable: true,
    type: "fuse",
  },
});
