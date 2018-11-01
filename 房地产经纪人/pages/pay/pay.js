// pages/pay/pay.js
const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址
const app = getApp(); //获取app对象
let md5 = require('../../common/MD5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 购买套餐
   */
  buy: function(e) {
    let product = e.currentTarget.dataset.product;
    wx.getStorage({
      key: 'user',
      success: function(res) {
        let user = res.data;
        let Login_random = user.Login_random; //用户登录随机值
        let zcode = user.zcode; //客户端id号

        console.log("action=unifiedorder&LoginRandom=" + Login_random + "&zcode=" + zcode + "&product=" + product)
        app.post(API_URL, "action=unifiedorder&LoginRandom=" + Login_random + "&zcode=" + zcode + "&product=" + product, true, false, "购买中").then((res) => {
          let status = res.data.status;

          if (status == 1) {
            let timestamp = Date.parse(new Date());
            timestamp = timestamp / 1000;
            timestamp = timestamp.toString();
            let nonceStr = "TEST";
            let prepay_id = res.data.prepay_id;
            let appId = "wxf90a298a65cfaca8";
            let myPackage = "prepay_id=" + prepay_id;
            let key = "e625b97ae82c3622af5f5a56d1118825";

            let str = "appId=" + appId + "&nonceStr=" + nonceStr + "&package=" + myPackage + "&signType=MD5&timeStamp=" + timestamp + "&key=" + key;
            let paySign = md5.md5(str).toUpperCase();

            let myObject = {
              'timeStamp': timestamp,
              'nonceStr': nonceStr,
              'package': myPackage,
              'paySign': paySign,
              'signType': "MD5",
              success: function(res) {
                if (res.errMsg == "requestPayment:ok") { //成功付款后
                  console.log("action=BuyTC&LoginRandom=" + Login_random + "&zcode=" + zcode + "&product=" + product)
                  app.post(API_URL, "action=BuyTC&LoginRandom=" + Login_random + "&zcode=" + zcode + "&product=" + product, true, false, "购买中",).then((res) => {
                    wx.navigateBack({
                      delta: 2
                    })
                  })
                }
              },
              fail: function(res) {
                console.log(res)
              }
            }

            wx.requestPayment(myObject)
          }
        })
      },
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {


  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 点击返回按钮
   */
  onUnload:function(){
    let pages = getCurrentPages();
    console.log(pages)
    wx.navigateBack({
      delta:1
    })
  }

})