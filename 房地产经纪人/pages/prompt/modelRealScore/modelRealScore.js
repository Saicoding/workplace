// pages/prompt/modelRealScore/modelRealScore.js
let common = require('../../../common/shiti.js');

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
    wx.setNavigationBarTitle({ title: "考试成绩" })  //设置标题
    let self = this;
    let user = wx.getStorageSync('user');
    let id = options.id;//试题的id号，用于本地存储的key
    let pic = user.Pic;//头像
    let nickName = user.Nickname;//昵称
    let score = options.score;//得分
    let rightNums = options.rightNums;//正确数
    let wrongNums = options.wrongNums;//错误数
    let undone = options.undone;//未做
    let totalscore = options.totalscore;//总分
    let ifGood = score >= totalscore * 60 / 100 ? '合格':'不合格';


    self.setData({
      pic:pic,
      nickName:nickName,
      score:score,
      rightNums:rightNums,
      wrongNums:wrongNums,
      undone:undone,
      id:id,
      totalscore: totalscore,
      ifGood:ifGood
    })
  },

  restart:function(){
    let self = this;
    let pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];  //上一个页面
    common.restartModelReal(prevPage);
    wx.navigateBack({})

  },

  viewWrong:function(){
    let self = this;
    let pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];  //上一个页面
    let doneAnswerArray = prevPage.data.doneAnswerArray;
    let nums = prevPage.data.nums;
    let isModelReal = prevPage.data.isModelReal;
    let shiti = prevPage.data.shiti;

    wx.setStorage({
      key: 'modelRealIsSubmit'+self.data.id,
      data: true,
    })
    
    if (shiti.done_daan == ""){//如果没作答，就显示正确答案
      common.changeModelRealSelectStatus(shiti.answer, shiti, prevPage)//改变试题的图片状态(有错误提示)
    }else{
      common.changeSelectStatus(shiti.done_daan, shiti, prevPage)//改变试题的图片状态(有错误提示)
    }
    common.setMarkAnswerItems(doneAnswerArray, nums, isModelReal, true, prevPage)//设置答题板状态

    prevPage.setData({
      isSubmit:true,
      text:"重新评测",
      shiti:shiti
    })

    wx.navigateBack({})
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})