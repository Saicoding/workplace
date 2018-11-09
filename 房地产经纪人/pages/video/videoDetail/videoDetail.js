// pages/video/videoDetail/videoDetail.js
const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址
const app = getApp();
let animate = require('../../../common/animate.js');
let easeOutAnimation = animate.easeOutAnimation();
let easeInAnimation = animate.easeInAnimation();

let currentTime = 1;
let isPlaying = false;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loaded:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取是否有登录权限
    let self = this;

    this.setData({
      product: "option",
      options:options
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

    this.videoContext = wx.createVideoContext('myVideo')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let self = this;
    let options = self.data.options;
    let user = wx.getStorageSync('user');
    let LoginRandom = user.Login_random;
    let zcode = user.zcode;
    let kcid = options.kc_id;
    let img = options.img;
    let loaded = self.data.loaded;
    let px = 1;

    let currentVideo = wx.getStorageSync('lastVideo' + kcid+user.username);
    if (currentVideo !=""){
      px = currentVideo.px;
    }

    if (loaded) return;
    app.post(API_URL, "action=getCourseShow&LoginRandom=" + LoginRandom + "&zcode=" + zcode + "&kcid=" + kcid, false, false, "", "").then((res) => {
      console.log(res)
      let videos = res.data.data[0].videos;//视频列表


      self.initVideos(videos,px);//初始化video的图片信息

      let buy = res.data.data[0].buy;//是否已经购买
      let tag = res.data.data[0].tag;//标签
      let info = res.data.data[0].info;//简介信息
      let kc_money = res.data.data[0].kc_money;//价格

      self.setData({
        videos: videos,
        tag: tag,
        info: info,
        kc_money: kc_money,
        loaded: true,
        img: img,
        kcid: kcid,
        px:px,
        user:user
      })
    })
  },

  /**
    * 改变产品时
    */
  changeOption: function (e) {
    let self = this;
    let currentProduct = self.data.product;//当前种类
    let product = e.currentTarget.dataset.product;//点击的视频种类
    if (product == currentProduct) return;//如果没有改变就不作任何操作

    self.videoContext.pause()

    let windowWidth = self.data.windowWidth;//窗口宽度
    let moveData = undefined;//动画
    if (product == "introduction") {
      moveData = animate.moveX(easeOutAnimation, -258 * (windowWidth / 750) );
    } else {
      moveData = animate.moveX(easeOutAnimation, 0);
    }

    self.setData({
      product: product,
      moveData: moveData
    })
  },

  /**
   * 换视频时
   */
  changeVideo:function(e){
    let self = this;

    let user = self.data.user;
    let kcid = self.data.kcid;
    let LoginRandom = user.Login_random;
    let zcode = user.zcode;

    let videos = self.data.videos;//当前所有视频
    let px = self.data.px;//当前视频编号
    let index = e.currentTarget.dataset.index;//点击的视频编号

    let lastVideo = videos[px-1];//上一个视频
    let videoID = lastVideo.id;//视频id

    let currentVideo = videos[index];//点击的这个视频
    let playTime = currentTime;//播放时间
    let flag = lastVideo.flag == 2?2:1

    lastVideo.lastViewLength = currentTime;//设置上一个视频的播放时间
    lastVideo.src = lastVideo.lastViewLength > 1 ? '/imgs/circle2.png' : '/imgs/circle1.png'//改变上一个视频的图片

    currentVideo.src = '/imgs/play.png';

    currentTime = currentVideo.lastViewLength;//将当前播放时间置为该视频的播放进度

    self.setData({
      videos: videos,
      px:index+1
    })

    console.log("action=savePlayTime&LoginRandom=" + LoginRandom + "&zcode=" + zcode + "&videoID=" + videoID + "&playTime=" + playTime + "&kcid=" + kcid + "&flag=" + flag)
    app.post(API_URL, "action=savePlayTime&LoginRandom=" + LoginRandom + "&zcode=" + zcode + "&videoID=" + videoID + "&playTime=" + playTime + "&kcid=" + kcid + "&flag=" + flag,false,true,"").then((res) => {
      console.log(res);
    })
  },

  /**
   * 视频缓冲时
   */
  waiting:function(e){
    console.log(e)
  },
  /**
   * 播放进度改变时
   */
  timeupdate:function(e){
    currentTime = e.detail.currentTime;//当前播放进度(秒)
  },

  /**
   * 点击开始播放
   */
  play:function(){
    isPlaying = true;
  },

  /**
   * 点击暂停播放
   */
  pause:function(){
    isPlaying = false;
  },

  /**
 * 切换播放状态
 */
  tooglePlay: function () {
    isPlaying = !isPlaying
    console.log(isPlaying)
    isPlaying?this.videoContext.play():this.videoContext.pause();
  },

  /**
   * 视频播放结束后
   */
  end:function(e){
    console.log(e);
  },

  /**
   * 初始化视频信息
   */
  initVideos:function(videos,px){
    for(let i = 0 ;i <videos.length;i++){
      let video = videos[i];

      //处理时间
      let length = Math.ceil(video.length);
      let m = parseInt(length/60);
      let s = length % 60 < 10 ? '0' + length % 60 : length % 60;
      video.time = m+'分'+s+'秒';
      console.log(video.lastViewLength)
      video.src = video.lastViewLength == "0" ? "/imgs/circle1.png" : "/imgs/circle2.png";
      video.lastViewLength = "1"

      if(i == px-1) video.src="/imgs/play.png"
    }
  },
})