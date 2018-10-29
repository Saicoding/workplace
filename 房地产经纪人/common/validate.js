const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址
const app = getApp();

/**
 * 验证重复登录或密码修改
 */
function validateDPLLoginOrPwdChange(zcode, LoginRandom, pwd, url1,url) {
  console.log("action=CheckAccount&zcode=" + zcode + "&LoginRandom=" + LoginRandom + "&pwd=" + pwd)
  app.post(API_URL, "action=CheckAccount&zcode=" + zcode + "&LoginRandom=" + LoginRandom + "&pwd=" + pwd, false, false, "").then((res) => {
    let status = res.data.status;
    console.log(status)
    if(status == 1){//验证成功
      wx.navigateTo({
        url: url1
      })
    }
  }).catch((errMsg) => {
    wx.navigateTo({
      url: '/pages/login1/login1?url=' + url+"&ifGoBack=false",
    })
  });
}

module.exports = {
  validateDPLLoginOrPwdChange:validateDPLLoginOrPwdChange
}