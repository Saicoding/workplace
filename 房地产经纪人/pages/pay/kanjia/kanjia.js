// pages/pay/kanjia/kanjia.js
const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址
const app = getApp(); //获取app对象
let time = require('../../../common/time.js');
let buttonClicked = false; //默认还没有点击可以导航页面的按钮
let WXBizDataCrypt = require('../../../utils/cryptojs/RdWXBizDataCrypt.js');
let appId = "wxf90a298a65cfaca8";
let secret = "4bb3fe58d349718b6832c04bf462d832";
let leftTime = 0;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    first: false,
    jiasuUsers:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('执行了')
    let self = this;
    let me = options.me; //是不是本人进的页面
    let taocan = options.taocan == undefined ? '':options.taocan;
    let mykan_id = options.mykan_id == 'undefined' ? "" : options.mykan_id;
    me = me == "1" ? 1 : 0

    let user = wx.getStorageSync('user');

    wx.login({
      success: res => {
        let code = res.code;
        app.post(API_URL, "action=getSessionKey&code=" + code, false, false, "").then((res) => {
          let sesstion_key = res.data.sessionKey;
          let openid = res.data.openid;
          self.setData({
            sesstion_key: sesstion_key,
            openid: openid,
            hasCode: true
          })
        })
      }
    })

    self.setData({
      me: me,
      taocan: taocan,
      first: true,
      mykan_id: mykan_id
    })
  },
  /**
   * 生命周期函数
   */
  onReady:function(){
    this.kanjiaModel = this.selectComponent("#kanjiaModel");
  },

  /**
   * 得到现在价格的位置定位
   */
  getPostionOjb: function(money_now, money_zong) {
    let postionObj = {};
    let length = 300; //最多可以砍的距离
    let sub = money_zong - money_now;

    // 可以砍到的最低价格
    let lowestPrice = money_zong * 30 / 100;

    // 现在砍的进度
    let rate = sub / lowestPrice;

    // 现在砍的距离
    let nowLength = Math.ceil(length * rate);
    return nowLength;
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let self = this;
    let taocan = self.data.taocan;
    let me = self.data.me;

    console.log(self.data.mykan_id)
    console.log(me+"是我")

    let user = wx.getStorageSync('user');
    let loginrandom = user.Login_random;
    let zcode = user.zcode;

    let isReLoad = self.data.isReLoad; //是否是重复登录
    let first = self.data.first; //是否是第一次渲染页面

    buttonClicked = false;

    if ((isReLoad || first) && user != "" && me == 1) { //如果user = "" 
      console.log("zhans ")
      app.post(API_URL, "action=KanjiaCreate&loginrandom=" + loginrandom + "&zcode=" + zcode + "&taocan=" + taocan, false, false, "").then(res1 => {
        let kan_id = res1.data.data[0].kan_id;

        app.post(API_URL, "action=KanjiaInfo&kan_id=" + kan_id, false, false, "").then(res => {
          console.log(res)
          let result = res.data.data[0]
          let endtime = result.endtime; //砍价截止时间
          let title = result.title; //抢购产品
          let money_now = result.money_now; //现在的价格
          let money_zong = result.money_zong; //总价格

          let nowLength = self.getPostionOjb(money_now, money_zong);

          let kan_list = result.kan_list;

          //开始计时
          leftTime = time.leftTime2(endtime); //剩余时间(秒数)

          let interval = setInterval(res => {
            leftTime--;
            let timeObj = time.getTimeObj(leftTime);
            self.setData({
              timeObj: timeObj
            })
          }, 1000);

          self.setData({
            endtime: endtime,
            nowLength: nowLength,
            interval: interval,
            taocan: taocan,
            title: title,
            money_now: money_now,
            money_zong: money_zong,
            first: false,
            kan_id: kan_id, 
            kan_list: kan_list
          })
        })
      })
    }else if(me == 0){//没有用户
      let mykan_id = self.data.mykan_id;

      app.post(API_URL, "action=KanjiaInfo&kan_id=" + mykan_id, false, false, "").then(res => {
        console.log(res)
        let result = res.data.data[0]
        let endtime = result.endtime; //砍价截止时间
        let title = result.title; //抢购产品
        let money_now = result.money_now; //现在的价格
        let money_zong = result.money_zong; //总价格

        let nowLength = self.getPostionOjb(money_now, money_zong);

        let kan_list = result.kan_list;
        console.log(kan_list)

        //开始计时
        leftTime = time.leftTime2(endtime); //剩余时间(秒数)

        let interval = setInterval(res => {
          leftTime--;
          let timeObj = time.getTimeObj(leftTime);
          self.setData({
            timeObj: timeObj
          })
        }, 1000);

        self.setData({
          endtime: endtime,
          nowLength: nowLength,
          interval: interval,
          title: title,
          money_now: money_now,
          money_zong: money_zong,
          first: false,
          mykan_id: mykan_id,
          kan_list: kan_list
        })
      })
    }
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide:function(){
    let interval = this.data.interval;
    clearInterval(interval);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    let interval = this.data.interval;
    clearInterval(interval);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(result) {
    let kan_id = this.data.mykan_id;
    this.kanjiaModel.hideDialog();
    return {
      title: '我正在抢购课程 求砍价!',
      path: '/pages/pay/kanjia/kanjia?mykan_id=' + kan_id,
      imageUrl: '/imgs/kanjiaBanner.jpg',
      success: (res) => {
        console.log('chenggong')
        wx.navigateTo({
          // url: '/pages/pay/kanjia/kanjia?me=1&kan_id=' + kan_id,
        })
      },
      fail: (res) => {
        console.log('haha')
      }
    }
  },

  /**
   * 帮朋友砍价
   */
  kanjia:function(e){
    let self = this;
    let hasCode = self.data.hasCode;

    //限制连续点击
    let kan_id = self.data.mykan_id;

    let wxid = ""; //openId
    let session_key = ""; //

    let encryptedData = e.detail.encryptedData;
    let iv = e.detail.iv;
    let signature = e.detail.signature; //签名
    let nickname = e.detail.userInfo.nickName; //昵称
    let headurl = e.detail.userInfo.avatarUrl; //头像
    let sex = e.detail.userInfo.gender //性别
    let code = self.data.code;

    //得到openId和session_key

    let sesstion_key = self.data.sesstion_key;
    let openid = self.data.openid;

    //拿到session_key实例化WXBizDataCrypt（）这个函数在下面解密用
    let pc = new WXBizDataCrypt(appId, sesstion_key);
    let data = pc.decryptData(encryptedData, iv);
    let unionid = data.unionId;

    app.post(API_URL, "action=KanjiaRecords&kan_id=" + kan_id + "&unionid=" + unionid + "&headurl=" + headurl + "&nickname=" + nickname,false,false,"").then(res=>{
      let money = res.data.data[0].money;
      let money_now = self.data.money_now-money; //现在的价格
      let money_zong = self.data.money_zong; //总价格

      let nowLength = self.getPostionOjb(money_now, money_zong);//更新进度条
      self.kanjiaModel.showDialog();
      self.setData({
        isKaned: true,//是否已经砍了
        money: money,
        nowLength: nowLength
      })
    })
  },

  /**
   * 去登录页面
   */
  _GOxuexi:function(){
    let url = encodeURIComponent('/pages/index/index');
    wx.redirectTo({
      url: '/pages/login1/login1?url=' + url + "&ifGoPage=true&redirect=true",
    })
  }
})