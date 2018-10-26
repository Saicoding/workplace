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
    let self = this;
    let user = wx.getStorageSync('user');
    let username = user.username;
    let acode = user.acode;
    let tiType = options.ti == "model"?1:2;//获取题的类型
    let title = options.ti == "model" ?"模拟真题":"考前押题";
    wx.setNavigationBarTitle({
      title: title
    }) //设置标题

    let px = 1;

    app.post(API_URL, "action=GetTestlist&kid=" + options.kid + "&username=" + username + "&acode=" + acode + "&types=" + tiType, true, true, "加载中").then((res) => {
      let modelList = res.data.list;
      console.log(modelList)
      if(modelList.length == 0){//如果没有题库
        console.log(modelList)
        wx.navigateTo({
          url: '/pages/prompt/hasNoShiti/hasNoShiti?str=没有' + title + '题库&title=' + title +"&delta=1",
        })
      }

      for (let i = 0; i < modelList.length; i++) { 
        let model = modelList[i];

        //设置title前面小圆的颜色
        switch (i % 3) {
          case 0:
            model.bgColor = "#eb3d49";
            break;
          case 1:
            model.bgColor = "#45e6d7";
            break;
          case 2:
            model.bgColor = "#ffc740";
            break;
        }

        //设置分数字体颜色
        let score = model.test_score;

        model.ifDone = score == 0 ?false:true;

        model.scoreColor = score >= 60 ? "#59a22e" : "#f35f70";

      }

      self.setData({
        modelList: modelList, //真题列表
        tiType:tiType//题的类型（押题，真题）
      })
    }).catch((errMsg) => {
      console.log(errMsg); //错误提示信息
      wx.navigateTo({
        url: '/pages/prompt/hasNoShiti/hasNoShiti?str=没有'+title+'题库',
      })
      wx.hideLoading();
    });
  },

  GOModelRealDetail: function(e) {
    let self = this;
    self.waterWave.containerTap(e); //水波效果

    let id = e.currentTarget.dataset.id;
    let test_score = e.currentTarget.dataset.test_score;
    let times = e.currentTarget.dataset.times;
    let title = e.currentTarget.dataset.title;
    let totalscore = e.currentTarget.dataset.totalscore;
    let tiType = self.data.tiType;

    let url = '/pages/tiku/modelReal/modelRealDetail/modelRealDetail?id=' + id + "&times=" + times + "&title=" + title + "&totalscore=" + totalscore + "&tiType=" + tiType + "&test_score=" + test_score;

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