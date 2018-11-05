// pages/hasNoErrorShiti/hasNoErrorShiti.js

const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址
const app = getApp();
let animate = require('../../../common/animate.js');
let validate = require('../../../common/validate.js');
let easeOutAnimation = animate.easeOutAnimation();
let easeInAnimation = animate.easeInAnimation();
let jjrIsFold = true;
let xlIsFold = true;
let jjrAngle = 0;
let xlAngle =0;


// start雷达图初始化数据
let numCount = 5; //元素个数
let numSlot = 5; //一条线上的总节点数
let windowWidth = wx.getSystemInfoSync().windowWidth; //窗口高度
let mW = wx.getSystemInfoSync().windowWidth; //Canvas的宽度

let mCenter = mW / 2; //中心点
let mAngle = Math.PI * 2 / numCount; //角度
let mRadius = mCenter - 40 * (750 / windowWidth); //半径(减去的值用于给绘制的文本留空间)
//获取指定的Canvas
let radCtx = wx.createCanvasContext("radarCanvas")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    stepText: 5,
    nums:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    //获取是否有登录权限
    let self = this;

    let url = encodeURIComponent('/pages/mine/mineIndex/mineIndex');

    let user = wx.getStorageSync('user');

    if (user) {

      let url = encodeURIComponent('/pages/mine/mineIndex/mineIndex');

      self.setData({
        user: user
      })
    } else {
      wx.navigateTo({
        url: '/pages/login1/login1?url=' + url + '&ifGoPage=false',
      })
    }
  },

  toogleShow: function(e) {
    let self = this;
    let rate = e.currentTarget.dataset.rate;//点击的科目

    if (rate == "jjr") { //如果点击的是经纪人
      if (jjrIsFold){//如果是折叠状态
        let jjrFoldData = animate.foldAnimation(easeInAnimation, 380, 0);
        jjrIsFold  = false;
        let interval = setInterval(function(){
          jjrAngle += 3 ;
          if (jjrAngle >= 90){
            jjrAngle = 90;
            clearInterval(interval);
          }
          self.setData({
            jjrAngle: jjrAngle
          })
        },30)       
     
        self.setData({
          jjrFoldData: jjrFoldData,
        })
      }else{
        let jjrFoldData = animate.foldAnimation(easeOutAnimation, 0,380);
        jjrIsFold = true;
        let interval = setInterval(function () {
          jjrAngle -= 3;
          if (jjrAngle <= 0) {
            jjrAngle = 0;
            clearInterval(interval);
          }
          self.setData({
            jjrAngle: jjrAngle
          })
        }, 30)

        self.setData({
          jjrFoldData: jjrFoldData,
        })
      }
    }else{
      if (xlIsFold) {//如果是折叠状态
        let xlFoldData = animate.foldAnimation(easeInAnimation, 200, 0);
        xlIsFold = false;
        let interval = setInterval(function () {
          xlAngle += 3;

          if (xlAngle >= 90) {
            xlAngle = 90;
            clearInterval(interval);
          }
          self.setData({
            xlAngle: xlAngle
          })
        }, 30)

        self.setData({
          xlFoldData: xlFoldData,
        })
      } else {
        let xlFoldData = animate.foldAnimation(easeOutAnimation, 0, 200);
        xlIsFold = true;
        let interval = setInterval(function () {
          xlAngle -= 3;
          if (xlAngle <= 0) {
            xlAngle = 0;
            clearInterval(interval);
          }
          self.setData({
            xlAngle: xlAngle
          })
        }, 30)

        self.setData({
          xlFoldData: xlFoldData,
        })
      }  
    }
    
  },

  onReady: function() {
    let self = this;
    wx.getSystemInfo({ //得到窗口高度,这里必须要用到异步,而且要等到窗口bar显示后再去获取,所以要在onReady周期函数中使用获取窗口高度方法
      success: function(res) { //转换窗口高度
        let windowHeight = res.windowHeight;
        console.log(windowHeight)
        let windowWidth = res.windowWidth;
        windowHeight = (windowHeight * (750 / windowWidth));
        console.log(windowHeight)
        self.setData({
          windowHeight: windowHeight,
          windowWidth: windowWidth,
        })
      }
    });
  },
  /**
   * clearStorage
   */
  clearStorage:function(){
    wx.clearStorage();
  },

  /**
   * 导航到雷达页面
   */
  GOradar:function(e) {
    let kmid = e.currentTarget.dataset.kmid;
    let title = e.currentTarget.dataset.title;

    wx.navigateTo({
      url: '/pages/mine/mineRadar/mineRadar?kmid=' + kmid+"&title="+title,
    })
  },

  /**
   * 导航到消息页面
   */
  GOmessage:function(){
    let self = this;

    let url = encodeURIComponent('/pages/mine/message/message');
    let url1 = '/pages/mine/message/message';

    let user = self.data.user;
    let zcode = user.zcode;
    let LoginRandom = user.Login_random;
    let pwd = user.pwd

    validate.validateDPLLoginOrPwdChange(zcode, LoginRandom, pwd, url1, url,true)//验证重复登录

  },
  /**
   * 在返回页面的时候
   */
  onShow: function() {
    let self = this;
    let user = wx.getStorageSync('user');
    
    if (user != "") {
      let LoginRandom = user.Login_random;
      let zcode = user.zcode;
      let url = encodeURIComponent('/pages/mine/mineIndex/mineIndex');

      app.post(API_URL, "action=GetNoticesNums&LoginRandom=" + LoginRandom + "&zcode=" + zcode, false, true, "",url).then((res) => {
        console.log(res)
        let nums = res.data.nums;
        self.setData({
          nums: nums
        })
      })
    }

    this.setData({
      user: user
    })
  },
})