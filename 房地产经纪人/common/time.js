/**
 * 通过已经过去的时间得到花费时间的字符串
 * 参数:
 *    1.goneTime  5533311
 */
function getGoneTimeStr(goneTime){
  let h = parseInt(goneTime / 3600);
  let m = parseInt((goneTime  - h * 3600) / 60);
  let s = goneTime  % 60;

  let hStr = h == 0 ? "" : h + "小时";
  let mStr = (m == 0 && h == 0) ? "" : m + "分钟";
  let sStr = s + "秒";

  return hStr + mStr + sStr;//时间字符串
}

/**
 * 得到时间对象
 * {h:18,m:16:s15}
 */
function getTime(t) {
  let h = parseInt(t / 3600);
  let m = parseInt((t - h * 3600) / 60);
  let s = t % 60;
  let time = {
    h: h,
    m: m,
    s: s
  }
  return time;
}

module.exports = {
  getGoneTimeStr: getGoneTimeStr,
  getTime: getTime
}