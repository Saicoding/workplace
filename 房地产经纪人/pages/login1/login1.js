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
   * 用户密码登录
   */
  userPwdLogin: function() {
    wx.navigateTo({
      url: '/pages/phoneLogin/phoneLogin?url=' + this.data.url1 + '&ifGoBack=' + this.data.ifGoBack,
    })
  },

  /**
   * 微信授权登录
   */
  wxLogin: function(e) {
    let self = this;
    let code = "";
    let iv = e.detail.iv; //偏移量
    let encryptedData = e.detail.encryptedData;//
    let signature = e.detail.signature; //签名
    let nickname = e.detail.userInfo.nickName; //昵称
    let headurl = e.detail.userInfo.avatarUrl; //头像
    let sex = e.detail.userInfo.gender//性别
    let wxid = ""; //openId
    let session_key = ""; //
    let ifGoBack = self.data.ifGoBack //是否返回上一级菜单

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
          let data = pc.decryptData(encryptedData,iv);
          let unionId = data.unionId;

          console.log("action=Login_wx&unionId=" + unionId + "&openid=" + openid + "&nickname=" + nickname + "&headurl=" + headurl + "&sex=" + sex)
          app.post(API_URL, "action=Login_wx&unionId="+unionId+"&openid="+openid+"&nickname=" + nickname + "&headurl=" + headurl + "&sex=" + sex , true, false, "登录中").then((res) => {
            console.log(res)
            let user = res.data.list[0];
            console.log(user)
            wx.setStorage({
              key: 'user',
              data: user
            })

            // wx.hideLoading();
            if (ifGoBack == 'true') {
              wx.navigateBack({})
            } else {
              wx.redirectTo({
                url: self.data.url,
              })
            }
          })
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      url: decodeURIComponent(options.url),
      url1: options.url,
      ifGoBack: options.ifGoBack
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})