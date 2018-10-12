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
const SRCS1 = { //定义初始图片对象(单选)
  "A": "/imgs/A.png",
  "B": "/imgs/B.png",
  "C": "/imgs/C.png",
  "D": "/imgs/D.png"
}
const SRCS2 = { //定义初始图片对象(多选)
  "A": "/imgs/A.png",
  "B": "/imgs/B.png",
  "C": "/imgs/C.png",
  "D": "/imgs/D.png",
  "E": "/imgs/E.png"
}
Page({
  /**
   * 页面的初始数据
   */
  data: {
    id: 0, //书的编号,默认为0
    rightNum: 0, //正确答案数
    wrongNum: 0, //错误答案数
    selectAnswer: [], //多选选中的答案
    srcs: SRCS1,
    isLoaded: true, //是否已经载入完毕,用于控制过场动画
    cl_question_hidden: false //材料题是否隐藏题目
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let self = this;

    //根据章是否有字节来定制最后一次访问的key
    let last_view_key = 'last_view' + options.zhangjie_id + options.zhangIdx + options.jieIdx != "undefined" ? options.jieIdx : "";

    let last_view = wx.getStorageSync(last_view_key); //得到最后一次的题目id和顺序
    let id = last_view.id; //最后一次浏览的题的编号

    if (id == undefined) id = 0 //如果没有这个id说明这个章节首次访问
    let order = last_view.order;

    app.post(API_URL, "action=SelectShiti&id=" + id + "&z_id=" + options.z_id + "&order=" + order + "&username=" + options.username + "&acode=" + options.acode).then((res) => {
      //初始化试题对象，针对不同题型给试题添加各种属性
      let shiti = res.data.shiti[0];

      this.initShiti(shiti); //初始化试题对象

      //对是否是已答试题做处理
      wx.getStorage({
        key: options.zhangjie_id,
        success: function(res1) {
          let jie_answer_array = self.data.jieIdx != "undefined" ? res1.data[self.data.zhangIdx][self.data.jieIdx] : res1.data[self.data.zhangIdx] //根据章是否有子节所有已经回答的题
          let rightNum = 0;
          let wrongNum = 0;

          for (let i = 0; i < jie_answer_array.length; i++) {
            /**
             * 先处理是否是已经回答的题
             */
            if (jie_answer_array[i].id == res.data.shiti[0].id) { //如果是已答题目
              shiti.done_daan = jie_answer_array[i].daan;
              shiti.isAnswer = true;
              //先判断答题类型(单选、多选、材料)
              switch (jie_answer_array[i].select) { //根据不同题型更新状态
                case "单选题":
                  if (shiti.done_daan != res.data.shiti[0].answer) {
                    shiti.srcs[shiti.done_daan] = "/imgs/wrong_answer.png" //如果答错就把当前图标变为错误图标                 
                  }
                  shiti.srcs[res.data.shiti[0].answer] = "/imgs/right_answer.png" //将正确答案的图标变为正确图标
                  break;

                case "多选题":
                  for (let i = 0; i < res.data.shiti[0].answer.length; i++) {
                    shiti.srcs[res.data.shiti[0].answer[i]] = "/imgs/right_answer.png";
                  }

                  for (let i = 0; i < shiti.done_daan.length; i++) {
                    if (res.data.shiti[0].answer.indexOf(shiti.done_daan[i]) >= 0) { //如果正确答案包含选中
                      shiti.srcs[shiti.done_daan[i]] = "/imgs/right_answer1.png";
                    } else {
                      shiti.srcs[shiti.done_daan[i]] = "/imgs/wrong_answer.png";
                    }
                  }
                  break;
              }
            }

            /**
             * 得到正确题数和错误题数
             */
            if (jie_answer_array[i].isRight == 1) { //如果是答对了
              rightNum++;
            } else {
              wrongNum++;
            }
            self.setData({
              rightNum: rightNum, //设置本页面的正确题数
              wrongNum: wrongNum //设置本页面的错误题数
            });
          }

          self.setData({
            shiti: shiti
          })
        },
      })

      if (res.data.shiti.length == 0) { //没有试题了

        return false
      }

      wx.setStorageSync("id", shiti.id);

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
        isLoaded: false, //是否已经载入完毕,用于控制过场动画
        username: options.username,
        acode: options.acode
      });
      wx.hideLoading();
    }).catch((errMsg) => {
      console.log(errMsg); //错误提示信息
      wx.hideLoading();
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

    // 向左滑动  
    if (Math.abs(touchMove - touchDot) >= 40 && time < 10 && tmpFlag == true) {
      tmpFlag = false;

      let id = wx.getStorageSync("id");

      let order = touchMove - touchDot > 0 ? "desc" : "asc"; //得到题的顺序

      self.storeLastShiti(order); //存储最后一题的状态

      app.post(API_URL, "action=SelectShiti&id=" + id + "&z_id=" + self.data.z_id + "&order=" + order + "&username=" + self.data.username + "&acode=" + self.data.acode).then((res) => {
        let shiti = res.data.shiti[0];

        this.initShiti(shiti); //初始化试题对象
        console.log(shiti)

        if (res.data.shiti.length == 0) {
          console.log('最后一题')
          return false
        }

        //先判断是否是已经作答过的题
        let zhangjie_id = self.data.zhangjie_id;
        let zhangIdx = self.data.zhangIdx;
        let jieIdx = self.data.jieIdx;
        let srcs = self.data.srcs; //选项前的图标对象
        let done_daan = "";
        let isAnswer = false;

        wx.getStorage({
          key: zhangjie_id,
          success: function(res1) {
            let jie_answer_array = jieIdx != "undefined" ? res1.data[zhangIdx][jieIdx] : res1.data[zhangIdx] //根据章是否有子节所有已经回答的题
            for (let i = 0; i < jie_answer_array.length; i++) {
              if (jie_answer_array[i].id == res.data.shiti[0].id) {
                done_daan = jie_answer_array[i].daan;
                isAnswer = true;

                //先判断答题类型(单选、多选、材料)
                switch (jie_answer_array[i].select) { //根据不同题型更新状态
                  case "单选题":
                    if (done_daan != res.data.shiti[0].answer) {
                      srcs[done_daan] = "/imgs/wrong_answer.png" //如果答错就把当前图标变为错误图标                 
                    }
                    srcs[res.data.shiti[0].answer] = "/imgs/right_answer.png" //将正确答案的图标变为正确图标
                    break;

                  case "多选题":
                    for (let i = 0; i < res.data.shiti[0].answer.length; i++) {
                      srcs[res.data.shiti[0].answer[i]] = "/imgs/right_answer.png";
                    }

                    for (let i = 0; i < done_daan.length; i++) {
                      if (res.data.shiti[0].answer.indexOf(done_daan[i]) >= 0) { //如果正确答案包含选中
                        srcs[done_daan[i]] = "/imgs/right_answer1.png";
                      } else {
                        srcs[done_daan[i]] = "/imgs/wrong_answer.png";
                      }
                    }
                    break;
                }

                self.setData({
                  srcs: srcs, //更新srcs状态
                  hiddenjiexi: false, //如果该题已经作答，就展示解析
                  isAnswer: isAnswer, //设置成已经回答
                  daan: done_daan //选中的答案
                })
              }
            }
          },
        })

        wx.setStorageSync("id", res.data.shiti[0].id);

        self.setData({
          id: res.data.shiti[0].id, //书的ID编号
          num_color: num_color, //编号颜色
          isAnswer: false,
          srcs: { //4个选项对应的图片
            "A": "/imgs/A.png",
            "B": "/imgs/B.png",
            "C": "/imgs/C.png",
            "D": "/imgs/D.png",
            "E": "/imgs/E.png",
          },
          question: res.data.shiti[0].question,
          px: res.data.shiti[0].px, //题编号
          TX: tx,
          TX_n: res.data.shiti[0].TX,
          A: res.data.shiti[0].A,
          B: res.data.shiti[0].B,
          C: res.data.shiti[0].C,
          D: res.data.shiti[0].D,
          E: res.data.shiti[0].E,
          answer: res.data.shiti[0].answer,
          jiexi: res.data.shiti[0].jiexi,
          checked: false,
          daan_class: '',
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
   * 单选题作答
   */
  singleSelect: function(e) {
    let self = this;
    let shiti = self.data.shiti; //本试题对象

    this.changeSingleSelectStatus(e, self.data.shiti); //改变试题状态

    this.postAnswerToServer(self.data.acode, self.data.username, shiti.id, shiti.flag, shiti.done_daan);//向服务器提交答题结果

    this.storeAnswerStatus(shiti); //存储答题状态
  },
  //初始化srcs数据
  reset: function(srcs) {
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
    let srcs = this.reset(self.data.srcs); //初始化srcs
    let isAnswer = self.data.isAnswer;

    if (isAnswer) return //如果已经回答了 就不作反应

    for (let i = 0; i < daan.length; i++) {
      srcs[daan[i]] = "/imgs/right_answer.png"; //将所有选中的选项置位正确图标
    }

    self.setData({
      srcs: srcs,
      selectAnswer: daan
    })

  },
  chenckChange: function(e) {
    let self = this;
    let user = wx.getStorageSync("user") //得到用户信息
    let daan = self.data.selectAnswer; //已经选择的答案
    let srcs = self.data.srcs; //图片对象
    let answers = self.data.answer.split(""); //将“ABD” 这种字符串转为字符数组
    let rightNum = self.data.rightNum; //正确答案总数量
    let wrongNum = self.data.wrongNum; //错误答案总数量
    let isAnswer = self.data.isAnswer; //是否已经回答

    let acode = user.acode; //用户唯一码(用于向服务器存储)
    let username = user.username; //用户姓名(用于向服务器存储)
    let tid = self.data.id; //当前试题id(用于向服务器存储)
    let flag = 1; //答案是否正确(用于向服务器存储)
    let answer = self.data.answer; //用户的答案(用于向服务器存储)

    if (isAnswer) return //如果已经回答过就不作反应

    for (let i = 0; i < answers.length; i++) {
      srcs[answers[i]] = "/imgs/right_answer.png";
    }

    for (let i = 0; i < daan.length; i++) {
      console.log(answers.indexOf(daan[i]))
      if (answers.indexOf(daan[i]) >= 0) { //如果正确答案包含选中
        srcs[daan[i]] = "/imgs/right_answer1.png";
      } else {
        srcs[daan[i]] = "/imgs/wrong_answer.png";
      }
    }
    /**
     * 比较正确答案和已经选择选项，因为都是数组，数组比较内容需要转到字符串，因为数组也是对象，对象的比较默认为变量地址
     */
    if (answers.toString() == daan.toString()) {
      rightNum++; //如果答案正确，正确数量增加
      flag = 1;
    } else {
      wrongNum++; //如果答案错误，错误数量增加
      flag = 0;
    }
    console.log("action=saveShitiResult&acode=" + acode + "&username=" + username + "&tid=" + self.data.id + "&flag=" + flag + "&answer=" + answer)
    //向服务器提交做题结果
    app.post(API_URL, "action=saveShitiResult&acode=" + acode + "&username=" + username + "&tid=" + self.data.id + "&flag=" + flag + "&answer=" + answer).then((res) => {
      wx.hideLoading();
    })

    //存储答题状态
    let zhangIdx = self.data.zhangIdx;
    let jieIdx = self.data.jieIdx;
    let answer_nums_array = [];
    wx.getStorage({
      key: self.data.zhangjie_id,
      success: function(res) {
        answer_nums_array = res.data;
        let obj = {
          "id": self.data.id,
          "daan": daan,
          "select": "多选题",
          "isRight": shiti.flag
        }
        if (jieIdx != "undefined") {
          answer_nums_array[zhangIdx][jieIdx].push(obj)
        } else {
          answer_nums_array[zhangIdx].push(obj)
        }
        self.setData({
          answer_nums_array: answer_nums_array
        })

        wx.setStorage({
          key: self.data.zhangjie_id,
          data: self.data.answer_nums_array
        })
      }
    })

    self.setData({
      hiddenjiexi: false,
      srcs: srcs,
      rightNum: rightNum,
      wrongNum: wrongNum,
      isAnswer: true
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
  initShiti: function(shiti) {
    let TX = shiti.TX;

    //给试题设置章idx 节idx 和默认已做答案等
    shiti.done_daan = "";
    shiti.isAnswer = false;
    shiti.hiddenjiexi = true;

    if (TX == 1) { //单选
      shiti.num_color = "#0197f6";
      shiti.tx = "单选题"
      shiti.srcs = SRCS1;
    } else if (TX == 2) { //多选
      shiti.num_color = "#2ac414";
      shiti.tx = "多选题"
      shiti.srcs = SRCS2;
    } else if (TX == 99) { //材料
      shiti.num_color = "#eaa91d";
      shiti.tx = "材料题"
      let xiaoti = shiti.xiaoti;
      for (let i = 0; i < xiaoti.length; i++) {
        let ti = xiaoti[i];
        if (ti.TX == 1) {
          ti.num_color = "#0197f6";
          ti.tx = "单选题";
          ti.srcs = SRCS1;
        } else if (ti.TX == 2) {
          ti.num_color = "#2ac414";
          ti.tx = "多选题";
          ti.srcs = SRCS2;
        }
      }
    }
  },
  /**
   * 单选作答
   * param:
   */
  changeSingleSelectStatus: function(e, shiti) {
    let self = this;
    //如果已经回答了就直接返回
    if (shiti.isAnswer) return;

    let done_daan = e.detail.value; //选中的答案
    let srcs = shiti.srcs; //选项前的图标对象
    let rightNum = self.data.rightNum; //当前正确答案数
    let wrongNum = self.data.wrongNum; //当前错误答案数
    let flag = 0;//初始化正确还是错误

    srcs[shiti.answer] = "/imgs/right_answer.png";
    //先判断是否正确
    if (done_daan != shiti.answer) {
      srcs[done_daan] = "/imgs/wrong_answer.png" //如果答错就把当前图标变为错误图标
      wrongNum++; //错误答案数增加
      flag = 0;
    } else {
      rightNum++; //正确答案数增加
      flag = 1;
    }

    srcs[self.data.answer] = "/imgs/right_answer.png" //将正确答案的图标变为正确图标

    shiti.hiddenjiexi = false;
    shiti.isAnswer = true;
    shiti.done_daan = done_daan; //已经做的选择
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
    app.post(API_URL, "action=saveShitiResult&acode=" + acode + "&username=" + username + "&tid=" + id + "&flag=" + flag + "&answer=" + done_daan).then((res) => {
      wx.hideLoading();
    })
  },
  /**
   * 根据已做答案和正确答案更新shiti的srcs
   */
  changeSrcs: function (done_daan, answer, tx){
    switch(tx){
      
    }
  },
  /**
   * 存储答题状态
   */
  storeAnswerStatus: function(shiti) {
    let self = this;
    let answer_nums_array = [];
    let zhangIdx = self.data.zhangIdx;
    let jieIdx = self.data.jieIdx;

    wx.getStorage({
      key: self.data.zhangjie_id,
      success: function(res) {
        answer_nums_array = res.data;
        let obj = {
          "id": shiti.id,
          "done_daan": shiti.done_daan,
          "select": "单选题",
          "isRight": shiti.flag
        }
        //根据章是否有字节的结构来
        if (shiti.jieIdx != "undefined") {
          answer_nums_array[zhangIdx][jieIdx].push(obj)
        } else {
          answer_nums_array[zhangIdx].push(obj)
        }
        self.setData({
          answer_nums_array: answer_nums_array
        })
        wx.setStorage({
          key: self.data.zhangjie_id,
          data: self.data.answer_nums_array
        })
      }
    })
  },
  /**
   * 存储最后一题
   */
  storeLastShiti: function(order) {
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
    // self.setData({
    //   last_view_key: last_view_key
    // })
    //本地存储最后一次访问的题目
    wx.setStorage({
      key: last_view_key,
      data: {
        'id': self.data.shiti.id,
        'order': order
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
})