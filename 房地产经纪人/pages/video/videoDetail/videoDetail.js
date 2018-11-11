// pages/video/videoDetail/videoDetail.js
const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址
const app = getApp();
let animate = require('../../../common/animate.js');
let easeOutAnimation = animate.easeOutAnimation();
let easeInAnimation = animate.easeInAnimation();

let currentTime = 1;

let icon = {//图标高度宽度
  'width':38,
  'height':38
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loaded:false,
    isPlaying:false,//是否在播放
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

    let lastpx = wx.getStorageSync('lastVideo' + kcid+user.username);
    if (lastpx !=""){
      px = lastpx;
    }

    if (loaded) return;
    app.post(API_URL, "action=getCourseShow&LoginRandom=" + LoginRandom + "&zcode=" + zcode + "&kcid=" + kcid, false, false, "", "").then((res) => {
      let videos = res.data.data[0].videos;//视频列表

      let my_canvas = [];

      for(let i = 0 ;i <videos.length;i++){
        let cv = wx.createCanvasContext('myCanvas'+i, self) 
        my_canvas.push(cv);
      }

      self.initVideos(videos, px, my_canvas);//初始化video的图片信息

      let buy = res.data.data[0].buy;//是否已经购买
      let tag = res.data.data[0].tag;//标签
      let info = res.data.data[0].info;//简介信息
      let kc_money = res.data.data[0].kc_money;//价格

      self.setData({
        videos: videos,
        tag: tag,
        info: info,
        my_canvas: my_canvas,
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
   * 画圆
   */
  drawArc:function(cv,color,rate){
    let windowWidth = this.data.windowWidth;
    cv.clearRect(0, 0, icon.width * windowWidth / 750, icon.height * windowWidth / 750); 
    //画内圆
    cv.setFillStyle(color)
    cv.beginPath()
    cv.arc(18 * windowWidth / 750, 18 * windowWidth / 750, 10 * windowWidth / 750, 0, 2 * Math.PI);
    cv.close
    cv.fill();
    cv.closePath();
    
    //画最外圈
    cv.beginPath()
    cv.setStrokeStyle(color)
    cv.setLineWidth(1)
    cv.arc(18 * windowWidth / 750, 18 * windowWidth / 750, 16 *windowWidth / 750, 0, 2 * Math.PI);
    cv.stroke()
    cv.closePath();

    //画进度
    cv.beginPath();
    cv.setStrokeStyle("#0197f6")
    cv.setLineWidth(1)
    cv.arc(18 * windowWidth / 750, 18 * windowWidth / 750, 16 * windowWidth / 750, -Math.PI / 2, rate - Math.PI / 2);
    cv.stroke()
    cv.closePath();

    cv.draw();
  },

  /**
   * 画当前播放按钮
   */
  drawPlay: function (cv,rate){
    let windowWidth = this.data.windowWidth;
    cv.clearRect(0, 0, icon.width * windowWidth / 750, icon.height * windowWidth / 750); 
    //画外圆
    cv.setFillStyle("#0097f5");
    cv.arc(18 * windowWidth / 750, 18 * windowWidth / 750, 16 * windowWidth / 750, 0, 2 * Math.PI);
    cv.fill();
    cv.closePath();
    //画三角
    cv.setFillStyle("#ffffff");
    cv.beginPath();
    cv.moveTo(12 * windowWidth / 750, 8 * windowWidth / 750);
    cv.lineTo(12 * windowWidth / 750, 28 * windowWidth / 750);
    cv.lineTo(28 * windowWidth / 750, 18 * windowWidth / 750);
    cv.closePath();
    cv.fill();

    //画进度
    cv.beginPath();
    cv.setStrokeStyle("#f10707")
    cv.setLineWidth(1)
    cv.arc(18 * windowWidth / 750, 18 * windowWidth / 750, 16 * windowWidth / 750, -Math.PI / 2, rate - Math.PI / 2);
    cv.stroke()
    cv.closePath();
    cv.draw();
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
    let my_canvas = self.data.my_canvas;//当前所有画布
    let px = self.data.px;//当前视频编号
    let index = e.currentTarget.dataset.index;//点击的视频编号

    if(index == px-1) return;//如果点击的是同一个视频就不做任何操作

    let lastVideo = videos[px-1];//上一个视频
    let lastCv = my_canvas[px-1];//上一个画布
    let videoID = lastVideo.id;//视频id

    let currentVideo = videos[index];//点击的这个视频
    let currentCv = my_canvas[index];//当前画布

    let playTime = currentTime > 10 ? currentTime - 10 : 0;//播放时间
    let flag = lastVideo.flag == 2?2:1


    lastVideo.lastViewLength = currentTime;//设置上一个视频的播放时间

    let angle = currentTime / lastVideo.length * 2 * Math.PI;
    if (lastVideo.lastViewLength > 10){//如果大于10秒
      self.drawArc(lastCv, "#ffa828", angle);
    }else{
      self.drawArc(lastCv, "#bfbfbf", 0);
    }

    console.log(currentVideo.lastViewLength)

    let currentAngle = currentVideo.lastViewLength / currentVideo.length * 2 * Math.PI;

    self.drawPlay(currentCv, currentAngle );

    currentTime = currentVideo.lastViewLength;//将当前播放时间置为该视频的播放进度

    self.setData({
      videos: videos,
      isPlaying:false,
      px:index+1
    })


    app.post(API_URL, "action=savePlayTime&LoginRandom=" + LoginRandom + "&zcode=" + zcode + "&videoID=" + videoID + "&playTime=" + playTime + "&kcid=" + kcid + "&flag=" + flag,false,true,"").then((res) => {

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
    let self = this;
    let px = self.data.px;
    let videos = self.data.videos;
    let video = videos[px-1];
    let my_canvas = self.data.my_canvas;
    let cv = my_canvas[px-1];
    currentTime = e.detail.currentTime;//当前播放进度(秒)
    let angle = currentTime / video.length * 2 * Math.PI;
    self.drawPlay(cv, angle);
  },

  /**
   * 点击开始播放
   */
  play:function(){
    this.setData({
      isPlaying:true
    })
  },

  /**
   * 点击暂停播放
   */
  pause:function(){
    this.setData({
      isPlaying: false
    })
  },

  /**
 * 切换播放状态
 */
  tooglePlay: function () {
    let self = this;
    let px = self.data.px;//当前视频编号
    let videos = self.data.videos;//当前所有视频
    let currentVideo = videos[px-1];
    let isPlaying = self.data.isPlaying;
    if(currentVideo.lastViewLength == "0"){//如果没有播放过,就
      currentVideo.lastViewLength = "0.1";
      self.setData({
        videos: videos
      })
    }
    isPlaying = !isPlaying
    
    isPlaying?this.videoContext.play():this.videoContext.pause();

    self.setData({
      isPlaying:isPlaying
    })
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
  initVideos: function (videos, px, my_canvas){
    for(let i = 0 ;i <videos.length;i++){
      let video = videos[i];
      let cv = my_canvas[i];

      //处理时间
      let length = Math.ceil(video.length);
      let m = parseInt(length/60);
      let s = length % 60 < 10 ? '0' + length % 60 : length % 60;
      video.time = m+'分'+s+'秒';

      if (video.lastViewLength == "0" ){//如果没有播放进度
        this.drawArc(cv, "#bfbfbf", 0);
      }else{
        console.log(video.lastViewLength)
        // let angle = video.lastViewLength / video.length * 2 * Math.PI;
        let angle = video.lastViewLength / video.length * 2 * Math.PI;
        this.drawArc(cv, "#ffa828", angle );
      }

      if(i == px-1) this.drawPlay(cv,10);
    }
  },

  /**
   * 生命周期函数
   */
  onHide:function(){
    console.log('我隐藏了')
    this.videoContext.pause();
    let self = this;
    let user = self.data.user;
    let kcid = self.data.kcid;
    let px = self.data.px;
    wx.setStorageSync('lastVideo'+kcid+user.username, px);
  },

  /**
   * 生命周期函数
   */
  onUnload:function(){
    let self = this;
    let user = self.data.user;
    let kcid = self.data.kcid;
    let px = self.data.px;

    let LoginRandom = user.Login_random;
    let zcode = user.zcode;

    let videos = self.data.videos;//当前所有视频

    let lastVideo = videos[px - 1];//上一个视频
    let videoID = lastVideo.id;//视频id

    let playTime = currentTime > 10?currentTime-10:0;//播放时间
    let flag = lastVideo.flag == 2 ? 2 : 1
    wx.setStorageSync('lastVideo' + kcid + user.username, px);

    app.post(API_URL, "action=savePlayTime&LoginRandom=" + LoginRandom + "&zcode=" + zcode + "&videoID=" + videoID + "&playTime=" + playTime + "&kcid=" + kcid + "&flag=" + flag, false, true, "").then((res) => {
    })
  }
})