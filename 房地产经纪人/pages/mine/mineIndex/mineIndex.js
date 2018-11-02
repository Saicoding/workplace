// pages/hasNoErrorShiti/hasNoErrorShiti.js

const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址
const app = getApp();

// start雷达图初始化数据
let numCount = 5;  //元素个数
let numSlot = 5;  //一条线上的总节点数
let windowWidth = wx.getSystemInfoSync().windowWidth; //窗口高度
let mW = wx.getSystemInfoSync().windowWidth;  //Canvas的宽度

let mCenter = mW / 2; //中心点
let mAngle = Math.PI * 2 / numCount; //角度
let mRadius = mCenter - 40*(750/windowWidth); //半径(减去的值用于给绘制的文本留空间)
//获取指定的Canvas
let radCtx = wx.createCanvasContext("radarCanvas")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    stepText: 5,
    chanelArray: [["章节题库", 0], ["视频学习", 0], ["套卷练习", 0],  ["考前秘籍", 0] ,["考点学习", 0]],

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    //获取是否有登录权限
    let self = this;

    let url = encodeURIComponent('/pages/mine/mineIndex/mineIndex');

    let user = wx.getStorageSync('user');

    if(user){
      self.setData({
        user:user
      })
    }else{
      wx.navigateTo({
        url: '/pages/login1/login1?url=' + url+'&ifGoBack=true',
      })
    }
  },

  onReady:function(){
    let self = this;
    wx.getSystemInfo({ //得到窗口高度,这里必须要用到异步,而且要等到窗口bar显示后再去获取,所以要在onReady周期函数中使用获取窗口高度方法
      success: function (res) { //转换窗口高度
        let windowHeight = res.windowHeight;
        let windowWidth = res.windowWidth;
        windowHeight = (windowHeight * (750 / windowWidth));
        self.setData({
          windowHeight: windowHeight,
          windowWidth:windowWidth,
        })
      }
    });
  },

  GOradar:function(){
    let kid = 257
    
    wx.navigateTo({
      url: '/pages/mine/mineRadar/mineRadar?kid='+kid,
    })
  },

  /**
   * 在返回页面的时候
   */
  onShow:function(){
    let user = wx.getStorageSync('user');
    this.setData({
      user:user
    })
  },
})