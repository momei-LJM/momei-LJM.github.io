import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  url: 'https://valaxy.site/',
  lang: 'zh-CN',
  title: '墨眉的小站',
  subtitle: '',
  author: {
    name: '墨眉',
    avatar:'/avatar.jpg',
    status: {
      emoji: '躺',
      message: '内卷'
  }
  },
  description: '偶尔的学习记录~ ',
  social: [
    // {
    //   name: 'RSS',
    //   link: '/atom.xml',
    //   icon: 'i-ri-rss-line',
    //   color: 'orange',
    // },
    // {
    //   name: '哔哩哔哩',
    //   link: 'https://space.bilibili.com/39247631?spm_id_from=333.1007.0.0',
    //   icon: 'i-ri-bilibili-line',
    //   color: '#FF8EB3',
    // }
  ],

  search: {
    enable: false,
  },

  // sponsor: {
  //   enable: false,
  //   title: '我很可爱，请给我钱！',
  //   methods: [
  //     {
  //       name: '支付宝',
  //       url: 'https://cdn.yunyoujun.cn/img/donate/alipay-qrcode.jpg',
  //       color: '#00A3EE',
  //       icon: 'i-ri-alipay-line',
  //     },
  //     {
  //       name: 'QQ 支付',
  //       url: 'https://cdn.yunyoujun.cn/img/donate/qqpay-qrcode.png',
  //       color: '#12B7F5',
  //       icon: 'i-ri-qq-line',
  //     },
  //     {
  //       name: '微信支付',
  //       url: 'https://cdn.yunyoujun.cn/img/donate/wechatpay-qrcode.jpg',
  //       color: '#2DC100',
  //       icon: 'i-ri-wechat-pay-line',
  //     },
  //   ],
  // },
})
