// pages/live/live.js
let API_URL = "https://xcx2.chinaplat.com/";
let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    prompt: "",
    fullScreen: false,
    show: true,
    direction: "vertical"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let sign = options.sign;
    this.setData({
      sign: sign
    })
    let livePlayer = wx.createLivePlayerContext("player", this);

    livePlayer.requestFullScreen({
      success: (res) => {
        console.log(res)
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let self = this;
    self.ctx = wx.createLivePlayerContext('player', this);
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

    wx.setKeepScreenOn({
      keepScreenOn: true
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let self = this;
    let livePlayer = wx.createLivePlayerContext("player", this);

    livePlayer.requestFullScreen({
      success: (res) => {
        console.log(res)
      }
    })

    let user = wx.getStorageSync('user');

    let LoginRandom = user.Login_random;
    let zcode = user.zcode;
    let sign = this.data.sign;

    console.log("action=changeRoomRecords&Loginrandom=" + LoginRandom + "&zcode=" + zcode + "&flag=1" + "&roomid=" + sign)
    app.post(API_URL, "action=changeRoomRecords&Loginrandom=" + LoginRandom + "&zcode=" + zcode + "&flag=1" + "&roomid=" + sign, false, true, "").then((res) => {

    })
  },

  /**
   * 改变横竖屏
   */
  changeDirection: function () {
    let self = this;
    let direction = self.data.direction;

    if (direction == "vertical") {
      direction = "horizontal";
    } else {
      direction = "vertical";
    }
    self.setData({
      direction: direction
    })
  },

  /**
   * 状态改变
   */
  statechange: function (e) {
    let self = this;

    let code = e.detail.code;
    let prompt = "";


    switch (code) {
      case 2001:
        prompt = "等待直播中...";
        break;
      case 2004:
        prompt = "直播开始...";
        break;
      case 2007:
        prompt = "直播准备中...";
        break;
      case 2008:
        prompt = "直播载入中...";
        break;
      case 2103:
      case 2104:
      case 2105:
        prompt = "";
        break;
      case 2105:
        // prompt = "当前视频播放出现卡顿...";
        break;
      case 2009: //视频分辨率改变   
        break;

      case -2302:
      case -2301:
      case 3001:
      case 3002:
      case 3003:
      case 3005:
        prompt = "直播未开始...";
        break;

      case 2003: //网络接收到首个视频数据包(IDR)
        prompt = "";
        self.setData({
          isPlaying: true
        })

        setTimeout(function () {
          self.setData({
            show: false
          })
        }, 3000)

        break;
      default:
        prompt = code;
        break;
    }

    self.setData({
      prompt: prompt
    })
  },

  /**
   * 发生错误时
   */
  error: function (e) {
    console.error('live-player error:', e.detail.errMsg);
  },

  /** 
   * 点击视频显示控制面板
   */
  toogleShow: function (e) {
    let self = this;

    let show = self.data.show;

    if (!show) {
      let myInterval = self.data.myInterval;
      clearInterval(myInterval);
      let interval = setTimeout(function () {
        self.setData({
          show: false
        })
      }, 3000)
      self.setData({
        myInterval: interval
      })
    }

    self.setData({
      show: !self.data.show
    })
  },

  /**
   * 如果不是全屏，直接退出
   */
  bindfullscreenchange: function (e) {
    let fullScreen = e.detail.fullScreen;
    if (!fullScreen) {
      wx.navigateBack({});
    }
  },

  /**
   * 退出
   */
  out: function () {
    wx.navigateBack({});
  },

  /**
   * 生命周期事件
   */
  onUnload: function () {
    let user = wx.getStorageSync('user');

    let LoginRandom = user.Login_random;
    let zcode = user.zcode;
    let sign = this.data.sign

    app.post(API_URL, "action=changeRoomRecords&Loginrandom=" + LoginRandom + "&zcode=" + zcode + "&flag=0" + "&roomid=" + sign, false, true, "").then((res) => {

    })
  },

  onHide: function () {
    let user = wx.getStorageSync('user');
    let LoginRandom = user.Login_random;
    let zcode = user.zcode;
    let sign = this.data.sign;

    app.post(API_URL, "action=changeRoomRecords&Loginrandom=" + LoginRandom + "&zcode=" + zcode + "&flag=0" + "&roomid=" + sign, false, true, "").then((res) => {

    })
  }
})