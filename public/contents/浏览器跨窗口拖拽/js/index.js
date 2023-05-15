const dom_card = document.querySelector('.card')
const channel = new BroadcastChannel('channel')
// 通过屏幕坐标获取视口坐标
const getClientPoint = ([sx,sy])=>{
  const cx = sx - window.screenX
  const cy = sy - window.screenY -79
  return [cx,cy]
}
const getScreenPoint = ([cx,cy])=>{
  const sx = cx + window.screenX
  const sy = cy + window.screenY + 79
  return [sx,sy]
}
// 拖拽
dom_card.onmousedown = (e)=>{
  const boxX = e.pageX - dom_card.offsetLeft
  const boxY = e.pageY - dom_card.offsetTop
  window.onmousemove = (e2)=>{
    const cx = e2.pageX - boxX
    const cy = e2.pageY - boxY
    dom_card.style.left = cx +'px'
    dom_card.style.top = cy +'px'
    channel.postMessage(getScreenPoint([cx,cy]))
  }
  window.onmouseup = ()=>{
    window.onmouseup = null
    window.onmousemove = null
  }
}

channel.onmessage = (e)=>{
  dom_card.style.display = 'block'
  const [cx,cy] = getClientPoint(e.data)
  dom_card.style.left = cx + 'px'
  dom_card.style.top = cy + 'px'
}

const init = ()=>{
  if (location.search.includes('hidden')) {
    dom_card.style.display = 'none'
  }
}
init()