// pages/pay/kanjia/kanjia.js
const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址
const app = getApp(); //获取app对象
let time = require('../../../common/time.js');
let leftTime = 0;

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
    let me = options.me; //是不是本人进的页面

    let kan_id = "4";
    me = me == "1" ? 1 : 0
    let user = wx.getStorageSync('user');
    let loginrandom = user.Login_random;
    let zcode = user.zcode;
    let jiasuUsers = [{
        'pic': user.Pic,
        'nickname': user.Nickname
      },
      {
        'pic': user.Pic,
        'nickname': user.Nickname
      },
      {
        'pic': user.Pic,
        'nickname': user.Nickname
      },
      {
        'pic': user.Pic,
        'nickname': user.Nickname
      },
      {
        'pic': user.Pic,
        'nickname': user.Nickname
      },
      {
        'pic': user.Pic,
        'nickname': user.Nickname
      },
      {
        'pic': user.Pic,
        'nickname': user.Nickname
      }
    ]

    app.post(API_URL, "action=KanjiaInfo&kan_id=" + kan_id, false, false, "").then(res => {
      let result = res.data.data[0]

      let endtime = result.endtime; //砍价截止时间
      let title = result.title; //抢购产品
      // let money_now = result.money_now; //现在的价格
      let money_now = 4200; 
      let money_zong = result.money_zong; //总价格

      let nowLength = self.getPostionOjb(money_now, money_zong);
      
      console.log(nowLength)

      let kan_list = result.kan_list;

      //开始计时
      leftTime = time.leftTime2(endtime); //剩余时间(秒数)

      let interval = setInterval(res => {
        leftTime--;
        let timeObj = time.getTimeObj(leftTime);
        self.setData({
          timeObj: timeObj
        })
      }, 1000);


      self.setData({
        jiasuUsers: jiasuUsers,
        me: me,
        endtime: endtime,
        nowLength: nowLength,
        interval: interval,
        title: title,
        money_now: money_now,
        money_zong: money_zong
      })

    })
  },

  getPostionOjb: function(money_now, money_zong) {
    let postionObj = {};
    let length = 300; //最多可以砍的距离
    let sub = money_zong - money_now;

    // 可以砍到的最低价格
    let lowestPrice = money_zong *30/100;

    // 现在砍的进度
    let rate = sub / lowestPrice;

    // 现在砍的距离
    let nowLength = Math.ceil(length * rate);
    return nowLength;
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
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    let interval = this.data.interval;
    clearInterval(interval);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})