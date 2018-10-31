// pages/kaodianDetail/kaodianDetail.js
const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址
const app = getApp(); //获取app对象
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fontSize:30,//默认字体大小
    day:true,//白天还是黑天
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let self = this;
    let kdid = options.kdid;
    
    let user = wx.getStorageSync("user");
    let username = user.username;
    let acode = user.acode;

    app.post(API_URL,"action=GetKaodianShow&username="+username+"&acode="+acode+"&kdid="+kdid,true,true,"载入中").then((res)=>{
      let data = res.data.data[0];
      let content = data.content;
      let nextId = data.nextId;
      let proId = data.proId;

 
      self.setData({
        content:content,
        nextId: nextId,
        proId: proId,
        user:user
      })
    })
  },

  /**
   * 滑块变动事件
   */

  sliderChange:function(e){
    let value = e.detail.value;
    this.setData({
      fontSize:value
    })
  },

  toogleDay:function(){
    this.setData({
      day:!this.data.day
    })
  },

  /**
   * 点击上一题或者下一题
   */
  select:function(e){
    let self = this;

    let user = self.data.user;
    let username = user.username;
    let acode = user.acode;
    let preNext = e.currentTarget.dataset.prenext;
    let nextId = self.data.nextId;
    let proId = self.data.proId;
    let kdid = "";

    if (preNext == 0){//点击上一题
      if(proId == 0){
        wx.showToast({
          title: '没有上一题',
          icon: 'none',
          duration:3000
        })
        return;
      }
      kdid = proId;
    }

    if(preNext == 1){//点击了下一题
      if(nextId == 0){
        wx.showToast({
          title: '没有下一题',
          icon: 'none',
          duration: 3000
        })
        return;
      }
      kdid = nextId;
    }

    console.log("action=GetKaodianShow&username=" + username + "&acode=" + acode + "&kdid=" + kdid)
  
    app.post(API_URL, "action=GetKaodianShow&username=" + username + "&acode=" + acode + "&kdid=" + kdid, true, true, "载入中").then((res) => {
      let data = res.data.data[0];
      let content = data.content;
      let nextId = data.nextId;
      let proId = data.proId;

      self.setData({
        content: content,
        nextId: nextId,
        proId: proId,
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})