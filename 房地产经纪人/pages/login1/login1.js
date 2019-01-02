const app = getApp();
const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址
let WXBizDataCrypt = require('../../utils/cryptojs/RdWXBizDataCrypt.js');
let appId = "wxf90a298a65cfaca8";
let secret = "4bb3fe58d349718b6832c04bf462d832";
let buttonClicked = false;

// pages/login1/login1.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openId: '', //用户唯一标识  
    unionId: '',
    encryptedData: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    let self = this;
    let redirect = options.redirect == undefined ? "" : options.redirect;//是否直接转
    this.setData({
      url: decodeURIComponent(options.url),
      url1: options.url,
      ifGoPage: options.ifGoPage,
      redirect: redirect
    })

    wx.login({
      success: res => {
        let code = res.code;
        app.post(API_URL, "action=getSessionKey&code=" + code, false, false, "").then((res) => {
          let sesstion_key = res.data.sessionKey;
          let openid = res.data.openid;

          wx.getUserInfo({
            success: function (res) {
              let wxid = ""; //openId
              let session_key = ""; //

              let encryptedData = res.encryptedData;
              let iv = res.iv;
              let signature = res.signature; //签名
              let nickname = res.userInfo.nickName; //昵称
              let headurl = res.userInfo.avatarUrl; //头像
              let sex = res.userInfo.gender //性别

              //拿到session_key实例化WXBizDataCrypt（）这个函数在下面解密用
              let pc = new WXBizDataCrypt(appId, sesstion_key);
              let data = pc.decryptData(encryptedData, iv);
              let unionid = data.unionId;
              self.setData({
                unionid: unionid,
                loaded:true,
                nickname: nickname,
                headurl: headurl,
                sex: sex,
                openid: openid
              })
            }
          })
        })
      }
    })
  },
  /**
   * 手机登录
   */
  userPwdLogin: function(e) {
    wx.navigateTo({
      url: '/pages/phoneLogin/phoneLogin?url=' + this.data.url1 + '&ifGoPage=' + this.data.ifGoPage,
    })
  },

  /**
   * 微信授权登录
   */
  wxLogin: function(e) {
    let self = this;
    let loaded = self.data.loaded;

    //限制连续点击
    if (buttonClicked && !loaded) return;
    buttonClicked = true;

    let wxid = ""; //openId
    let session_key = ""; //
    let ifGoPage = self.data.ifGoPage //是否返回上一级菜单
    let redirect = self.data.redirect;//是否直接转
    let url = self.data.url; //需要导航的url

    let openid = self.data.openid;
    let nickname = self.data.nickname;
    let headurl = self.data.headurl;
    let sex = self.data.sex;
    let unionId = self.data.unionid;

    console.log("action=Login_wx&unionId=" + unionId + "&openid=" + openid + "&nickname=" + nickname + "&headurl=" + headurl + "&sex=" + sex)

    app.post(API_URL, "action=Login_wx&unionId=" + unionId + "&openid=" + openid + "&nickname=" + nickname + "&headurl=" + headurl + "&sex=" + sex, true, false, "登录中").then((res) => {
      console.log('ok')

      let user = res.data.list[0];

      wx.setStorage({
        key: 'user',
        data: user
      })

      wx.navigateBack({}) //先回到登录前的页面

      if (ifGoPage == 'true') {
        if (redirect == 'true'){
          console.log(url)
          wx.redirectTo({//是直接跳转
            url: url,
          })
        }else{
          wx.navigateTo({
            url: url,
          })
        }
      }

    })
  },
})