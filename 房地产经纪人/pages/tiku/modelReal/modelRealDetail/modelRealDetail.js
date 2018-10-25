// pages/tiku/modelReal/modelRealDetail/modelRealDetail.js
// pages/tiku/zuoti/index.js
const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址
let common = require('../../../../common/shiti.js');

const util = require('../../../../utils/util.js')
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

    isModelReal: true, //是不是真题或者押题
    isSubmit: false //是否已提交答卷
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: options.title
    }) //设置标题
    let self = this;
    let user = wx.getStorageSync('user');
    let username = user.username;
    let acode = user.acode;
    let tiType = options.tiType;
    let id = options.id;
    let tiTypeStr = tiType == 1?"model":"yati";

    //根据真题定制最后一次访问的key
    let last_view_key = 'lastModelReal' + options.id;

    let last_model_real = wx.getStorageSync(last_view_key); //得到最后一次的题目
    let px = last_model_real.px; //最后一次浏览的题的编号
    if (px == undefined) {
      px = 1 //如果没有这个px说明这个章节首次访问
    }
    app.post(API_URL, "action=SelectTestShow&sjid=" + id + "&username=" + username + "&acode=" + acode, true, true, "载入中").then((res) => {
      let shitiArray = res.data.list;

      let shiti = shitiArray[px - 1];


      //得到试题总数
      let nums = 0;
      for (let i = 0; i < shitiArray.length; i++) {
        let myShiti = shitiArray[i];
        if (myShiti.TX == 1 || myShiti.TX == 2) { //单选或者多选
          nums += 1;
        } else { //材料题
          for (let j = 0; j < myShiti.xiaoti.length; j++) {
            nums += 1;
          }
        }
      }

      common.initShitiArrayDoneAnswer(shitiArray);//将试题的所有done_daan置空

      common.initShiti(shiti, px, self); //初始化试题对象,不包括已答答案

      common.initMarkAnswer(shitiArray.length, self); //初始化答题板数组
      let isSubmit = wx.getStorageSync(tiTypeStr+'modelRealIsSubmit' + options.id);  

      //对是否是已答试题做处理
      wx.getStorage({
        key: tiTypeStr+"modelReal" + options.id,
        success: function(res1) {
          //根据章是否有子节所有已经回答的题
          let doneAnswerArray = res1.data;

          if (isSubmit == true){//说明是已经是提交过答案的题
            self.setData({
              text:"重新评测",
              isSubmit:true
            })
          }

          common.setMarkAnswerItems(doneAnswerArray, self.data.nums, self.data.isModelReal, self.data.isSubmit, self); //更新答题板状态

          //映射已答题目的已作答的答案到shitiArray
          for (let i = 0; i < doneAnswerArray.length;i++){
            let doneAnswer = doneAnswerArray[i];
            shitiArray[doneAnswer.px - 1].done_daan = doneAnswer.done_daan;//设置已答试题的答案
            if(doneAnswer.select == "材料题"){
              let daan = doneAnswer.done_daan;
              for (let j = 0; j < shitiArray[doneAnswer.px - 1].xiaoti.length;j++){
                for(let k = 0 ; k < daan.length ;k++){
                  let ti = shitiArray[doneAnswer.px - 1].xiaoti[j];
                  if (j == daan[k].px - 1) {
                    ti.done_daan = daan[k].done_daan;
                  }
                }
              }
            }
          }

          console.log(shitiArray)

          common.processModelRealDoneAnswer(shiti.done_daan, shiti, self);

          //如果已答试题数目大于0才更新shiti
          if (doneAnswerArray.length > 0) {
            self.setData({
              shiti: shiti,
              shitiArray: shitiArray,
              doneAnswerArray: doneAnswerArray, //获取该节所有的已做题目
            })
          }
        },
        fail: function() {
          wx.setStorage({
            key: tiTypeStr+"modelReal" + options.id,
            data: [],
          })
        }
      })

      //开始计时
      let interval = "";
      if (!isSubmit){//如果没提交
        let second = wx.getStorageSync(tiTypeStr+'last_time' + options.id);
        if (second) {
          interval = common.startWatch(second, self);
        } else {
          interval = common.startWatch(options.times * 60, self);
        }
      }else{//如果已提交
        let last_gone_time_str = wx.getStorageSync(tiTypeStr+"last_gone_time"+options.id);

        self.modelCount.setData({
          timeStr: last_gone_time_str
        })   
      }

      console.log(shitiArray)
      self.setData({
        //设置过场动画
        winH: wx.getSystemInfoSync().windowHeight,
        opacity: 1,

        id: options.id, //真题编号
        times: options.times, //考试时间
        totalscore:options.totalscore,//总分
        tiTypeStr: tiTypeStr,//题的类型字符串

        interval: interval,//计时器
        title: options.title, //标题
        text:"立即交卷",//按钮文字
        nums: nums, //题数
        shiti: shiti, //试题对象
        shitiArray: shitiArray, //整节的试题数组
        isLoaded: false, //是否已经载入完毕,用于控制过场动画
        username: username, //用户账号名称
        acode: acode //用户唯一码
      });

      wx.hideLoading();
    }).catch((errMsg) => {
      console.log(errMsg); //错误提示信息
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
    this.modelCount = this.selectComponent("#modelCount");

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
    let shitiArray = self.data.shitiArray;
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
        return;
      }
      if (px > shitiArray.length) { //最后一题时如果都答题完毕，就导航到答题完毕窗口，否则打开答题板
        if (doneAnswerArray.length == shitiArray.length) {
          wx.navigateTo({
            url: '/pages/prompt/jieAnswerAll/jieAnswerAll?title=' + self.data.title,
          })
        } else {
          wx.showToast({
            title: '这是最后一题',
            icon: 'none',
            duration: 4000,
            success: function() {
              self.showMarkAnswer();
            }
          })
        }
        clearInterval(interval); // 清除setInterval
        time = 0;
        tmpFlag = true; // 恢复滑动事件
        return;
      }

      let shiti = shitiArray[px - 1];

      common.storeModelRealLastShiti(px, self); //存储最后一题的状态

      common.initShiti(shiti, px, self); //初始化试题对象

      //先处理是否是已经回答的题    
      common.processModelRealDoneAnswer(shiti.done_daan, shiti, self);

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

    if (self.data.isSubmit) return
    let done_daan = "";
    let shitiArray = self.data.shitiArray;

    let shiti = self.data.shiti; //本试题对象

    console.log(shiti.answer);

    done_daan = shiti.TX == 1 ? e.detail.done_daan : e.detail.done_daan.sort(); //根据单选还是多选得到done_daan

    common.changeModelRealSelectStatus(done_daan, shiti, self); //改变试题状态

    this.setData({
      shiti: shiti
    })

    common.storeModelRealAnswerStatus(shiti, self); //存储答题状态

    common.setMarkAnswer(shiti, self.data.isModelReal, self.data.isSubmit, self)//更新答题板状态(单个)

    common.ifDoneAll(shitiArray, self.data.doneAnswerArray); //判断是不是所有题已经做完
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
   * 材料题作答
   */
  _CLAnswerSelect: function(e) {
    let self = this;

    if (self.data.isSubmit) return;
    let px = e.currentTarget.dataset.px;
    let done_daan = "";
    let shitiArray = self.data.shitiArray
    let shiti = self.data.shiti; //本试题对象
    let xiaoti = shiti.xiaoti;

    for (let i = 0; i < xiaoti.length; i++) {
      if (px - 1 == i) { //找到对应的小题
        done_daan = xiaoti[i].TX == 1 ? e.detail.done_daan : e.detail.done_daan.sort();; //根据单选还是多选得到done_daan,多选需要排序
        common.changeModelRealSelectStatus(done_daan, xiaoti[i], self); //改变试题状态
        if (xiaoti[i].flag == 1) shiti.flag = 1; //如果小题错一个,整个材料题就是错的
        xiaoti[i].done_daan = done_daan;//设置小题的已做答案
        let isStore = false;
        console.log(xiaoti[i].answer)
        //更新小题已经作答的答案
        for (let j = 0; j < shiti.doneAnswer.length; j++) {
          let doneAnswer = shiti.doneAnswer[j];
          if (doneAnswer.px == px) {
            doneAnswer.done_daan = done_daan
            doneAnswer.isRight = xiaoti[i].flag;
            isStore = true;
            break;
          }
        }

        if (!isStore) {
          shiti.doneAnswer.push({
            'px': px,
            'done_daan': done_daan,
            'isRight': xiaoti[i].flag
          }); //向本材料题的已答数组中添加已答题目px 和 答案信息
        }

        shiti.done_daan = shiti.doneAnswer; //设置该试题已作答的答案数组

        common.storeModelRealAnswerStatus(shiti, self); //存储答题状态

        if (shiti.doneAnswer.length == xiaoti.length) { //说明材料题已经全部作答

          common.setMarkAnswer(shiti, self.data.isModelReal, self.data.isSubmit, self)//更新答题板状态(单个)

          common.ifDoneAll(shitiArray, self.data.doneAnswerArray); //判断是不是所有题已经做完
        }
        this.setData({
          shiti: shiti,
          shitiArray:shitiArray
        })
      }
    }
  },

  /**
   * 刚载入时的动画
   */
  onShow: function(e) {
    let self = this;
    self.hide(); //动画效果

    if(self.data.isSubmit){
      self._showMarkAnswer();
    }
  },

  /**
   * 记录时间
   */
  onUnload:function(e){
    let self = this;
    let modelCount = self.modelCount;

    if(!self.data.isSubmit){
      let time = modelCount.data.time;

      let second = time.h * 3600 + time.m * 60 + time.s;

      clearInterval(self.data.interval);//停止计时器

      wx.setStorage({
        key: self.data.tiTypeStr+'last_time' + self.data.id,
        data: second,
      })
    }
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
  _showMarkAnswer: function() {
    this.markAnswer.showDialog();
  },
  /**
   * 隐藏答题板
   */
  _hideMarkAnswer: function() {
    this.markAnswer.hideDialog();
  },

  /**
   * 答题板点击编号事件,设置当前题号为点击的题号
   */
  _tapEvent: function(e) {
    let self = this;
    let px = e.detail.px;
    let shitiArray = self.data.shitiArray;
    let doneAnswerArray = self.data.doneAnswerArray;
    let isSubmit = self.data.isSubmit;

    let shiti = shitiArray[px - 1];

    common.storeModelRealLastShiti(px, self); //存储最后一题的状态

    common.initShiti(shiti, px, self); //初始化试题对象
  
    common.processModelRealDoneAnswer(shiti.done_daan, shiti, self);
 
    self.setData({
      shiti: shiti,
      checked: false
    })
    self._hideMarkAnswer();
  },

  /**
   * 点击立即交卷后
   */
  _submit: function() {
    let self = this;
    let shitiArray = self.data.shitiArray; //所有试题
    let id = self.data.id;//真题的id号
    let doneAnswerArray = self.data.doneAnswerArray; //已经回答的试题
    let times = self.data.times; //考试总时间
    let totalscore = self.data.totalscore//总分
    let allNums = self.data.nums;//题的总数
    let rightNums = 0; //正确题数
    let wrongNums = 0; //错误题数
    let score = 0; //分数
    let undone = 0;//未做题数
    let time = self.modelCount.data.time;//当前时间,对象格式
    let gone_time = 0;//花费时间
    let username = self.data.username;
    let acode = self.data.acode;
    let sjid = self.data.id;

    let doneUserAnswer = common.getDoneAnswers(shitiArray);
    console.log(doneUserAnswer)

    //得到花费的时间
    gone_time = times * 60 - (time.h*3600+time.m*60+time.s);

    //得到正确数和错误数
    for (let i = 0; i < doneAnswerArray.length; i++) {
      let doneAnswer = doneAnswerArray[i]; //单个已经回答的试题
      let px = doneAnswer.px;
      switch (doneAnswer.select) {
        case "单选题":
        case "多选题":
          if (doneAnswer.isRight == 0) { //正确
            rightNums += 1;
            score += shitiArray[px-1].score;
          } else {
            wrongNums += 1;
          }
          break;

        case "材料题":
          for (let j = 0; j < doneAnswer.done_daan.length; j++) {          
            let daan = doneAnswer.done_daan[j];
            if (daan.isRight == 0){
              rightNums += 1;
              score += shitiArray[px - 1].xiaoti[daan.px-1].score;
            }else{
              wrongNums += 1;
            }
          }
          break;
      }
    }

    undone = allNums - rightNums -wrongNums;//计算出未做题数

    // app.post(API_URL, "action=SaveTestResult&sjid=" + 10 + "&username=" + username + "&acode=" + acode, true, true, "载入中").then((res) => {
    // })
    wx.navigateTo({
      url: '/pages/prompt/modelRealScore/modelRealScore?score=' + score + "&rightNums=" + rightNums + "&wrongNums=" + wrongNums + "&undone=" + undone +"&totalscore="+totalscore+"&id="+ id+"&gone_time="+gone_time
    })

    
  },

  /**
   * 重新评测
   */
  _restart:function(){
    let self = this;
    common.restartModelReal(self);
  },
  /**
   * 载入动画
   */
  hide: function() {
    var vm = this
    var interval = setInterval(function() {
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
  },
})