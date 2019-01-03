// pages/pay/pay.js
const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址
const app = getApp(); //获取app对象
let buttonClicked = false; //默认还没有点击可以导航页面的按钮
let md5 = require('../../common/MD5.js');
let time = require('../../common/time.js');
let leftTime = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    first: true, //默认第一次载入
    hasCompany:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let self = this;
    let goBack = options.goBack;
    let product = options.product;
    console.log(product)

    goBack = goBack == undefined ? "false" : goBack;

    let myproduct = {};

    if (product == 'DB16') {
      myproduct.title = "房地产经纪人冲刺套餐";
      myproduct.info = [
        '全科目章节练习',
        '考前秘笈',
        '历年真题/考前押题',
        '考前解析',
        '全科目网课'
      ]
    }else{
      myproduct.title = "经纪人协理冲刺套餐";
      myproduct.info = [
        '全科目章节练习',
        '考前秘笈',
        '历年真题/考前押题',
        '考前解析',
        '全科目网课'
      ]
    }


    self.setData({
      product: product
    })

    wx.getUserInfo({
      success: function(res) {
        let city = res.userInfo.city;
        app.post(API_URL, "action=getDlInfo&city=" + city, false, true, "").then((res) => {
          res.data.data = [];
          if (res.data.data.length == 0) { //如果没有城市代理
            wx.setNavigationBarColor({ //设置导航条颜色
              frontColor: "#ffffff",
              backgroundColor: "#6701c1",
              animation: {
                duration: 1000,
                timingFunc: 'easeIn'
              }
            })
            self.setData({ //设置成没有城市代理
              hasCompany: false,
              myproduct: myproduct
            })
          } else {
            let company = res.data.data[0].Name;
            let address = res.data.data[0].address == undefined ? "" : res.data.data[0].address;
            let tel = res.data.data[0].Tel
            self.setData({
              company: company,
              tel: tel,
              address: address,
              goBack: goBack,
              hasCompany: true
            })
          }
        })
      }
    })
  },

  /**
   * 拨打400电话
   */
  call400: function() {
    wx.makePhoneCall({
      phoneNumber: '400-6456-114' //仅为示例，并非真实的电话号码
    })
  },

  /**
   * 拨打电话
   */
  tel: function() {
    let phoneNumber = this.data.tel;
    wx.makePhoneCall({
      phoneNumber: phoneNumber //仅为示例，并非真实的电话号码
    })
  },

  /**
   * 生命周期事件
   */
  onReady: function() {
    let self = this;
    this.payDetail = this.selectComponent("#payDetail");

    wx.getSystemInfo({ //得到窗口高度,这里必须要用到异步,而且要等到窗口bar显示后再去获取,所以要在onReady周期函数中使用获取窗口高度方法
      success: function(res) { //转换窗口高度
        let windowHeight = res.windowHeight;
        let windowWidth = res.windowWidth;
        let platform = res.platform;
        windowHeight = (windowHeight * (750 / windowWidth));
        self.setData({
          windowWidth: windowWidth,
          windowHeight: windowHeight,
          platform: platform
        })
      }
    });
  },

  /**
   * 生命周期事件
   */
  onShow: function() {
    let self = this;

    buttonClicked = false;

    let interval = self.data.interval; //定时器
    // 个人信息
    let user = wx.getStorageSync('user');
    let loginrandom = user.Login_random;
    let zcode = user.zcode;

    let isReLoad = self.data.isReLoad; //是否是重复登录
    let first = self.data.first; //是否是第一次渲染页面
    let product = self.data.product; //产品类型

    if (user != "") { //如果user = "" 
      app.post(API_URL, "action=KanjiaInfo_sim&loginrandom=" + loginrandom + "&zcode=" + zcode + "&types=" + product, false, false, "", "", "", self).then(res => {
        let hasEndtime = true;
        let interval = "";
        let endtime = res.data.data[0].endtime;
        if (endtime == "") {
          hasEndtime = false
        }
        let money_now = res.data.data[0].money_now;

        //开始计时
        leftTime = time.leftTime2(endtime); //剩余时间(秒数)

        if (hasEndtime && first) { //如果已经有助力了
          interval = setInterval(res => {
            leftTime--;
            if (leftTime < 0){
              leftTime =0;
              self.setData({
                over:true
              })
            }
            let timeObj = time.getTimeObj(leftTime);
            self.setData({
              timeObj: timeObj
            })
          }, 1000);
        }
        console.log(money_now)

        self.setData({
          hasEndtime: hasEndtime,
          money_now: money_now.toString().split(""),
          interval: interval,
          first: !hasEndtime
        })
      })
    }
  },

  /**
   * 点击返回按钮
   */
  onUnload: function() {
    let goBack = this.data.goBack;
    if (goBack == "true") {
      wx.navigateBack({
        delta:2
      })
    }else{
      wx.navigateBack({})
    }
  },

  /**
   * 弹出支付详细信息
   */
  showPayDetail: function(e) {
    let product = e.currentTarget.dataset.product;

    if (product == "jjr") {
      this.payDetail.setData({
        product: "jjr"
      })
      this.payDetail.showDialog();
    } else {
      this.payDetail.setData({
        product: "xl"
      })
      this.payDetail.showDialog();
    }
  },


  /**
  * 提交支付
  */
  _submit: function (e) {
    let self = this;

    let product = "";
    let direct = e.currentTarget.dataset.type;

    if(direct){
      product = self.data.product;
    }else{
      product = e.detail.product;
    }

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

          console.log("action=unifiedorder&LoginRandom=" + Login_random + "&zcode=" + zcode + "&product=" + product + "&openid=" + openid)
          app.post(API_URL, "action=unifiedorder&LoginRandom=" + Login_random + "&zcode=" + zcode + "&product=" + product + "&openid=" + openid, true, false, "购买中").then((res) => {

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
                    app.post(API_URL, "action=BuyTC&LoginRandom=" + Login_random + "&zcode=" + zcode + "&product=" + product, true, false, "购买中").then((res) => {
                      let pages = getCurrentPages();
                      let prevPage = pages[pages.length - 2]; //上一个页面
                      prevPage.setData({
                        buied: product
                      })
                      wx.navigateBack({})
                      wx.showToast({
                        title: '购买成功',
                        icon: 'none',
                        duration: 3000
                      })
                    })
                  }
                },
                fail: function (res) { }
              }
              wx.requestPayment(myObject)
            }
          })
        })
      }
    })
  },
  /**
   * 导航到砍价页面
   */
  GOkanjia: function(e) {
    let taocan = e.currentTarget.dataset.taocan;

    wx.navigateTo({
      url: '/pages/pay/kanjia/kanjia?taocan=' + taocan + "&me=1",
    })
  }
})