// pages/mine/message/message.js
const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    page:1, //默认请求页是1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '我的消息',
    })

    let self = this;
    let user = wx.getStorageSync('user');
    let LoginRandom = user.Login_random;
    let zcode = user.zcode;
    let page = self.data.page;
    let pagesize = 15;
    app.post(API_URL,"action=GetNotices&LoginRandom="+LoginRandom+"&zcode="+zcode+"&pagesize="+pagesize+"&page="+page,true,false,"载入中").then((res)=>{

      let messages = res.data.list;
      let page_all = res.data.page_all;

      self.setData({
        messages:messages,
        user:user,
        page_all: page_all//总页数
      })
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let self = this;
    wx.getSystemInfo({ //得到窗口高度,这里必须要用到异步,而且要等到窗口bar显示后再去获取,所以要在onReady周期函数中使用获取窗口高度方法
      success: function (res) { //转换窗口高度
        let windowHeight = res.windowHeight;
        let windowWidth = res.windowWidth;
        windowHeight = (windowHeight * (750 / windowWidth));
        self.setData({
          windowHeight: windowHeight,
          windowWidth: windowWidth,
        })
      }
    });
  },

  /**
   * 滑动刷新
   */
  scrolltolower:function(){
    let self = this;
    let user = self.data.user;
    let LoginRandom = user.Login_random;
    let zcode = user.zcode;
    let page_all = self.data.page_all;
    let page = self.data.page;
    let messages = self.data.messages;

    page++;

    if (page > page_all) return;//如果大于总页数就返回

    let pagesize = 15;

    app.post(API_URL, "action=GetNotices&LoginRandom=" + LoginRandom + "&zcode=" + zcode + "&pagesize=" + pagesize + "&page=" + page, true, false, "载入中").then((res) => {
      let newMessages = res.data.list;

      messages.push.apply(messages, newMessages);
      console.log(page)
      console.log(messages)
      self.setData({
        messages: messages,
        page: page
      })
    })
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