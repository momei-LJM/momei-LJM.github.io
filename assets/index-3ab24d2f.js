import{_ as k}from"./ValaxyMain.vue_vue_type_style_index_0_lang-0086450a.js";import{d as _,u as g,o as r,b as m,e as a,F as v,l as y,n as $,m as p,t as f,_ as w,p as b,c as L,w as e,g as J,r as n}from"./app-754963e5.js";import{o as B}from"./index-8f8e9689.js";import"./YunFooter.vue_vue_type_script_setup_true_lang-b3003cb0.js";import"./YunCard.vue_vue_type_style_index_0_lang-16315766.js";import"./YunPageHeader.vue_vue_type_script_setup_true_lang-d1d9cb1f.js";const M={class:"links"},S={class:"link-items"},j=["href","title"],D={class:"link-left"},E=["src","alt","onError"],N={class:"link-info",m:"l-2"},V={class:"link-blog",font:"serif black"},z={class:"link-desc"},C=_({__name:"YunLinks",props:{links:{},random:{type:Boolean}},setup(t){const i=t,{data:c}=g(i.links,i.random);return(u,o)=>(r(),m("div",M,[a("ul",S,[(r(!0),m(v,null,y(p(c),(s,l)=>(r(),m("li",{key:l,class:"link-item",style:$(`--primary-color: ${s.color}`)},[a("a",{class:"link-url",p:"x-4 y-2",href:s.url,title:s.name,alt:"portrait",rel:"friend"},[a("div",D,[a("img",{class:"link-avatar",w:"16",h:"16",loading:"lazy",src:s.avatar,alt:s.name,onError:p(B)},null,40,E)]),a("div",N,[a("div",V,f(s.blog),1),a("div",z,f(s.desc),1)])],8,j)],4))),128))])]))}});const q=JSON.parse('{"title":"我的小伙伴们","description":"云游的小伙伴们","frontmatter":{"title":"我的小伙伴们","keywords":"链接","description":"云游的小伙伴们","links":"https://www.yunyoujun.cn/friends/links.json","random":true},"headers":[],"relativePath":"pages/links/index.md","path":"/home/runner/work/momei-LJM.github.io/momei-LJM.github.io/pages/links/index.md","lastUpdated":1700664126000}'),d=JSON.parse('{"title":"我的小伙伴们","description":"云游的小伙伴们","frontmatter":{"title":"我的小伙伴们","keywords":"链接","description":"云游的小伙伴们","links":"https://www.yunyoujun.cn/friends/links.json","random":true},"headers":[],"relativePath":"pages/links/index.md","path":"/home/runner/work/momei-LJM.github.io/momei-LJM.github.io/pages/links/index.md","lastUpdated":1700664126000}'),F={name:"pages/links/index.md",data(){return{data:d,frontmatter:d.frontmatter}},setup(){b("pageData",d)}};function O(t,i,c,u,o,s){const l=C,h=k;return r(),L(h,{frontmatter:o.frontmatter,data:o.data},{"main-content-md":e(()=>[J(l,{links:o.frontmatter.links,random:o.frontmatter.random},null,8,["links","random"])]),"main-header":e(()=>[n(t.$slots,"main-header")]),"main-header-after":e(()=>[n(t.$slots,"main-header-after")]),"main-nav":e(()=>[n(t.$slots,"main-nav")]),"main-content":e(()=>[n(t.$slots,"main-content")]),"main-content-after":e(()=>[n(t.$slots,"main-content-after")]),"main-nav-before":e(()=>[n(t.$slots,"main-nav-before")]),"main-nav-after":e(()=>[n(t.$slots,"main-nav-after")]),comment:e(()=>[n(t.$slots,"comment")]),footer:e(()=>[n(t.$slots,"footer")]),aside:e(()=>[n(t.$slots,"aside")]),"aside-custom":e(()=>[n(t.$slots,"aside-custom")]),default:e(()=>[n(t.$slots,"default")]),_:3},8,["frontmatter","data"])}const A=w(F,[["render",O]]);export{q as __pageData,A as default};