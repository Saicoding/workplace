// pages/tiku/zuoti/index.js
const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址
const app = getApp();
var touchDot = 0; //触摸时的原点
var time = 0; //  时间记录，用于滑动时且时间小于1s则执行左右滑动
var interval = ""; // 记录/清理 时间记录
var nth = 0; // 设置活动菜单的index
var nthMax = 1; //活动菜单的最大个数
var tmpFlag = true; // 判断左右滑动超出
const SRCS= {//定义初始图片对象
  "A": "/imgs/A.png",
  "B": "/imgs/B.png",
  "C": "/imgs/C.png",
  "D": "/imgs/D.png",
  "E":"/imgs/E.png"
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rightNum: 0, //正确题数
    wrongNum: 0, //错误题数
    num: 1, //第几题
    totalNum: 300, //总题数
    isAnswer: false, //是否已经选择了答案o
    srcs: { //5个选项对应的图片
      "A": "/imgs/A.png",
      "B": "/imgs/B.png",
      "C": "/imgs/C.png",
      "D": "/imgs/D.png",
      "E": "/imgs/E.png",
    },
    selectAnswer:[]//多选选中的答案
  },
  // 触摸开始事件
  touchStart: function(e) {
    touchDot = e.touches[0].pageX; // 获取触摸时的原点
    // 使用js计时器记录时间    
    interval = setInterval(function() {
      time++;
    }, 100);
  },
  // 触摸结束事件
  touchEnd: function(e) {
    var touchMove = e.changedTouches[0].pageX;

    console.log(touchMove + "||" + touchDot)
    // 向左滑动  
    if (Math.abs(touchMove - touchDot) >= 40 && time < 10 && tmpFlag == true) {
      tmpFlag = false;
      //执行切换页面的方法
      //console.log("touchMove:" + touchMove + " touchDot:" + touchDot + " diff:" + (touchMove - touchDot));
      var self = this;
      let num = self.data.num
      let px = self.data.px

      let id = wx.getStorageSync("id");
      if (touchMove - touchDot > 0) {
        px--;
        id -= 2;
      } else {
        px++;
      }

      //console.log("action = SelectShiti & id=" + id + " & z_id=" + self.data.z_id);
      console.log("action=SelectShiti&id=" + id + "&z_id=" + self.data.z_id)
      app.post(API_URL, "action=SelectShiti&id=" + id + "&z_id=" + self.data.z_id).then((res) => {
        if (res.data.shiti.length == 0) {

          wx.showToast({
            title: '没有了',
            icon: 'none',
            image: '',
            duration: 0,
            mask: true,
            success: function(res) {},
            fail: function(res) {},
            complete: function(res) {},
          })
          return false
        }
        var tx = "";
        if (res.data.shiti[0].TX == "1") {
          tx = "单选题"
        } else if (res.data.shiti[0].TX == "2") {
          tx = "多选题"
        } else {
          tx = "材料题"
        }

        wx.setStorageSync("id", res.data.shiti[0].id);

        self.setData({
          num: num, //翻一页题目num增1
          isAnswer: false,
          srcs: { //4个选项对应的图片
            "A": "/imgs/A.png",
            "B": "/imgs/B.png",
            "C": "/imgs/C.png",
            "D": "/imgs/D.png",
            "E": "/imgs/E.png",
          },
          question: res.data.shiti[0].question,
          TX: tx,
          TX_n: res.data.shiti[0].TX,
          A: res.data.shiti[0].A,
          B: res.data.shiti[0].B,
          C: res.data.shiti[0].C,
          D: res.data.shiti[0].D,
          E: res.data.shiti[0].E,
          answer: res.data.shiti[0].answer,
          jiexi: res.data.shiti[0].jiexi,
          hiddenjiexi: true,
          checked: false,
          daan_class: '',
          px: res.data.shiti[0].px,
          //value: res.data.shiti[0].value
        })
        wx.hideLoading();
      }).catch((errMsg) => {
        console.log(errMsg); //错误提示信息
        wx.hideLoading();
      });
      // wx.navigateTo({
      //   url: '../right/right'
      // })
    }
    clearInterval(interval); // 清除setInterval
    time = 0;
    tmpFlag = true; // 恢复滑动事件
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    var self = this;
    let id = wx.getStorageSync("id");
    app.post(API_URL, "action=SelectShiti&id=" + id + "&z_id=" + options.z_id).then((res) => {
      if (res.data.shiti.length == 0) {
        wx.showToast({
          title: '没有了',
          icon: 'none',
          image: '',
          duration: 0,
          mask: true,
          success: function(res) {},
          fail: function(res) {},
          complete: function(res) {},
        })
        return false
      }
      var tx = "";
      console.log(res.data.shiti[0])
      if (res.data.shiti[0].TX == "1") {
        tx = "单选题"
      } else if (res.data.shiti[0].TX == "2") {
        tx = "多选题"
      } else {
        tx = "材料题"
      }
      wx.setStorageSync("id", res.data.shiti[0].id);


      self.setData({
        z_id: options.z_id,
        question: res.data.shiti[0].question,
        TX: tx,
        TX_n: res.data.shiti[0].TX,
        A: res.data.shiti[0].A,
        B: res.data.shiti[0].B,
        C: res.data.shiti[0].C,
        D: res.data.shiti[0].D,
        E: res.data.shiti[0].E,
        answer: res.data.shiti[0].answer,
        jiexi: res.data.shiti[0].jiexi,
        hiddenjiexi: true,
        px: res.data.shiti[0].px,
        //value: res.data.shiti[0].value
      })
      wx.hideLoading();
    }).catch((errMsg) => {
      console.log(errMsg); //错误提示信息
      wx.hideLoading();
    });
  },
  /**
   * 选择答案
   */
  radioChange: function(e) {
    var self = this;
    //如果已经回答了就直接返回
    if (self.data.isAnswer) return;

    var daan = e.detail.value; //选中的答案
    var srcs = self.data.srcs; //选项前的图标对象
    var rightNum = self.data.rightNum; //当前正确答案数
    var wrongNum = self.data.wrongNum; //当前错误答案数

    //先判断是否正确
    if (daan != self.data.answer) {
      srcs[daan] = "/imgs/wrong_answer.png" //如果答错就把当前图标变为错误图标
      wrongNum++; //错误答案数增加
    } else {
      rightNum++; //正确答案数增加
    }
    srcs[self.data.answer] = "/imgs/right_answer.png" //将正确答案的图标变为正确图标

    //更新所有数据
    self.setData({
      hiddenjiexi: false,
      srcs: srcs, //更新srcs状态
      isAnswer: true, //设置成已经回答
      rightNum: rightNum, //更新正确答案数
      wrongNum: wrongNum //更新错误答案数
    })
  },
  //初始化srcs数据
  reset:function(srcs){
    srcs['A'] = "/imgs/A.png";
    srcs['B'] = "/imgs/B.png";
    srcs['C'] = "/imgs/C.png";
    srcs['D'] = "/imgs/D.png";
    srcs['E'] = "/imgs/E.png";
    return srcs;
  },

  checkval: function(e) {
    let self = this;
    let daan = e.detail.value;
    let srcs = this.reset(self.data.srcs);//初始化srcs

    for(let i = 0 ; i < daan.length ;i++){
      srcs[daan[i]] = "/imgs/right_answer.png" ;//将所有选中的选项置位正确图标
    }
    
    self.setData({
      srcs: srcs,
      selectAnswer:daan
    })

  },
  chenckChange: function(e) {
    let self = this;
    let daan = self.data.selectAnswer;
    let srcs = self.data.srcs;
    let answers = self.data.answer.split("")
    console.log(answers)
    for(let i = 0 ; i < answers.length ; i++){
      srcs[answers[i]] = "/imgs/right_answer.png";
    }

    for (let i = 0; i < daan.length; i++) {
      console.log(answers.indexOf(daan[i]))
      if (answers.indexOf(daan[i]) >=0 ){//如果正确答案包含选中
        srcs[daan[i]] = "/imgs/right_answer1.png";
      }else{
        srcs[daan[i]] = "/imgs/wrong_answer.png";
      }
    }

    self.setData({
      hiddenjiexi: false,
      srcs:srcs
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})