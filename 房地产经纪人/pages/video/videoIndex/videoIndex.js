// pages/hasNoErrorShiti/hasNoErrorShiti.js
const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址
const app = getApp();
let animate = require('../../../common/animate.js');
let easeOutAnimation = animate.easeOutAnimation();
let easeInAnimation = animate.easeInAnimation();


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
    //获取是否有登录权限
    let self = this;

    // self.setData({
    //   product:"jjr"
    // })

    // let url = encodeURIComponent('/pages/video/videoIndex/videoIndex');

    // let user = wx.getStorageSync('user');

    // if (user) {
    //   self.setData({
    //     user: user
    //   })
    // } else {
    //   wx.navigateTo({
    //     url: '/pages/login1/login1?url=' + url + '&ifGoPage=false',
    //   })
    // }
  },

  /**
   * 生命周期事件
   */
  onReady:function(){
    let self = this;
    wx.getSystemInfo({ //得到窗口高度,这里必须要用到异步,而且要等到窗口bar显示后再去获取,所以要在onReady周期函数中使用获取窗口高度方法
      success: function (res) { //转换窗口高度
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
 * 在返回页面的时候
 */
  onShow: function () {
    // let self = this;
    // let user = wx.getStorageSync('user');

    // if (user != "") {
    //   let LoginRandom = user.Login_random;
    //   let zcode = user.zcode;
    //   let url = encodeURIComponent('/pages/video/videoIndex/videoIndex');

    //   console.log("action=GetCourseList&LoginRandom=" + LoginRandom + "&zcode=" + zcode + "&types=jjr")
    //   app.post(API_URL, "action=GetCourseList&types=jjr", true, true, "", url).then((res) => {
    //     let videoList = res.data.list;
    //     self.setData({
    //       videoList:videoList,
    //     })
    //   })
    // }

    // this.setData({
    //   user: user
    // })
  },

  /**
   * 改变产品时
   */
  changeProduct:function(e){
    let self = this;
    let product=  e.currentTarget.dataset.product;
    let windowWidth = self.data.windowWidth;
    let moveData = animate.moveX(easeOutAnimation, 400 * (windowWidth/750));
    console.log(moveData)
    self.setData({
      product:product,
      moveData: moveData
    })
  }
})