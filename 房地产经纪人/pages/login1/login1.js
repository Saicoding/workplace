const app = getApp();
const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址
let WXBizDataCrypt = require('../../utils/cryptojs/RdWXBizDataCrypt.js');
let appId = "wxf90a298a65cfaca8";
let secret = "4bb3fe58d349718b6832c04bf462d832";

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
    this.setData({
      url: decodeURIComponent(options.url),
      url1: options.url,
      ifGoPage:options.ifGoPage
    })
  },
  /**
   * 用户密码登录
   */
  userPwdLogin: function() {
    wx.navigateTo({
      url: '/pages/phoneLogin/phoneLogin?url=' + this.data.url1 + '&ifGoPage=' + this.data.ifGoPage,
    })
  },

  /**
   * 微信授权登录
   */
  wxLogin: function(e) {
    let self = this;
    let code = "";
    let iv = e.detail.iv; //偏移量
    let encryptedData = e.detail.encryptedData; //
    let signature = e.detail.signature; //签名
    let nickname = e.detail.userInfo.nickName; //昵称
    let headurl = e.detail.userInfo.avatarUrl; //头像
    let sex = e.detail.userInfo.gender //性别
    let wxid = ""; //openId
    let session_key = ""; //
    let ifGoPage = self.data.ifGoPage //是否返回上一级菜单
    let url = self.data.url;//需要导航的url

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        code = res.code;

        //得到openId和session_key
        app.post(API_URL, "action=getSessionKey&code=" + code, true, false, "登录中").then((res) => {
          let sesstion_key = res.data.sessionKey;
          let openid = res.data.openid;

          //拿到session_key实例化WXBizDataCrypt（）这个函数在下面解密用
          let pc = new WXBizDataCrypt(appId, sesstion_key);
          let data = pc.decryptData(encryptedData, iv);
          let unionId = data.unionId;

          console.log("action=Login_wx&unionId=" + unionId + "&openid=" + openid + "&nickname=" + nickname + "&headurl=" + headurl + "&sex=" + sex)
          app.post(API_URL, "action=Login_wx&unionId=" + unionId + "&openid=" + openid + "&nickname=" + nickname + "&headurl=" + headurl + "&sex=" + sex, true, false, "登录中").then((res) => {
            console.log(res)
            let user = res.data.list[0];
            console.log(user)
            wx.setStorage({
              key: 'user',
              data: user
            })

            wx.navigateBack({}) //先回到登录前的页面

            if (ifGoPage == 'true') {
              wx.navigateTo({
                url: url,
              })
            } 
          })
        })
      }
    })
  },
})