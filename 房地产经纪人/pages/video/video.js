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
  onLoad: function () {
    wx.setNavigationBarTitle({
      title: "视频"
    }) //设置标题
    this.setData({
      str: "开发中，即将上线"
    })
  },
})