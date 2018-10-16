// pages/tiku/zuoti/index.js
const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址

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
    selectAnswer: [], //多选选中的答案
    isLoaded: true, //是否已经载入完毕,用于控制过场动画
    cl_question_hidden: false, //材料题是否隐藏题目
    checked: false, //选项框是否被选择
    jieDoneAnswerArray: [], //已做答案数组
    markAnswerItems: [], //设置一个空数组
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let self = this;
    let user = wx.getStorageSync('user');
    let username = user.username;
    let acode = user.acode;

    //根据章是否有字节来定制最后一次访问的key
    let last_view_key = 'last_view' + options.zhangjie_id + options.zhangIdx + (options.jieIdx != "undefined" ? options.jieIdx : "");


    let last_view = wx.getStorageSync(last_view_key); //得到最后一次的题目
    let px = last_view.px; //最后一次浏览的题的编号
    if (px == undefined) {
      px = 1 //如果没有这个px说明这个章节首次访问
    }
    app.post(API_URL, "action=SelectShiti&px=" + px + "&z_id=" + options.z_id +  "&username=" + username + "&acode=" + acode,true).then((res) => {
      let shitiArray = res.data.shiti;     

      let shiti = res.data.shiti[px-1];

      this.initShiti(shiti,px); //初始化试题对象

      this.initMarkAnswer(options.nums); //初始化答题板数组

      //对是否是已答试题做处理
      wx.getStorage({
        key: options.zhangjie_id,
        success: function(res1) {
          let jie_answer_array = self.data.jieIdx != "undefined" ? res1.data[self.data.zhangIdx][self.data.jieIdx] : res1.data[self.data.zhangIdx] //根据章是否有子节所有已经回答的题
          self.setMarkAnswerItems(jie_answer_array, options.nums); //设置答题板数组
          //先处理是否是已经回答的题    
          let rightAndWrongObj = {
            "rightNum": 0,
            "wrongNum": 0
          };
          for (let i = 0; i < jie_answer_array.length; i++) {
            if (jie_answer_array[i].id == res.data.shiti[0].id) { //如果是已答题目
              self.changeShiti(shiti, jie_answer_array[i].done_daan, shiti.answer, shiti.tx); //根据得到的已答数组更新试题状态
            }

            //根据已答试题库得到正确题数和错误题数
            self.setRightWrongNums(jie_answer_array[i].isRight, rightAndWrongObj);
          }

          //如果已答试题数目大于0才更新shiti
          if (jie_answer_array.length > 0) {
            self.setData({
              shiti: shiti,
              jieDoneAnswerArray: jie_answer_array, //获取该节所有的已做题目
              rightNum: rightAndWrongObj.rightNum,
              wrongNum: rightAndWrongObj.wrongNum
            })
          }
        },
      })

      self.setData({
        //设置过场动画
        winH: wx.getSystemInfoSync().windowHeight,
        opacity: 1,

        z_id: options.z_id, //点击组件的id编号
        zhangjie_id: options.zhangjie_id, //章节的id号，用于本地存储的key
        zhangIdx: options.zhangIdx, //章的id号
        jieIdx: options.jieIdx, //节的id号

        nums: options.nums, //题数
        shiti: shiti, //试题对象
        shitiArray: shitiArray,//整节的试题数组
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
    wx.getSystemInfo({//得到窗口高度,这里必须要用到异步,而且要等到窗口bar显示后再去获取,所以要在onReady周期函数中使用获取窗口高度方法
      success:function(res){//转换窗口高度
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
    let px = self.data.shiti.px;//试题的编号

    // 滑动  
    if (Math.abs(touchMove - touchDot) >= 40 && time < 10 && tmpFlag == true) {
      tmpFlag = false;
      touchMove - touchDot > 0 ? px-=1:px+=1
      if(px > self.data.nums){//最后一题时如果都答题完毕，就导航到答题完毕窗口，否则打开答题板
        let jieDoneAnswerArray = self.data.jieDoneAnswerArray;
        if (jieDoneAnswerArray.length == self.data.nums) {
          wx.navigateTo({
            url: '/pages/jieAnswerAll/jieAnswerAll',
          })
        } else {
          this.showMarkAnswer();
        }
        wx.hideLoading();
        clearInterval(interval); // 清除setInterval
        time = 0;
        tmpFlag = true; // 恢复滑动事件
        return;
      }

      let shitiArray = self.data.shitiArray;

      let shiti = shitiArray[px-1];

      self.storeLastShiti(px); //存储最后一题的状态

      this.initShiti(shiti, px); //初始化试题对象

      wx.getStorage({
        key: self.data.zhangjie_id,
        success: function (res1) {
          let jie_answer_array = self.data.jieIdx != "undefined" ? res1.data[self.data.zhangIdx][self.data.jieIdx] : res1.data[self.data.zhangIdx] //根据章是否有子节得到所有已经回答的题

          //先处理是否是已经回答的题    
          for (let i = 0; i < jie_answer_array.length; i++) {
            if (jie_answer_array[i].id == shiti.id) { //如果是已答题目
              self.changeShiti(shiti, jie_answer_array[i].done_daan, shiti.answer, shiti.tx); //根据得到的已答数组更新试题状态
            }
          }

          //如果已答试题数目大于0才更新shiti
          if (jie_answer_array.length > 0) {
            self.setData({
              shiti: shiti
            })
          }
        },
      })

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
  answerSelect: function(e) {
    let self = this;
    if (self.data.shiti.isAnswer) return

    let shiti = self.data.shiti; //本试题对象

    this.changeSelectStatus(e, shiti); //改变试题状态

    this.postAnswerToServer(self.data.acode, self.data.username, shiti.id, shiti.flag, shiti.done_daan); //向服务器提交答题结果

    this.storeAnswerStatus(shiti); //存储答题状态

    this.setMarkAnswerItems(self.data.jieDoneAnswerArray, self.data.nums); //更新答题板状态
  },
  /**
   * 多选题选一个选项
   */
  checkval: function(e) {
    let self = this;
    let shiti = self.data.shiti;
    let daan = e.detail.value;

    if (shiti.isAnswer) return //如果已经回答了 就不作反应

    for (let i = 0; i < daan.length; i++) {
      shiti.srcs[daan[i]] = "/imgs/right_answer.png"; //将所有选中的选项置位正确图标
    }

    self.setData({
      shiti: shiti,
      selectAnswer: daan //已经做的答案
    })

  },
  /**
   * 材料题开始作答
   */
  cailiaoZuoti: function() {
    this.setData({
      cl_question_hidden: true
    })
  },
  /**
   * 材料题单选
   */
  cailiaoRadioChange: function() {

  },

  /**
   * 初始化xiaoti
   */
  initShiti: function(shiti,px) {
    let TX = shiti.TX;

    //给试题设置章idx 节idx 和默认已做答案等
    shiti.done_daan = "";
    shiti.isAnswer = false;
    shiti.hiddenjiexi = true;
    shiti.px = px;

    if (TX == 1) { //单选
      shiti.num_color = "#0197f6";
      shiti.tx = "单选题"
      shiti.srcs = { //定义初始图片对象(单选)
        "A": "/imgs/A.png",
        "B": "/imgs/B.png",
        "C": "/imgs/C.png",
        "D": "/imgs/D.png"
      }
    } else if (TX == 2) { //多选
      shiti.num_color = "#2ac414";
      shiti.tx = "多选题"
      shiti.srcs = { //定义初始图片对象(多选)
        "A": "/imgs/A.png",
        "B": "/imgs/B.png",
        "C": "/imgs/C.png",
        "D": "/imgs/D.png",
        "E": "/imgs/E.png"
      };
    } else if (TX == 99) { //材料
      shiti.num_color = "#eaa91d";
      shiti.tx = "材料题"
      let xiaoti = shiti.xiaoti;
      for (let i = 0; i < xiaoti.length; i++) {
        let ti = xiaoti[i];
        if (ti.TX == 1) {
          ti.num_color = "#0197f6";
          ti.tx = "单选题";
          ti.srcs = { //定义初始图片对象(单选)
            "A": "/imgs/A.png",
            "B": "/imgs/B.png",
            "C": "/imgs/C.png",
            "D": "/imgs/D.png"
          };
        } else if (ti.TX == 2) {
          ti.num_color = "#2ac414";
          ti.tx = "多选题";
          ti.srcs = { //定义初始图片对象(多选)
            "A": "/imgs/A.png",
            "B": "/imgs/B.png",
            "C": "/imgs/C.png",
            "D": "/imgs/D.png",
            "E": "/imgs/E.png"
          };
        }
      }
    }
    this.setData({
      shiti: shiti
    })
  },
  /**
   * 初始化答题板数组
   */
  initMarkAnswer: function(nums) {
    let markAnswerItems = this.data.markAnswerItems;
    for (let i = 0; i < nums; i++) {
      markAnswerItems.push({});
    }
    this.setData({
      markAnswerItems: markAnswerItems
    })
  },
  /**
   * 更改选择状态
   */
  changeSelectStatus: function(e, shiti) {
    let self = this;
    //如果已经回答了就直接返回

    let done_daan = e.detail.value; //选中的答案
    let srcs = shiti.srcs; //选项前的图标对象
    let rightNum = self.data.rightNum; //当前正确答案数
    let wrongNum = self.data.wrongNum; //当前错误答案数
    let flag = 0; //初始化正确还是错误

    switch (shiti.tx) {
      case "单选题":
        srcs[shiti.answer] = "/imgs/right_answer.png";
        //先判断是否正确
        if (done_daan != shiti.answer) {
          srcs[done_daan] = "/imgs/wrong_answer.png" //如果答错就把当前图标变为错误图标
          wrongNum++; //错误答案数增加
          flag = 1;
        } else {
          rightNum++; //正确答案数增加
          flag = 0;
        }
        srcs[self.data.answer] = "/imgs/right_answer.png" //将正确答案的图标变为正确图标
        shiti.done_daan = done_daan; //已经做的选择
        break;
      case "多选题":
        let daan = self.data.selectAnswer; //已经选择的答案
        let answers = shiti.answer.split(""); //将“ABD” 这种字符串转为字符数组
        shiti.done_daan = daan; //已经做的选择

        for (let i = 0; i < answers.length; i++) {
          shiti.srcs[answers[i]] = "/imgs/right_answer.png";
        }

        for (let i = 0; i < daan.length; i++) {
          if (answers.indexOf(daan[i]) >= 0) { //如果正确答案包含选中
            shiti.srcs[daan[i]] = "/imgs/right_answer1.png";
          } else {
            shiti.srcs[daan[i]] = "/imgs/wrong_answer.png";
          }
        }
        /**
         * 比较正确答案和已经选择选项，因为都是数组，数组比较内容需要转到字符串，因为数组也是对象，对象的比较默认为变量地址
         */
        if (answers.toString() == daan.toString()) {
          rightNum++; //如果答案正确，正确数量增加
          flag = 0;
        } else {
          wrongNum++; //如果答案错误，错误数量增加
          flag = 1;
        }
        break;
    }

    shiti.hiddenjiexi = false;
    shiti.isAnswer = true;
    shiti.flag = flag; //答案是否正确

    //更新所有数据
    self.setData({
      shiti: shiti,
      rightNum: rightNum, //更新正确答案数
      wrongNum: wrongNum, //更新错误答案数
    })
  },
  /**
   * 向服务器提交做题结果
   */
  postAnswerToServer: function(acode, username, id, flag, done_daan) {
    //向服务器提交做题结果
    app.post(API_URL, "action=saveShitiResult&acode=" + acode + "&username=" + username + "&tid=" + id + "&flag=" + flag + "&answer=" + done_daan,false).then((res) => {
    
    })
  },
  /**
   * 根据已做答案和正确答案更新shiti对象信息
   * 参数:
   *    1.shiti : 试题对象
   *    2.done_daan : 已选择答案
   *    3.answer : 该试题的正确答案
   *    4.tx : 试题的种类
   */
  changeShiti: function(shiti, done_daan, answer, tx) {
    switch (tx) {
      case "单选题":
        if (done_daan != answer) {
          shiti.srcs[done_daan] = "/imgs/wrong_answer.png" //如果答错就把当前图标变为错误图标                 
        }
        shiti.srcs[answer] = "/imgs/right_answer.png" //将正确答案的图标变为正确图标
        break;
      case "多选题":
        for (let i = 0; i < answer.length; i++) {
          shiti.srcs[answer[i]] = "/imgs/right_answer.png";
        }

        for (let i = 0; i < done_daan.length; i++) {
          if (answer.indexOf(done_daan[i]) >= 0) { //如果正确答案包含选中
            shiti.srcs[done_daan[i]] = "/imgs/right_answer1.png";
          } else {
            shiti.srcs[done_daan[i]] = "/imgs/wrong_answer.png";
          }
        }
        break;
    }
    shiti.isAnswer = true;
    shiti.done_daan = done_daan;
  },
  /**
   * 根据已答试题库得到正确题数和错误题数
   * 参数:
   *    1.isRight : 试题是否正确 1 正确 0 错误
   */
  setRightWrongNums: function(isRight, rightAndWrongObj) {
    rightAndWrongObj.rightNum

    if (isRight == 1) { //如果是答对了
      rightAndWrongObj.rightNum++;
    } else {
      rightAndWrongObj.wrongNum++;
    }
  },
  /**
   * 存储答题状态,更新答题板数据
   */
  storeAnswerStatus: function(shiti) {
    let self = this;
    let zhangIdx = self.data.zhangIdx;
    let jieIdx = self.data.jieIdx;
    let jieDoneAnswerArray = self.data.jieDoneAnswerArray

    let answer_nums_array = wx.getStorageSync(self.data.zhangjie_id);
    let obj = {
      "id": shiti.id,
      "done_daan": shiti.done_daan,
      "select": shiti.tx,
      "isRight": shiti.flag,
      "px": shiti.px
    }
    //根据章是否有字节的结构来
    if (shiti.jieIdx != "undefined") {
      answer_nums_array[zhangIdx][jieIdx].push(obj)
    } else {
      answer_nums_array[zhangIdx].push(obj)
    }
    jieDoneAnswerArray.push(obj) //存储已经做题的状态



    self.setData({
      jieDoneAnswerArray: jieDoneAnswerArray
    })

    wx.setStorage({
      key: self.data.zhangjie_id,
      data: answer_nums_array,
    })
  },
  /**
   * 存储最后一题
   */
  storeLastShiti: function(px) {
    let self = this;
    //存储当前最后一题
    let zhangIdx = self.data.zhangIdx;
    let jieIdx = self.data.jieIdx;
    let last_view_key = ""; //存储上次访问的题目的key
    if (jieIdx != "undefined") { //如果有子节
      last_view_key = 'last_view' + self.data.zhangjie_id + zhangIdx + jieIdx
    } else { //如果没有子节
      last_view_key = 'last_view' + self.data.zhangjie_id + zhangIdx
    }
    //本地存储最后一次访问的题目
    wx.setStorage({
      key: last_view_key,
      data: {
        'px': px
      },
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.hide()
  },
  //核心方法，线程与setData
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
  hideMarkAnswer: function() {
    this.markAnswer.hideDialog();
  },
  /**
   * 切换是否收藏该试题
   */
  _toogleMark:function(e){
    let self = this;
    let username = self.data.username;
    let acode = self.data.acode;
    let shiti = self.data.shiti;
    console.log("action=FavoriteShiti&tid=" + shiti.id + "&username=" + username + "&acode=" + acode)
    app.post(API_URL, "action=FavoriteShiti&tid=" +shiti.id + "&username=" + username + "&acode=" + acode, false).then((res) => {
      console.log(res)
    })
  },
  /**
   * 答题板点击编号事件,设置当前题号为点击的题号
   */
  _tapEvent: function(e) {
    let self = this;
    let px = e.detail.px;
    let zhangIdx = self.data.zhangIdx;
    let jieIdx = self.data.jieIdx;
    let shitiArray = self.data.shitiArray;

    let shiti = shitiArray[px-1];

    self.storeLastShiti(px); //存储最后一题的状态

    self.initShiti(shiti, px); //初始化试题对象

    wx.getStorage({
      key: self.data.zhangjie_id,
      success: function (res1) {
        let jie_answer_array = self.data.jieIdx != "undefined" ? res1.data[self.data.zhangIdx][self.data.jieIdx] : res1.data[self.data.zhangIdx] //根据章是否有子节所有已经回答的题

        //先处理是否是已经回答的题    
        for (let i = 0; i < jie_answer_array.length; i++) {
          if (jie_answer_array[i].id == shiti.id) { //如果是已答题目
            self.changeShiti(shiti, jie_answer_array[i].done_daan, shiti.answer, shiti.tx); //根据得到的已答数组更新试题状态
          }
        }

        //如果已答试题数目大于0才更新shiti
        if (jie_answer_array.length > 0) {
          self.setData({
            shiti: shiti
          })
        }
      },
    })

    self.setData({ //每滑动一下,更新试题
      shiti: shiti,
      checked: false
    })
  },
  /**
   * 映射该节已答题目，得到答题板迭代数组
   */
  setMarkAnswerItems: function(jie_answer_array, nums) {
    let markAnswerItems = this.data.markAnswerItems;
    for (let i = 0; i < jie_answer_array.length; i++) {
      let px = jie_answer_array[i].px;
      markAnswerItems[px - 1] = {
        "select": jie_answer_array[i].select,
        "isRight": jie_answer_array[i].isRight,
      }
    }

    this.setData({
      markAnswerItems: markAnswerItems
    })
  }
})