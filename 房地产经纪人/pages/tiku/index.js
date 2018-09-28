const API_URL = 'https://xcx2.chinaplat.com/';//接口地址
//const https = require('../../utils/util.js');
const app = getApp();

Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    //array: [{id:0,title:'无网络'}],
    index:0,
    flag:"哈哈"
  },
  /* 更改题库 */
  bindPickerChange: function (e) {
    var self = this
    //console.log('picker发送选择改变，携带值为', self.data.array[e.detail.value].id)
    self.setData({
      index: e.detail.value,
      zhangjie_id: self.data.array[e.detail.value].id
    })

    app.post(API_URL, "action=SelectZj_l&z_id=" + self.data.zhangjie_id).then((res) => {
      console.log(res);//正确返回结果
      self.setData({
        zhangjie: res.data.list
      })
      wx.hideLoading();
    }).catch((errMsg) => {
      console.log(errMsg);//错误提示信息
      wx.hideLoading();
    });
  
 },
 /**
  * 当点击章节
  */
  onTapZhangjie:function(e){
    let self = this;
    let index = e.currentTarget.dataset.itemidx;
    let zhangjie = self.data.zhangjie;
    //判断该章节的叠加状态
    let folder = self.data.zhangjie[index].isFolder
    if(folder == undefined){
      zhangjie[index].isFolder = true;
    }else if(folder){
      zhangjie[index].isFolder = false;
    }else{
      zhangjie[index].isFolder = true;
    }
    self.setData({
      zhangjie: zhangjie
    })
  },
  /**
   * 
   */
  stopTap:function(){
    return;
  },
  /**
   * 点击章节后，设置该章节对应的folder状态
   */
  setFolder:function(){

  },

 /*做题 */
  GOzuoti: function (e) {
    
      var z_id = e.currentTarget.id;
      //console.log(z_id);
      wx.setStorage({
        key: "id",
        data: "0"
      }),
        wx.navigateTo({
        url: 'zuoti/index?z_id='+z_id
        })
    
       
  },
   /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self=this
    
    //调用 app.js里的 post()方法
    app.post(API_URL, "action=SelectZj").then((res) => {
      console.log(res);//正确返回结果
      
      self.setData({
        array: res.data.list,
        zhangjie_id: res.data.list[0].id,
      })
      app.post(API_URL, "action=SelectZj_l&z_id=" + self.data.zhangjie_id).then((res) => {
        //console.log(res);//正确返回结果
        
        self.setData({
          zhangjie: res.data.list
        })  
        wx.hideLoading();
      }).catch((errMsg) => {
        console.log(errMsg);//错误提示信息
        wx.hideLoading();
      });
      
    }).catch((errMsg) => {
      console.log(errMsg);//错误提示信息
      wx.hideLoading();
    });
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