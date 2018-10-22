// pages/tiku/wrong/wrong.js
const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址
let common = require('../../../common/shiti.js');

const util = require('../../../utils/util.js')
//把winHeight设为常量，不要放在data里（一般来说不用于渲染的数据都不能放在data里）
const winHeight = wx.getSystemInfoSync().windowHeight
const app = getApp();
var touchDot = 0; //触摸时的原点
var time = 0; //  时间记录，用于滑动时且时间小于1s则执行左右滑动
var interval = ""; // 记录/清理 时间记录
var nth = 0; // 设置活动菜单的index
var nthMax = 1; //活动菜单的最大个数
var tmpFlag = true; // 判断左右滑动超出

Page({
  /**
   * 页面的初始数据
   */
  data: {
    id: 0, //书的编号,默认为0
    rightNum: 0, //正确答案数
    wrongNum: 0, //错误答案数
    isLoaded: true, //是否已经载入完毕,用于控制过场动画
    cl_question_hidden: false, //材料题是否隐藏题目
    checked: false, //选项框是否被选择
    doneAnswerArray: [], //已做答案数组
    markAnswerItems: [], //设置一个空数组

    isModelReal: false,//是不是真题或者押题
    isSubmit: false //是否已提交答卷
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarTitle({ title: '我的错题' })  //设置标题
    let self = this;
    let user = wx.getStorageSync('user');
    let username = user.username; //用户姓名
    let acode = user.acode; //用户唯一码
    let kid = options.kid; //题库编号
    let px = 1;
    console.log("action=GetErrorShiti&kid=" + kid + "&username=" + username + "&acode=" + acode)
    app.post(API_URL, "action=GetErrorShiti&kid=" + kid + "&username=" + username + "&acode=" + acode, true,true,"载入错题中").then((res) => {
      if (res.data == undefined) {
        wx.navigateTo({
          url: '/pages/prompt/hasNoErrorShiti/hasNoErrorShiti',
        })
        return
      }

      let shitiArray =res.data.shiti;

      let shiti = shitiArray[0];

      common.initShiti(shiti, px, self); //初始化试题对象

      common.initMarkAnswer(shitiArray.length, self); //初始化答题板数组

      self.markAnswer.setData({//答题板初始化
        markAnswerItems: self.data.markAnswerItems
      })

      self.setData({
        //设置过场动画
        winH: wx.getSystemInfoSync().windowHeight,
        opacity: 1,

        shitiArray: res.data.shiti,
        kid: options.kid, //点击组件的id编号
        nums: res.data.shiti.length, //题数
        shiti: shiti, //试题对象
        isLoaded: false, //是否已经载入完毕,用于控制过场动画
        username: username, //用户账号名称
        acode: acode //用户唯一码
      });
      wx.hideLoading();
    }).catch((errMsg) => {
      console.log(errMsg); //错误提示信息
      wx.navigateTo({
        url: '/pages/prompt/hasNoErrorShiti/hasNoErrorShiti',
      })
      wx.hideLoading();
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let self = this;
    //获得dialog组件
    this.markAnswer = this.selectComponent("#markAnswer");
    this.waterWave = this.selectComponent("#waterWave");
    wx.getSystemInfo({ //得到窗口高度,这里必须要用到异步,而且要等到窗口bar显示后再去获取,所以要在onReady周期函数中使用获取窗口高度方法
      success: function(res) { //转换窗口高度
        let windowHeight = res.windowHeight;
        let windowWidth = res.windowWidth;
        windowHeight = (windowHeight * (750 / windowWidth));
        self.setData({
          windowHeight: windowHeight
        })
      }
    });
  },
  /**
   * touch开始事件
   */
  touchStart: function(e) {
    touchDot = e.touches[0].pageX; // 获取触摸时的原点
    // 使用js计时器记录时间    
    interval = setInterval(function() {
      time++;
    }, 100);
  },
  /**
   * touch移动事件
   */
  touchMove: function(e) {},
  /**
   * touch结束事件
   */
  touchEnd: function(e) {
    let self = this;
    var touchMove = e.changedTouches[0].pageX;
    let px = self.data.shiti.px; //试题的编号
    let shitiArray = self.data.shitiArray //所有试题

    let kid = self.data.kid; //题库编号
    let username = self.data.username; //用户名
    let acode = self.data.acode; //用户唯一码
    let doneAnswerArray = self.data.doneAnswerArray;

    // 滑动  
    if (Math.abs(touchMove - touchDot) >= 40 && time < 10 && tmpFlag == true) {
      tmpFlag = false;
      touchMove - touchDot > 0 ? px -= 1 : px += 1
      if (px == 0) {
        wx.showToast({
          title: '这是第一题',
          icon: 'none',
          duration: 4000,
        })
        clearInterval(interval); // 清除setInterval
        time = 0;
        tmpFlag = true; // 恢复滑动事件
        return
      }
      if (px > self.data.nums) { //最后一题时如果都答题完毕，就导航到答题完毕窗口，否则打开答题板
        if (doneAnswerArray.length == self.data.nums) {
          wx.navigateTo({
            url: '/pages/prompt/jieAnswerAll/jieAnswerAll',
          })
        } else {
          wx.showToast({
            title: '这是最后一题',
            icon: 'none',
            duration: 4000,
            success: function () {
              self.showMarkAnswer();
            }
          })
        }
        wx.hideLoading();
        clearInterval(interval); // 清除setInterval
        time = 0;
        tmpFlag = true; // 恢复滑动事件
        return;
      }

      let shiti = shitiArray[px - 1];

      common.initShiti(shiti, px, self); //初始化试题对象
    
      //先处理是否是已经回答的题    
      common.processDoneAnswer(doneAnswerArray, shiti, self);

      self.setData({ //每滑动一下,更新试题
        shiti: shiti,
        checked: false
      })

    }
    clearInterval(interval); // 清除setInterval
    time = 0;
    tmpFlag = true; // 恢复滑动事件
  },

  /**
   * 作答
   */
  _answerSelect: function(e) {
    let self = this;
    let done_daan = "";

    let shitiArray = self.data.shitiArray;//所有试题对象
    let shiti = self.data.shiti; //本试题对象

    done_daan = shiti.TX == 1 ? e.detail.done_daan : shiti.selectAnswer; //根据单选还是多选得到done_daan

    if (done_daan == undefined) {//说明多选没有选择选项
      wx.showToast({
        title: '没有任何选项',
      })
      return
    }

    if (shiti.isAnswer) return;

    common.changeSelectStatus(done_daan, shiti, self); //改变试题状态

    this.setData({
      shiti: shiti
    })

    common.changeNum(shiti.flag, self); //更新答题的正确和错误数量

    common.postAnswerToServer(self.data.acode, self.data.username, shiti.id, shiti.flag, shiti.done_daan, app, API_URL); //向服务器提交答题结果

    common.storeAnswerArray(shiti, self) //存储已答题数组

    common.setMarkAnswerItems(self.data.doneAnswerArray, self.data.nums, self.data.isModelReal, self.data.isSubmit, self); //更新答题板状态

    common.ifDoneAll(shitiArray, self.data.doneAnswerArray);//判断是不是所有题已经做完
  },

  /**
   * 多选题选一个选项
   */
  _checkVal: function(e) {
    let done_daan = e.detail.done_daan.sort();
    let shiti = this.data.shiti;

    //初始化多选的checked值
    common.initMultiSelectChecked(shiti);
    //遍历这个答案，根据答案设置shiti的checked属性
    done_daan = common.changeShitiChecked(done_daan, shiti);

    common.changeMultiShiti(done_daan, shiti);
    this.setData({
      shiti: shiti
    })
  },

  /**
   * 材料题点击开始作答按钮
   */
  CLZuoti: function(e) {
    this.waterWave.containerTap(e);
    let str = "#q" + this.data.shiti.px;
    let question = this.selectComponent(str);
    let shiti = this.data.shiti;

    question.spreadAnimation();

    this.setData({
      cl_question_hidden: true
    })
  },

  /**
   * 材料题多选点击一个选项
   */
  _CLCheckVal: function(e) {
    let px = e.currentTarget.dataset.px;
    let done_daan = e.detail.done_daan.sort();
    let shiti = this.data.shiti; //本试题对象
    let xiaoti = this.data.shiti.xiaoti; //材料题下面的小题
    for (let i = 0; i < xiaoti.length; i++) {
      if (px - 1 == i) { //找到对应小题
        if (xiaoti[i].isAnswer) return;
        //初始化多选的checked值
        common.initMultiSelectChecked(xiaoti[i]);
        //遍历这个答案，根据答案设置shiti的checked属性
        done_daan = common.changeShitiChecked(done_daan, xiaoti[i]);

        common.changeMultiShiti(done_daan, xiaoti[i]);
        this.setData({
          shiti: shiti
        })
      }
    }
  },
  /**
   * 材料题作答
   */
  _CLAnswerSelect: function(e) {
    let self = this;
    let px = e.currentTarget.dataset.px;
    let done_daan = "";
    let xiaoti = self.data.shiti.xiaoti;
    let shitiArray = self.data.shitiArray;
    let shiti = self.data.shiti; //本试题对象

    if (shiti.isAnswer) return;

    for (let i = 0; i < xiaoti.length; i++) {
      if (px - 1 == i) { //找到对应的小题
        if (xiaoti[i].isAnswer) return;
        done_daan = xiaoti[i].TX == 1 ? e.detail.done_daan : xiaoti[i].selectAnswer; //根据单选还是多选得到done_daan,多选需要排序
        common.changeSelectStatus(done_daan, xiaoti[i], self); //改变试题状态
        if (xiaoti[i].flag == 1) shiti.flag = 1; //如果小题错一个,整个材料题就是错的
        shiti.doneAnswer.push({
          'px': px,
          'done_daan': done_daan
        }); //向本材料题的已答数组中添加已答题目px 和 答案信息

        if (shiti.doneAnswer.length == xiaoti.length) { //说明材料题已经全部作答
          shiti.done_daan = shiti.doneAnswer; //设置该试题已作答的答案数组

          common.changeNum(shiti.flag, self); //更新答题的正确和错误数量

          common.postAnswerToServer(self.data.acode, self.data.username, shiti.id, shiti.flag, "测试", app, API_URL); //向服务器提交答题结果

          common.storeAnswerArray(shiti, self); //存储答题状态

          common.setMarkAnswerItems(self.data.doneAnswerArray, self.data.nums, self.data.isModelReal, self.data.isSubmit, self); //更新答题板状态

          common.ifDoneAll(shitiArray, self.data.doneAnswerArray);//判断是不是所有题已经做完
        }
        self.setData({
          shiti: shiti
        })
      }
    }
  },
  /**
   * 刚载入时的动画
   */
  onShow: function () {
    this.hide()
  },
 


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.hide()
  },
  /**
   * 切换答题板
   */
  _toogleMarkAnswer: function() {
    this.markAnswer.toogleDialog();
  },
  /**
   * 显示答题板
   */
  showMarkAnswer: function() {
    this.markAnswer.showDialog();
  },
  /**
   * 隐藏答题板
   */
  _hideMarkAnswer: function() {
    this.markAnswer.hideDialog();
  },
  /**
   * 切换是否收藏该试题
   */
  _toogleMark: function(e) {
    let self = this;
    let username = self.data.username;
    let acode = self.data.acode;
    let shiti = self.data.shiti;
    shiti.favorite = shiti.favorite == 0 ? 1 : 0;
    this.setData({
      shiti: shiti
    })
    app.post(API_URL, "action=FavoriteShiti&tid=" + shiti.id + "&username=" + username + "&acode=" + acode, false).then((res) => {})
  },
  /**
  * 答题板点击编号事件,设置当前题号为点击的题号
  */
  _tapEvent: function (e) {
    let self = this;
    let px = e.detail.px;
    let zhangIdx = self.data.zhangIdx;
    let jieIdx = self.data.jieIdx;
    let shitiArray = self.data.shitiArray;
    let doneAnswerArray = self.data.doneAnswerArray;

    let shiti = shitiArray[px - 1];

    common.initShiti(shiti, px, self); //初始化试题对象

    //先处理是否是已经回答的题    
    common.processDoneAnswer(doneAnswerArray, shiti, self);

    self.setData({
      shiti: shiti,
      checked: false
    })
    self._hideMarkAnswer();
  },
  /**
   * 载入动画
   */
  hide: function () {
    var vm = this
    var interval = setInterval(function () {
      if (vm.data.winH > 0) {
        //清除interval 如果不清除interval会一直往上加
        clearInterval(interval)
        vm.setData({
          winH: vm.data.winH - 20,
          opacity: vm.data.winH / winHeight
        })
        vm.hide()
      }
    }, 10);
  }
})