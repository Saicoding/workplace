function easeOutAnimation(){
  let myAnimation = wx.createAnimation({
    duration: 1000,
    delay: 0,
    timingFunction: "ease-out",
    transformOrigin: "50%,50%"
  })

  return myAnimation;
}

function easeInAnimation() {
  let myAnimation = wx.createAnimation({
    duration: 1000,
    delay: 0,
    timingFunction: "ease-in",
    transformOrigin: "50%,50%"
  })

  return myAnimation;
}


function foldAnimation(myAnimation,max,min){
  myAnimation.height(max+"rpx", min+"rpx").step({
    duration: 1000,
  })
  return myAnimation.export();
}

function rotateAnimation(myAnimation,angle){
  myAnimation.rotateZ(angle);
  return myAnimation.export();
}

/**
 * 移动动画
 */
function moveX(myAnimation,width,x){
  myAnimation.width(width).translateX(x).step({
    duration: 500,
  });
  return myAnimation.export();
}

module.exports = {
  easeOutAnimation: easeOutAnimation,
  easeInAnimation: easeInAnimation,
  foldAnimation: foldAnimation,
  rotateAnimation: rotateAnimation,
  moveX: moveX
}