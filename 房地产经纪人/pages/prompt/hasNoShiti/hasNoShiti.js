// pages/hasNoErrorShiti/hasNoErrorShiti.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      str:options.str//提示字符串
    })
  },

  goBack:function(){
    wx.navigateBack({
      delta: 1
    })
  },

  onUnload:function(){
    wx.navigateBack({
      delta: 1
    })
  }
})