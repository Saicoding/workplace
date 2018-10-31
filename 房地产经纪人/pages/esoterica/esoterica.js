// pages/hasNoErrorShiti/hasNoErrorShiti.js
const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址
const app = getApp(); //获取app对象
let validate = require('../../common/validate.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    wx.setNavigationBarTitle({
      title: "秘笈"
    }) //设置标题

    //先执行onload方法，如果没有登录信息就先进入登录界面，登录成功后又执行一次该方法，这时可以获取user值，
    let self = this;
    app.post(API_URL, "action=SelectZj").then((res) => {
      this.setZhangjie(res.data.list); //得到当前题库的缓存,并设置变量:1.所有题库数组 2.要显示的题库id 3.要显示的题库index
      app.post(API_URL, "action=GetKaodianList&kid=" + self.data.kaodian_id, true, true, "获取考点...").then((res) => {
        let kdList = res.data.list;//考点列表
        self.setData({
          kdList: kdList
        })
      })
    })
  },
  /**
   * onShow生命周期事件
   */
  onShow:function(){

  },

  bindPickerChange:function(e){
    let self = this;

    let index = e.detail.value//picker index
    let kaodian_id = self.data.array[e.detail.value].id;

    self.setData({
      index: index, //设置是第几个题库
      kaodian_id: kaodian_id, //设置章节的id编号
    })

    app.post(API_URL, "action=GetKaodianList&kid=" + self.data.kaodian_id, true, true, "获取考点...").then((res) => {
      let kdList = res.data.list;//考点列表

      //存储本次浏览的题库
      wx.setStorageSync("kaodian_id", {
        "id": kaodian_id,
        "index": index
      });
      self.setData({
        kdList: kdList
      })
    })
  },

  GOkaodianDetail:function(e){
    let kdid = e.currentTarget.dataset.kdid;

    let url = encodeURIComponent('/pages/kaodianDetail/kaodianDetail?kdid=' + kdid );
    let url1 =  '/pages/kaodianDetail/kaodianDetail?kdid=' + kdid;

    //获取是否有登录权限
    wx.getStorage({
      key: 'user',
      success: function (res) { //如果已经登陆过
        let user = res.data;
        let zcode = user.zcode;
        let LoginRandom = user.Login_random;
        let pwd = user.pwd
        validate.validateDPLLoginOrPwdChange(zcode, LoginRandom, pwd, url1, url)//验证重复登录
      },
      fail: function (res) { //如果没有username就跳转到登录界面
        wx.navigateTo({
          url: '/pages/login1/login1?url=' + url + "&ifGoBack=false",
        })
      }
    })
  },

    /**
   * 得到当前题库的缓存,并设置变量:1.所有题库数组 2.要显示的题库id 3.要显示的题库index
   */
  setZhangjie: function (res) {
    let kaodian_id = 0;
    let index = 0;
    let kaodian = wx.getStorageSync("kaodian_id");
    if (kaodian == "") {
      kaodian_id = res[0].id;
      index = 0;
    } else {
      kaodian_id = kaodian.id;
      index = kaodian.index;
    }

    this.setData({
      array: res,
      kaodian_id: kaodian_id,
      index: index
    })
  },
})