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
    let gone_time = options.gone_time;//花费时间
    let rightNums = options.rightNums;//正确数
    let wrongNums = options.wrongNums;//错误数
    let undone = options.undone;//未做
    let totalscore = options.totalscore;//总分
    let ifGood = score >= totalscore * 60 / 100 ? '合格':'不合格';
    let jibai = options.jibai;//击败用户

    //得到花费时间的字符串
    let h = parseInt(gone_time / 3600);
    let m = parseInt((gone_time - h * 3600) / 60);
    let s = gone_time % 60;

    let hStr = h == 0?"":h+"小时";
    let mStr = (m == 0 && h ==0)?"":m+"分钟";
    let sStr = s+"秒";

    let timeStr = hStr + mStr + sStr;//时间字符串


    self.setData({
      pic:pic,
      nickName:nickName,
      score:score,
      rightNums:rightNums,
      wrongNums:wrongNums,
      undone:undone,
      id:id,
      timeStr:timeStr,
      totalscore: totalscore,
      ifGood:ifGood,
      jibai:jibai
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

    console.log(prevPage.data.interval)

    clearInterval(prevPage.data.interval);
    
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

    //设置用时
    wx.setStorage({
      key: prevPage.data.tiTypeStr + "last_gone_time" + self.data.id,
      data: "用时" + self.data.timeStr,
    })

    prevPage.modelCount.setData({//设置时间显示为花费时间
      timeStr:"用时"+self.data.timeStr
    })

    wx.navigateBack({})
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})