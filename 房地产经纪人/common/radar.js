// 绘制多边形边
function drawPolygon(ctx) {
  ctx.save();

  ctx.strokeStyle = mColorPolygon;
  var r = mRadius / mCount; //单位半径
  //画6个圈
  for (var i = 0; i < mCount; i++) {
    ctx.beginPath();
    var currR = r * (i + 1); //当前半径
    //画6条边
    for (var j = 0; j < mCount; j++) {
      var x = mCenter + currR * Math.cos(mAngle * j);
      var y = mCenter + currR * Math.sin(mAngle * j);

      ctx.lineTo(x, y);
    }
    ctx.closePath()
    ctx.stroke();
  }

  ctx.restore();
}

module.exports = {
  drawPolygon:drawPolygon
}
