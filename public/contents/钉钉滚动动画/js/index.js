const dom_list = document.querySelector('.list')
const dom_items= document.querySelectorAll('.item')
const dom_con = document.querySelector('.con')
const dom_playGround = document.querySelector('.ground-box')
//get animation state by scroll
function createAnimation(startY,endY,startVal,endVal) {
 return (scrollY)=>{
  if (scrollY<startY) return startVal
  if (scrollY>endY) return endVal

  return startVal + (endVal-startVal)*(scrollY -startY)/(endY-startY)
 }
}

// animation map
const animationMap = new Map()
const OFFSET = 300
function getDomAnimation(scrollStart,scrollEnd,dom) {
// 控制运动速率
  scrollStart+=dom.dataset.order*OFFSET

  const opacityAnimation = createAnimation(scrollStart,scrollEnd,0,1)
  const translateX = dom_list.clientWidth/2 - dom.clientWidth/2 - dom.offsetLeft
  const translateY = dom_list.clientHeight/2 - dom.clientHeight/2 - dom.offsetTop 
  const translateXAniamtion = createAnimation(scrollStart,scrollEnd,translateX,0)
  const translateYAniamtion = createAnimation(scrollStart,scrollEnd,translateY,0)
  const opacity = (scroll)=>{
    const opacityVal = opacityAnimation(scroll)
   return  opacityVal
  }
  const transform = (scroll)=>{
    const transLateXVal = translateXAniamtion(scroll)
    const transLateYVal = translateYAniamtion(scroll)
    return `translate(${transLateXVal}px,${transLateYVal}px)`
  }
  return {
    opacity,
    transform
  }
}
const getContainerAnimation = (scrollStart,scrollEnd,dom)=>{
  const opacityAnimation = createAnimation(scrollStart,scrollEnd,0,1)
  
  const scale = createAnimation(scrollStart,scrollEnd,0.8,1)


  const opacity = (scroll)=>{
  const opacityVal = opacityAnimation(scroll)
   return  opacityVal
  }
  const transform = (scroll)=>{
    const scaleVal = scale(scroll)
    return `scale(${scaleVal})`
  }
  return {
    opacity,
    transform
  }
}
const updateMap = ()=>{
  animationMap.clear()
  const playGroungdReact = dom_playGround.getBoundingClientRect()
  const scrollStart = playGroungdReact.top + window.scrollY
  const scrollEnd = playGroungdReact.bottom + window.scrollY - window.innerHeight
  for (const item of dom_items) {
    animationMap.set(item,getDomAnimation(scrollStart,scrollEnd,item))
  }
// 设置box动画
  const con_scrollStart =scrollEnd - dom_con.clientHeight/2
  const con_scrollEnd = scrollEnd 
  animationMap.set(dom_con,getContainerAnimation(con_scrollStart,con_scrollEnd,dom_con))
  console.log(1111,animationMap);
}
updateMap()
const updateStyle = ()=>{
  const scroll = window.scrollY
  for (const [dom,value] of animationMap) {
    for (const prop in value) {
      if (Object.hasOwnProperty.call(value, prop)) {
        dom.style[prop] = value[prop](scroll)
      }
    }
    
  }
}
updateStyle()

window.addEventListener('scroll',updateStyle)
const init  = ()=>{
  animationMap.clear()
}