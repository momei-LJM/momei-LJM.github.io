import{d as c,o as a,c as m,w as r,e as l,q as n,t as p,i as h,b as _,F as y,m as v,s as A,E as L,a2 as Y,ae as $,af as k,a as w,v as B,g as u,ad as C}from"./app-79d748c5.js";import{o as P}from"./index-51a444af.js";import{_ as V}from"./YunPageHeader.vue_vue_type_script_setup_true_lang-e24a9764.js";const E=["title"],F=["src","alt","on-error"],x=c({__name:"YunAlbum",props:{album:{}},setup(i){return(e,t)=>{const o=h;return a(),m(o,{class:"yun-album-list-item",to:e.album.url},{default:r(()=>[l("figure",{title:e.album.desc},[l("img",{loading:"lazy",class:"yun-album-list-cover",src:e.album.cover,alt:e.album.caption,"on-error":n(P)},null,40,F),l("figcaption",null," 「"+p(e.album.caption)+"」 ",1)],8,E)]),_:1},8,["to"])}}}),I={class:"yun-album-list"},N=c({__name:"YunAlbumList",props:{albums:{}},setup(i){return(e,t)=>{const o=x;return a(),_("div",I,[(a(!0),_(y,null,v(e.albums,s=>(a(),m(o,{key:s.url,album:s},null,8,["album"]))),128))])}}});const R={text:"center",class:"yun-text-light",p:"2"},O=c({__name:"albums",setup(i){const{t:e}=A(),t=L(),o=Y(t);$([k({"@type":"CollectionPage"})]);const s=w(()=>t.value.albums||[]);return(S,q)=>{const b=V,d=N,f=B("RouterView"),g=C;return a(),m(g,null,{"main-header":r(()=>[u(b,{title:n(o)||n(e)("title.album"),icon:n(t).icon||"i-ri-gallery-line",color:n(t).color},null,8,["title","icon","color"])]),"main-content":r(()=>[l("div",R,p(n(e)("counter.albums",s.value.length)),1),u(d,{albums:s.value},null,8,["albums"]),u(f)]),_:1})}}});export{O as default};
