// pages/tiku/modelReal/modelRealList/modelRealList.js
const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址
const app = getApp(); //获取app对象
let common = require('../../../../common/shiti.js');
const util = require('../../../../utils/util.js')

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
    wx.setNavigationBarTitle({
      title: '模拟真题'
    }) //设置标题
    let self = this;
    let user = wx.getStorageSync('user');
    let username = user.username;
    let acode = user.acode;

    let px = 1;
    app.post(API_URL, "action=GetTestlist&kid=" + options.kid + "&username=" + username + "&acode=" + acode + "&types=" + 1, true,true, "加载中").then((res) => {
      let modelList = res.data.list;

      self.setData({
        modelList: modelList, //真题列表
      })
    })
  },

  GOModelRealDetail: function(e) {
    let self = this;
    self.waterWave.containerTap(e); //水波效果

    let id = e.currentTarget.dataset.id;
    let test_score = e.currentTarget.dataset.test_score;
    let times = e.currentTarget.dataset.times;
    let title = e.currentTarget.dataset.title;
    let totalscore = e.currentTarget.dataset.totalscore;

    let url = '/pages/tiku/modelReal/modelRealDetail/modelRealDetail?id=' + id  + "&times=" + times + "&title=" + title+"&totalscore="+totalscore;

    wx.navigateTo({
      url: url,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.waterWave = this.selectComponent("#waterWave"); //水波
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