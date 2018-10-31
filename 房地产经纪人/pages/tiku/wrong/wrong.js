// pages/tiku/mark/mark.js
const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址
let common = require('../../../common/shiti.js');
let post = require('../../../common/post.js');

const util = require('../../../utils/util.js')
//把winHeight设为常量，不要放在data里（一般来说不用于渲染的数据都不能放在data里）
const winHeight = wx.getSystemInfoSync().windowHeight
const app = getApp();

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
    isHasShiti: true,//默认有试题,
    isSubmit: false,//是否已提交答卷
    circular: false,//默认slwiper不可以循环滚动
    myFavorite: 0,//默认收藏按钮是0
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
    let circular =false;
    let myFavorite = 0;
    
    app.post(API_URL, "action=GetErrorShiti&kid=" + kid + "&username=" + username + "&acode=" + acode, true,true,"载入错题中",self).then((res) => {
      post.wrongAndMarkOnload(options, px, circular, myFavorite,false, res, username, acode, self);

    }).catch((errMsg) => {
      console.log(errMsg); //错误提示信息
      self.setData({
        isHasShiti:false
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
      success: function (res) { //转换窗口高度
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
    * slider改变事件
    */
  sliderChange: function (e) {
    let self = this;
    let lastSliderIndex = self.data.lastSliderIndex;
    let current = e.detail.current;
    let source = e.detail.source;
    let myFavorite = 0;

    if (source != "touch") return;

    let px = self.data.px;
    let direction = "";
    let shitiArray = self.data.shitiArray;
    let doneAnswerArray = self.data.doneAnswerArray;
    let circular = self.data.circular;

    //判断滑动方向
    if ((lastSliderIndex == 0 && current == 1) || (lastSliderIndex == 1 && current == 2) || (lastSliderIndex == 2 && current == 0)) {//左滑
      direction = "左滑";
    } else {
      direction = "右滑";
    }

    if (direction == "左滑") {
      px++;
    } else {
      px--;
    }

    let preShiti = undefined;//前一题
    let nextShiti = undefined;//后一题
    let midShiti = shitiArray[px - 1];//中间题

    myFavorite = midShiti.favorite;

    //每次滑动结束后初始化前一题和后一题
    if (direction == "左滑") {
      if (px < shitiArray.length) {//如果还有下一题
        nextShiti = shitiArray[px];
        common.initShiti(nextShiti, self); //初始化试题对象

        //先处理是否是已经回答的题    
        common.processDoneAnswer(nextShiti.done_daan, nextShiti, self);
      }
      preShiti = shitiArray[px - 2];//肯定会有上一题
    } else {//右滑
      if (px > 1) {//如果还有上一题
        preShiti = shitiArray[px - 2];
        common.initShiti(preShiti, self); //初始化试题对象
        common.processDoneAnswer(preShiti.done_daan, preShiti, self);
      }
      nextShiti = shitiArray[px];
    }

    //滑动结束后,更新滑动试题数组
    let sliderShitiArray = [];

    if (px != 1 && px != shitiArray.length) {
      if (current == 1) {
        if (nextShiti != undefined) sliderShitiArray[2] = nextShiti;
        sliderShitiArray[1] = midShiti;
        if (preShiti != undefined) sliderShitiArray[0] = preShiti;
      } else if (current == 2) {
        if (nextShiti != undefined) sliderShitiArray[0] = nextShiti;
        sliderShitiArray[2] = midShiti;
        if (preShiti != undefined) sliderShitiArray[1] = preShiti;

      } else {
        if (nextShiti != undefined) sliderShitiArray[1] = nextShiti;
        sliderShitiArray[0] = midShiti;
        if (preShiti != undefined) sliderShitiArray[2] = preShiti;
      }
    } else if (px == 1) {
      sliderShitiArray[0] = midShiti;
      sliderShitiArray[1] = nextShiti;
      current = 0;
      self.setData({
        myCurrent: 0
      })
    } else if (px == shitiArray.length) {
      sliderShitiArray[0] = preShiti;
      sliderShitiArray[1] = midShiti;
      current = 1;
      self.setData({
        myCurrent: 1
      })
    }

    circular = px == 1 || px == shitiArray.length ? false : true//如果滑动后编号是1,或者最后一个就禁止循环滑动

    self.setData({ //每滑动一下,更新试题
      shitiArray: shitiArray,
      sliderShitiArray: sliderShitiArray,
      circular: circular,
      myFavorite: myFavorite,
      lastSliderIndex: current,
      px: px,
      checked: false
    })
  },

  /**
  * 作答
  */
  _answerSelect: function (e) {
    let self = this;
    let px = self.data.px;
    let done_daan = "";
    let shitiArray = self.data.shitiArray;//所有试题对象

    let sliderShitiArray = self.data.sliderShitiArray;
    let current = self.data.lastSliderIndex//当前滑动编号
    let currentShiti = sliderShitiArray[current];

    let shiti = shitiArray[px - 1]; //本试题对象

    done_daan = shiti.TX == 1 ? e.detail.done_daan : shiti.selectAnswer; //根据单选还是多选得到done_daan

    if (shiti.isAnswer) return;

    common.changeSelectStatus(done_daan, shiti, self); //改变试题状态
    common.changeSelectStatus(done_daan, currentShiti, self); //改变试题状态

    this.setData({
      shitiArray: shitiArray,
      sliderShitiArray: sliderShitiArray
    })

    common.changeNum(shiti.flag, self); //更新答题的正确和错误数量

    common.postAnswerToServer(self.data.acode, self.data.username, shiti.id, shiti.flag, shiti.done_daan, app, API_URL); //向服务器提交答题结果

    common.storeAnswerArray(shiti, self) //存储已答题数组

    common.setMarkAnswer(shiti, self.data.isModelReal, self.data.isSubmit, self)//更新答题板状态

    common.ifDoneAll(shitiArray, self.data.doneAnswerArray);//判断是不是所有题已经做完
  },

  /**
   * 多选题选一个选项
   */
  _checkVal: function (e) {
    let self = this;
    let done_daan = e.detail.done_daan.sort();
    let px = self.data.px;
    let shitiArray = self.data.shitiArray;

    let sliderShitiArray = self.data.sliderShitiArray;
    let current = self.data.lastSliderIndex//当前滑动编号
    let currentShiti = sliderShitiArray[current];

    let shiti = shitiArray[px - 1];

    //初始化多选的checked值
    common.initMultiSelectChecked(currentShiti);
    //遍历这个答案，根据答案设置shiti的checked属性

    done_daan = common.changeShitiChecked(done_daan, currentShiti);
    common.changeMultiShiti(done_daan, currentShiti);
    common.changeMultiShiti(done_daan, shiti);
    this.setData({
      sliderShitiArray: sliderShitiArray,
      shitiArray: shitiArray
    })
  },

  /**
   * 材料题点击开始作答按钮
   */
  CLZuoti: function (e) {
    let self = this;
    self.waterWave.containerTap(e);
    let str = "#q" + self.data.px;
    let question = self.selectComponent(str);

    let px = self.data.px;
    let shitiArray = self.data.shitiArray;
    let shiti = shitiArray[px - 1];

    question.spreadAnimation();

    self.setData({
      cl_question_hidden: true
    })
  },

  /**
    * 材料题多选点击一个选项
    */
  _CLCheckVal: function (e) {
    let self = this;
    let px = e.currentTarget.dataset.px;
    let done_daan = e.detail.done_daan.sort();
    let shitiArray = self.data.shitiArray;
    let shitiPX = self.data.px;
    let shiti = shitiArray[shitiPX - 1]; //本试题对象

    let sliderShitiArray = self.data.sliderShitiArray;
    let current = self.data.lastSliderIndex//当前滑动编号
    let currentShiti = sliderShitiArray[current];
    let currentXiaoti = currentShiti.xiaoti

    let xiaoti = shiti.xiaoti; //材料题下面的小题
    for (let i = 0; i < xiaoti.length; i++) {
      if (px - 1 == i) { //找到对应小题
        if (xiaoti[i].isAnswer) return;
        //初始化多选的checked值
        common.initMultiSelectChecked(currentXiaoti[i]);
        //遍历这个答案，根据答案设置shiti的checked属性
        done_daan = common.changeShitiChecked(done_daan, currentXiaoti[i]);

        common.changeMultiShiti(done_daan, xiaoti[i]);
        common.changeMultiShiti(done_daan, currentXiaoti[i]);
      }
    }
    this.setData({
      sliderShitiArray: sliderShitiArray,
      shitiArray: shitiArray
    })
  },

  /**
    * 材料题作答
    */
  _CLAnswerSelect: function (e) {
    let self = this;
    let px = e.currentTarget.dataset.px;

    let done_daan = "";

    let shitiPX = self.data.px;//试题的px
    let shitiArray = self.data.shitiArray
    let shiti = shitiArray[shitiPX - 1]; //本试题对象
    let xiaoti = shiti.xiaoti;

    let sliderShitiArray = self.data.sliderShitiArray;
    let current = self.data.lastSliderIndex//当前滑动编号
    let currentShiti = sliderShitiArray[current];
    let currentXiaoti = currentShiti.xiaoti

    if (shiti.isAnswer) return;

    for (let i = 0; i < xiaoti.length; i++) {
      if (px - 1 == i) { //找到对应的小题
        if (xiaoti[i].isAnswer) return;
        done_daan = xiaoti[i].TX == 1 ? e.detail.done_daan : xiaoti[i].selectAnswer; //根据单选还是多选得到done_daan,多选需要排序
        common.changeSelectStatus(done_daan, xiaoti[i], self); //改变试题状态
        common.changeSelectStatus(done_daan, currentXiaoti[i], self); //改变试题状态

        if (xiaoti[i].flag == 1) shiti.flag = 1; //如果小题错一个,整个材料题就是错的
        shiti.doneAnswer.push({
          'px': px,
          'done_daan': done_daan
        }); //向本材料题的已答数组中添加已答题目px 和 答案信息

        if (shiti.doneAnswer.length == xiaoti.length) { //说明材料题已经全部作答

          shiti.done_daan = shiti.doneAnswer; //设置该试题已作答的答案数组

          common.changeNum(shiti.flag, self); //更新答题的正确和错误数量

          common.postAnswerToServer(self.data.acode, self.data.username, shiti.id, shiti.flag, "测试", app, API_URL); //向服务器提交答题结果

          common.storeAnswerArray(shiti, self); //只存储答题状态,不做本地存储

          common.setMarkAnswer(shiti, self.data.isModelReal, self.data.isSubmit, self)//更新答题板状态

          common.ifDoneAll(shitiArray, self.data.doneAnswerArray);//判断是不是所有题已经做完
        }
      }
    }

    this.setData({
      sliderShitiArray: sliderShitiArray,
      shitiArray: shitiArray
    })
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
    let myFavorite = self.data.myFavorite;

    let px = self.data.px;
    let shitiArray = self.data.shitiArray;
    let shiti = shitiArray[px - 1];

    shiti.favorite = shiti.favorite == 0 ? 1 : 0;
    this.setData({
      myFavorite: shiti.favorite,
      shitiArray: shitiArray
    })
    app.post(API_URL, "action=FavoriteShiti&tid=" + shiti.id + "&username=" + username + "&acode=" + acode, false, true, "").then((res) => { })
  },
 
  /**
  * 答题板点击编号事件,设置当前题号为点击的题号
  */
  _tapEvent: function (e) {
    let self = this;
    let px = e.detail.px;

    let shitiArray = self.data.shitiArray;
    let doneAnswerArray = self.data.doneAnswerArray;
    let current = self.data.lastSliderIndex;//当前swiper的index
    let circular = self.data.circular;
    let myFavorite = 0;

    //得到swiper数组
    let preShiti = undefined;//前一题
    let nextShiti = undefined;//后一题
    let midShiti = shitiArray[px - 1];//中间题
    myFavorite = midShiti.favorite;

    let sliderShitiArray = [];

    common.initShiti(midShiti, self); //初始化试题对象
    common.processDoneAnswer(midShiti.done_daan, midShiti, self);

    if (px != 1 && px != shitiArray.length) {//如果不是第一题也是不是最后一题
      preShiti = shitiArray[px - 2];
      common.initShiti(preShiti, self); //初始化试题对象
      common.processDoneAnswer(preShiti.done_daan, preShiti, self);
      nextShiti = shitiArray[px];
      common.initShiti(nextShiti, self); //初始化试题对象
      common.processDoneAnswer(nextShiti.done_daan, nextShiti, self);
    } else if (px == 1) {//如果是第一题
      nextShiti = shitiArray[px];
      common.initShiti(nextShiti, self); //初始化试题对象
      common.processDoneAnswer(nextShiti.done_daan, nextShiti, self);
    } else {
      preShiti = shitiArray[px - 2];
      common.initShiti(preShiti, self); //初始化试题对象
      common.processDoneAnswer(preShiti.done_daan, preShiti, self);
    }

    //点击结束后,更新滑动试题数组
    if (px != 1 && px != shitiArray.length) {
      if (current == 1) {
        if (nextShiti != undefined) sliderShitiArray[2] = nextShiti;
        sliderShitiArray[1] = midShiti;
        if (preShiti != undefined) sliderShitiArray[0] = preShiti;
      } else if (current == 2) {
        if (nextShiti != undefined) sliderShitiArray[0] = nextShiti;
        sliderShitiArray[2] = midShiti;
        if (preShiti != undefined) sliderShitiArray[1] = preShiti;

      } else {
        if (nextShiti != undefined) sliderShitiArray[1] = nextShiti;
        sliderShitiArray[0] = midShiti;
        if (preShiti != undefined) sliderShitiArray[2] = preShiti;
      }
    } else if (px == 1) {
      sliderShitiArray[0] = midShiti;
      sliderShitiArray[1] = nextShiti;
      current = 0;
      self.setData({
        myCurrent: 0
      })
    } else if (px == shitiArray.length) {
      sliderShitiArray[0] = preShiti;
      sliderShitiArray[1] = midShiti;
      current = 1;
      self.setData({
        myCurrent: 1
      })
    }

    circular = px == 1 || px == shitiArray.length ? false : true //如果滑动后编号是1,或者最后一个就禁止循环滑动

    self.setData({
      shitiArray: shitiArray,
      sliderShitiArray: sliderShitiArray,
      px: px,
      circular: circular,
      myFavorite: myFavorite,
      lastSliderIndex: current,
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