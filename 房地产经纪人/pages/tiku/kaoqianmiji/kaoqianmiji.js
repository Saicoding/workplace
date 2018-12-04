let API_URL = "https://xcx2.chinaplat.com/";
let LIVE_API_URL = "https://live.tencentcloudapi.com/";

let time = require('../../../common/time.js');

let app = getApp();

Page({
  data: {
    isPlaying: true,
    clarity_str: "高清",
    isLiving: false,//是否在直播
  },

  /**
   * 生命周期事件
   */
  onLoad: function () {
  },

  /**
   * 生命周期事件
   */
  onShow: function () {
    let self = this;
    let user = wx.getStorageSync("user");

    if (user) {
      let LoginRandom = user.Login_random;
      let zcode = user.zcode;

      console.log("action=getPlaySign&LoginRandom=" + LoginRandom + "&zcode=" + zcode)
      app.post(API_URL, "action=getPlaySign&LoginRandom=" + LoginRandom + "&zcode=" + zcode, false, false, "").then((res) => {
        let img = res.data.data.img;
        let sign = res.data.data.sign;
        let title = res.data.data.title;
        let starttime = res.data.data.starttime;
        let pastVideos = res.data.list;

        self.initVideos(pastVideos);

        self.setData({
          img: img,
          sign: sign,
          title: title,
          starttime: starttime,
          isLiving: true,
          pastVideos: pastVideos
        })

        //得到消息数目
        let url = encodeURIComponent('/pages/index/index');
        app.post(API_URL, "action=GetNoticesNums&LoginRandom=" + LoginRandom + "&zcode=" + zcode, false, true, "", url).then((res) => {
          let nums = res.data.nums;

          if (nums > 0) {
            nums = nums.toString();
            wx.setTabBarBadge({
              index: 2,
              text: nums,
            })
          } else {
            wx.setTabBarBadge({
              index: 2,
              text: "",
            })
          }
        })
      })
    } else {
      let url = encodeURIComponent('/pages/index/index');

      wx.navigateTo({
        url: '/pages/login1/login1?url=' + url + '&ifGoPage=false',
      })
    }
  },

  /**
   * 观看直播
   */
  goLiveDetail: function () {
    let self = this;
    let sign = self.data.sign;
    let AppName = "劳动关系协调师";
    let DomainName = "rtmp://play.chinaplat.com/live/";
    let StreamName = sign;

    wx.navigateTo({
      url: '/pages/tiku/live/live?sign=' + sign,
    })
  },

  /**
   * 观看往期回顾
   */
  watchPast: function (e) {
    let videourl = e.currentTarget.dataset.videourl;
    let title = e.currentTarget.dataset.title;

    let url = "/pages/tiku/pastVideo/pastVideo?videourl=" + videourl + "&title=" + title;
    wx.navigateTo({
      url: url,
    })
  },

  /**
   * 生命周期事件
   */
  onReady: function (res) {
    let self = this;
    wx.getSystemInfo({ //得到窗口高度,这里必须要用到异步,而且要等到窗口bar显示后再去获取,所以要在onReady周期函数中使用获取窗口高度方法
      success: function (res) { //转换窗口高度
        let windowHeight = res.windowHeight;
        let windowWidth = res.windowWidth;
        windowHeight = (windowHeight * (750 / windowWidth));
        self.setData({
          windowWidth: windowWidth,
          windowHeight: windowHeight
        })
      }
    });

    self.ctx = wx.createLivePlayerContext('player');

    self.setData({
      isPlaying: true
    })
  },

  /**
   * 初始化视频信息
   */

  initVideos: (pastVideos) => {
    for (let i = 0; i < pastVideos.length; i++) {
      let video = pastVideos[i];
      video.timeStr = time.formatTimeBySecond(parseInt(video.time));
    }
  }
})