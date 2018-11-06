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
    let self = this;
    wx.getUserInfo({
      success: function(res) {
        let city = res.userInfo.city;
        app.post(API_URL, "action=getDlInfo&city=" + city, false, true, "").then((res) => {
          if (res.data.data.length == 0) { //如果没有城市代理
            self.setData({ //设置成没有城市代理
              hasCompany: false
            })
          } else {
            let company = res.data.data[0].Name;
            let tel = res.data.data[0].Tel
            self.setData({
              company: company,
              tel: tel,
              hasCompany: true
            })
          }
        })
      }
    })
  },

  /**
   * 购买套餐
   */
  buy: function(e) {
    let self = this;

    let product = e.currentTarget.dataset.product;

  },

  /**
   * 拨打400电话
   */
  call400:function(){
    wx.makePhoneCall({
      phoneNumber: '400-6456-114' //仅为示例，并非真实的电话号码
    })
  },

  /**
   * 拨打电话
   */
  tel:function(){
    let phoneNumber = this.data.tel;
    wx.makePhoneCall({
      phoneNumber: phoneNumber //仅为示例，并非真实的电话号码
    })
  },

  /**
   * 生命周期事件
   */
  onReady:function(){
    let self = this;
    this.payJJRDetail = this.selectComponent("#payJJRDetail");
    this.payXLDetail = this.selectComponent("#payXLDetail");

    wx.getSystemInfo({ //得到窗口高度,这里必须要用到异步,而且要等到窗口bar显示后再去获取,所以要在onReady周期函数中使用获取窗口高度方法
      success: function (res) { //转换窗口高度
        let windowHeight = res.windowHeight;
        let windowWidth = res.windowWidth;
        windowHeight = (windowHeight * (750 / windowWidth));
        self.setData({
          windowWidth: windowWidth,
          windowHeight: windowHeight
        })
      }
    });
  },

  /**
   * 点击返回按钮
   */
  onUnload: function() {
    let pages = getCurrentPages();
    console.log(pages)
    wx.navigateBack({
      delta: 1
    })
  },

  /**
   * 弹出支付详细信息
   */
  showPayDetail:function(e){
    let product = e.currentTarget.dataset.product;

    if (product == "jjr"){
      this.payJJRDetail.showDialog();
    }else{
      this.payXLDetail.showDialog();
    }

    this.setData({
      product: product
    })
  },

  /**
   * 提交支付
   */
  _submit:function(){
    let self = this;

    let product = self.data.product;
    let code = "";
    let user = wx.getStorageSync('user');
    let Login_random = user.Login_random; //用户登录随机值
    let zcode = user.zcode; //客户端id号

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        code = res.code;
        app.post(API_URL, "action=getSessionKey&code=" + code, true, false, "购买中").then((res) => {
          let openid = res.data.openid;

          app.post(API_URL, "action=unifiedorder&LoginRandom=" + Login_random + "&zcode=" + zcode + "&product=" + product + "&openid=" + openid, true, false, "购买中").then((res) => {
            console.log('可以')
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
                success: function (res) {
                  if (res.errMsg == "requestPayment:ok") { //成功付款后
                    app.post(API_URL, "action=BuyTC&LoginRandom=" + Login_random + "&zcode=" + zcode + "&product=" + product, true, false, "购买中", ).then((res) => {
                      wx.navigateBack({
                        delta: 2
                      })
                    })
                  }
                },
                fail: function (res) {
                  console.log(res)
                }
              }
              wx.requestPayment(myObject)
            }
          })

        })
      }
    })
  }
})