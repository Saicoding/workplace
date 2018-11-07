// pages/mine/set/set.js
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

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let self = this;

    this.loginOut = this.selectComponent('#loginOut');
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
   * 清除缓存
   */
  clearStorage:function(){
    let user = wx.getStorageSync('user');
    wx.clearStorage();
    wx.setStorageSync('user', user);
    wx.showToast({
      title: '清除缓存成功',
      duration:2000
    })
  },

  /**
   * 退出登录
   */
  goOut:function(){
    console.log('ok')
    this.loginOut.showDialog();
  },

  /**
   * 点击确认登录
   */
  _tapConfirm:function(){
    this.loginOut.hideDialog();

    let url = encodeURIComponent('/pages/mine/mineIndex/mineIndex');

    wx.navigateBack({})

    wx.clearStorageSync('user');

    wx.navigateTo({
      url: '/pages/login1/login1?url=' + url + "&ifGoPage=false",
    })
    
  }
})