/**
 * 初始化试题
 */
function initShiti(shiti, px, self) {
  let TX = shiti.TX;

  //给试题设置章idx 节idx 和默认已做答案等
  shiti.isAnswer = false;
  shiti.px = px;

  if (TX == 1) { //单选
    shiti.num_color = "#0197f6";
    shiti.tx = "单选题"
    shiti.srcs = { //定义初始图片对象(单选)
      "A": "/imgs/A.png",
      "B": "/imgs/B.png",
      "C": "/imgs/C.png",
      "D": "/imgs/D.png",
      "E": "/imgs/E.png"
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
    shiti.A_checked = false;
    shiti.B_checked = false;
    shiti.C_checked = false;
    shiti.D_checked = false;
    shiti.E_checked = false;
  } else if (TX == 99) { //材料
    shiti.num_color = "#eaa91d";
    shiti.tx = "材料题";
    shiti.doneAnswer = [];
    shiti.confirm = false;
    let xiaoti = shiti.xiaoti;
    for (let i = 0; i < xiaoti.length; i++) {

      let ti = xiaoti[i];
      ti.px = i + 1; //小题编号
      ti.isAnswer = false; //默认不回答

      if (ti.TX == 1) {
        ti.num_color = "#0197f6";
        ti.tx = "单选题";
        ti.checked = false;
        ti.srcs = { //定义初始图片对象(单选)
          "A": "/imgs/A.png",
          "B": "/imgs/B.png",
          "C": "/imgs/C.png",
          "D": "/imgs/D.png"
        };
      } else if (ti.TX == 2) {
        ti.num_color = "#2ac414";
        ti.tx = "多选题";
        ti.checked = false;
        ti.srcs = { //定义初始图片对象(多选)
          "A": "/imgs/A.png",
          "B": "/imgs/B.png",
          "C": "/imgs/C.png",
          "D": "/imgs/D.png",
          "E": "/imgs/E.png"
        };
        ti.A_checked = false;
        ti.B_checked = false;
        ti.C_checked = false;
        ti.D_checked = false;
        ti.E_checked = false;
      }
    }
  }
  self.setData({
    shiti: shiti
  })
}

/**
 * 初始化答题板数组
 */
function initMarkAnswer(nums, self) {
  let markAnswerItems = self.data.markAnswerItems;
  for (let i = 0; i < nums; i++) {
    markAnswerItems.push({});
  }
  self.markAnswer.setData({
    markAnswerItems: markAnswerItems
  })
}

/**
 * 初始化一个多选题的checked
 */
function initMultiSelectChecked(shiti) {
  shiti.A_checked = false;
  shiti.B_checked = false;
  shiti.C_checked = false;
  shiti.D_checked = false;
  shiti.E_checked = false;
}
/**
 * 初始化一个多选题的srcs
 */
function initMultiShitiSrcs(shiti) {
  shiti.srcs = { //定义初始图片对象(多选)
    "A": "/imgs/A.png",
    "B": "/imgs/B.png",
    "C": "/imgs/C.png",
    "D": "/imgs/D.png",
    "E": "/imgs/E.png"
  };
}

/**
 * 根据多选答案改变试题对应答案的checked
 */
function changeShitiChecked(done_daan, shiti) {
  let new_done_daan = [];
  for (let i = 0; i < done_daan.length; i++) {
    switch (done_daan[i]) {
      case "A":
        shiti.A_checked = !shiti.A_checked;
        if (shiti.A_checked) new_done_daan.push("A");
        break;
      case "B":
        shiti.B_checked = !shiti.B_checked;
        if (shiti.B_checked) new_done_daan.push("B");
        break;
      case "C":
        shiti.C_checked = !shiti.C_checked;
        if (shiti.C_checked) new_done_daan.push("C");
        break;
      case "D":
        shiti.D_checked = !shiti.D_checked;
        if (shiti.D_checked) new_done_daan.push("D");
        break;
      case "E":
        shiti.E_checked = !shiti.E_checked;
        if (shiti.E_checked) new_done_daan.push("E");
        break;
    }
  }
  return new_done_daan;
}

/**
 * 映射该节已答题目，得到答题板迭代数组
 * 参数：
 *  1.jie_answer_array 已回答数组
 *  2.nums 题的数量
 *  3.isMOdelReal 是不是真题
 *  4.isSubmit 是否已提交试题
 */
function setMarkAnswerItems(jie_answer_array, nums, isModelReal, isSubmit, self) {
  let markAnswerItems = self.data.markAnswerItems; //得到答题板组件的已答
  for (let i = 0; i < jie_answer_array.length; i++) {
    let px = jie_answer_array[i].px;
    let style = "";
    if (isModelReal && isSubmit == false) { //如果是真题或者押题
      if (jie_answer_array[i].done_daan != "") { //如果答案不为空
        style = "background:#0197f6;color:white;"
      } else { //如果是空
        style = "";
      }

    } else if (jie_answer_array[i].isRight == 0) { //如果题是正确的
      style = "background:#90dd35;color:white;"
    } else if (jie_answer_array[i].isRight == 1) { //如果题是错误的
      style = "background:#fa4b5c;color:white;"
    }

    markAnswerItems[px - 1] = {
      "select": jie_answer_array[i].select,
      "isRight": jie_answer_array[i].isRight,
      "style": style
    }
  }

  self.markAnswer.setData({
    markAnswerItems: markAnswerItems
  })
}

/**
 * 设置单个答题板
 */
function setMarkAnswer(shiti, isModelReal, isSubmit, self) {
  let markAnswerItems = self.markAnswer.data.markAnswerItems; //得到答题板组件的已答
  let px = shiti.px;
  let style = "";
  if (isModelReal && isSubmit == false) { //如果是真题或者押题
    style = "background:#0197f6;color:white;"
  } else if (shiti.isRight == 0) { //如果题是正确的
    style = "background:#90dd35;color:white;"
  } else if (shiti.isRight == 1) { //如果题是错误的
    style = "background:#fa4b5c;color:white;"
  }

  markAnswerItems[px - 1] = {
    "select": shiti.tx,
    "isRight": shiti.isRight,
    "style": style
  }

  self.markAnswer.setData({
    markAnswerItems: markAnswerItems
  })
}

/**
 * 更新存储已答试题,更新答题板数据（单选和多选）
 */
function storeAnswerStatus(shiti, self) {
  let zhangIdx = self.data.zhangIdx;
  let jieIdx = self.data.jieIdx;
  let doneAnswerArray = self.data.doneAnswerArray

  let answer_nums_array = wx.getStorageSync("shiti" + self.data.zhangjie_id);

  let obj = {
    "id": shiti.id,
    "done_daan": shiti.done_daan,
    "select": shiti.tx,
    "isRight": shiti.flag,
    "px": shiti.px
  }
  //根据章是否有字节的结构来
  if (jieIdx != "undefined") {
    answer_nums_array[zhangIdx][jieIdx].push(obj)
  } else {
    answer_nums_array[zhangIdx].push(obj)
  }

  doneAnswerArray.push(obj) //存储已经做题的状态

  self.setData({
    doneAnswerArray: doneAnswerArray
  })

  wx.setStorage({
    key: "shiti" + self.data.zhangjie_id,
    data: answer_nums_array,
  })
}

/**
 * 更新存储已答试题（单选和多选）(真题，押题)
 */
function storeModelRealAnswerStatus(shiti, self) {
  let id = self.data.id;
  let doneAnswerArray = self.data.doneAnswerArray;

  let answer_nums_array = wx.getStorageSync("modelReal" + id);

  let flag = false;

  let obj = {
    "id": shiti.id,
    "done_daan": shiti.done_daan,
    "select": shiti.tx,
    "isRight": shiti.flag,
    "px": shiti.px
  }

  for (let i = 0; i < answer_nums_array.length; i++) {

    let done_shiti_local = doneAnswerArray[i]; //本地已答试题
    let done_shiti_storage = answer_nums_array[i]; //已做试题（本地存储）
    if (done_shiti_storage.id == shiti.id) { //已经存储过
      done_shiti_local.done_daan = shiti.done_daan; //用新的作答覆盖之前的回答
      done_shiti_local.isRight = shiti.flag;

      done_shiti_storage.done_daan = shiti.done_daan; //用新的作答覆盖之前的回答
      done_shiti_storage.isRight = shiti.flag;
      flag = true;
      break;
    }
  }

  if (!flag) {
    answer_nums_array.push(obj); //本地做题状态数组
    doneAnswerArray.push(obj); //存储已经做题的状态
  }

  self.setData({
    doneAnswerArray: doneAnswerArray
  })

  wx.setStorage({
    key: "modelReal" + id,
    data: answer_nums_array,
  })
}



/**
 * 只更新本页面的已答对象
 */
function storeAnswerArray(shiti, self) {
  let doneAnswerArray = self.data.doneAnswerArray

  let obj = {
    "id": shiti.id,
    "done_daan": shiti.done_daan,
    "select": shiti.tx,
    "isRight": shiti.flag,
    "px": shiti.px
  }

  doneAnswerArray.push(obj) //存储已经做题的状态

  self.setData({
    doneAnswerArray: doneAnswerArray
  })
}

/**
 * 更改选择状态（练习题）
 */
function changeSelectStatus(done_daan, shiti, self) {
  let srcs = shiti.srcs; //选项前的图标对象
  let flag = 0; //初始化正确还是错误

  switch (shiti.tx) {
    case "单选题":
      srcs[shiti.answer] = "/imgs/right_answer.png";
      //先判断是否正确
      if (done_daan != shiti.answer) {
        srcs[done_daan] = "/imgs/wrong_answer.png" //如果答错就把当前图标变为错误图标
        flag = 1;
      } else {
        flag = 0;
      }
      srcs[shiti.answer] = "/imgs/right_answer.png" //将正确答案的图标变为正确图标
      shiti.done_daan = done_daan; //已经做的选择
      break;
    case "多选题":
      let answers = shiti.answer.split(""); //将“ABD” 这种字符串转为字符数组
      shiti.done_daan = done_daan; //已经做的选择

      for (let i = 0; i < answers.length; i++) {
        shiti.srcs[answers[i]] = "/imgs/right_answer.png";
      }

      for (let i = 0; i < done_daan.length; i++) {
        if (answers.indexOf(done_daan[i]) >= 0) { //如果正确答案包含选中
          shiti.srcs[done_daan[i]] = "/imgs/right_answer1.png";
        } else {
          shiti.srcs[done_daan[i]] = "/imgs/wrong_answer.png";
        }
      }
      /**
       * 比较正确答案和已经选择选项，因为都是数组，数组比较内容需要转到字符串，因为数组也是对象，对象的比较默认为变量地址
       */
      if (answers.toString() == done_daan.toString()) {
        flag = 0;
      } else {
        flag = 1;
      }
      break;
  }
  shiti.isAnswer = true;
  shiti.flag = flag; //答案是否正确
}

/**
 * 更改选择状态（真题和押题）
 */
function changeModelRealSelectStatus(done_daan, shiti, self) {
  shiti.srcs = { //初始图片对象(多选)
    "A": "/imgs/A.png",
    "B": "/imgs/B.png",
    "C": "/imgs/C.png",
    "D": "/imgs/D.png",
    "E": "/imgs/E.png",
  };
  let flag = 0; //初始化正确还是错误

  switch (shiti.tx) {
    case "单选题":
      shiti.srcs[done_daan] = "/imgs/right_answer.png";
      //先判断是否正确
      if (done_daan != shiti.answer) {
        flag = 1;
      } else {
        flag = 0;
      }

      shiti.done_daan = done_daan; //已经做的选择
      break;
    case "多选题":
      //初始化多选的checked值
      initMultiSelectChecked(shiti);
      //遍历这个答案，根据答案设置shiti的checked属性
      let new_done_daan = changeShitiChecked(done_daan, shiti);
      changeMultiShiti(new_done_daan, shiti);

      let answers = shiti.answer.split(""); //将“ABD” 这种字符串转为字符数组
      shiti.done_daan = new_done_daan; //已经做的选择

      for (let i = 0; i < new_done_daan.length; i++) {
        shiti.srcs[new_done_daan[i]] = "/imgs/right_answer.png";
      }

      /**
       * 比较正确答案和已经选择选项，因为都是数组，数组比较内容需要转到字符串，因为数组也是对象，对象的比较默认为变量地址
       */
      // console.log(answers.toString() + "||" + new_done_daan.toString())
      if (answers.toString() == new_done_daan.toString()) {
        flag = 0;
      } else {
        flag = 1;
      }
      break;
  }
  // shiti.isAnswer = true;
  shiti.flag = flag; //答案是否正确
}

/**
 * 对已答试题进行处理（练习题）
 */
function processDoneAnswer(doneAnswerArray, shiti, self) {
  for (let i = 0; i < doneAnswerArray.length; i++) {
    if (doneAnswerArray[i].id == shiti.id) { //如果是已答题目
      switch (doneAnswerArray[i].select) {
        case "单选题":
        case "多选题":
          changeSelectStatus(doneAnswerArray[i].done_daan, shiti, self) //根据得到的已答数组更新试题状态
          break;
        case "材料题":
          let done_daan = doneAnswerArray[i].done_daan;
          for (let i = 0; i < done_daan.length; i++) {
            let xiaoti = shiti.xiaoti[i];
            let xt_done_daan = done_daan[i].done_daan; //小题的已作答的答案
            changeSelectStatus(xt_done_daan, xiaoti, self) //根据得到的已答数组更新试题状态
          }
          shiti.isAnswer = true;
          break;
      }
    }
  }
}
/**
 * 对已答试题进行处理（真题,押题）
 */
function processModelRealDoneAnswer(done_daan, shiti, self) {
  switch (shiti.tx) {
    case "单选题":
    case "多选题":
      if (self.data.isSubmit) { //提交了
        if (done_daan == "") { //提交而且答案是空
          changeModelRealSelectStatus(shiti.answer, shiti, self) //根据得到的已答数组更新试题状态   
        } else {
          changeSelectStatus(done_daan, shiti, self)
        }

      } else {
        changeModelRealSelectStatus(done_daan, shiti, self) //根据得到的已答数组更新试题状态
      }
      break;
    case "材料题":
      let xiaotiArray = shiti.xiaoti;
      for (let i = 0; i < xiaotiArray.length; i++) {
        let xiaoti = xiaotiArray[i];

        if (self.data.isSubmit) { //提交了
          if (done_daan == "") { //提交而且答案是空
            changeModelRealSelectStatus(xiaoti.answer, xiaoti, self) //根据得到的已答数组更新试题状态   
          } else {
            for (let j = 0; j < done_daan.length; j++) {
              xiao_done_daan = done_daan[j];
              if (xiaoti.px = xiao_done_daan.px) {
                xiaoti.done_daan = xiao_done_daan.done_daan
                changeSelectStatus(xiaoti.done_daan, xiaoti, self)
                break;
              }
            }
          }
        } else {
          
          for (let j = 0; j < done_daan.length; j++) {
            if (xiaoti.px = xiao_done_daan.px) {
              changeModelRealSelectStatus(xiaoti.done_daan, xiaoti, self) //根据得到的已答数组更新试题状态
              break;
            }
          }
        }
      }
      break;
  }
}

/**
 * 根据已答试题库得到正确题数和错误题数
 * 参数:
 *    1.isRight : 试题是否正确 1 正确 0 错误
 */
function setRightWrongNums(doneAnswerArray) {
  let right = 0;
  let wrong = 0;

  for (let i = 0; i < doneAnswerArray.length; i++) {
    let doneAnswer = doneAnswerArray[i];
    if (doneAnswer.isRight == 0) {
      right++;
    } else {
      wrong++;
    }
  }
  return {
    'rightNum': right,
    'wrongNum': wrong
  };
}

/**
 * 根据flag对rightNum和wrongNum处理
 */
function changeNum(flag, self) {
  let rightNum = self.data.rightNum;
  let wrongNum = self.data.wrongNum;
  flag == 0 ? rightNum++ : wrongNum++;
  self.setData({
    rightNum: rightNum,
    wrongNum: wrongNum
  })
}

/**
 * 多选题点击一个选项后更新试题对象
 */
function changeMultiShiti(done_daan, shiti) {
  if (shiti.isAnswer) return //如果已经回答了 就不作反应
  initMultiShitiSrcs(shiti);
  shiti.selectAnswer = done_daan;

  for (let i = 0; i < done_daan.length; i++) {
    shiti.srcs[done_daan[i]] = "/imgs/right_answer.png"; //将所有选中的选项置位正确图标
  }
}

/**
 * 向服务器提交做题结果
 */
function postAnswerToServer(acode, username, id, flag, done_daan, app, API_URL) {
  //向服务器提交做题结果
  app.post(API_URL, "action=saveShitiResult&acode=" + acode + "&username=" + username + "&tid=" + id + "&flag=" + flag + "&answer=" + done_daan, false).then((res) => {})
}

/**
 * 存储最后一题(练习题)
 */
function storeLastShiti(px, self) {
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
}
/**
 * 存储最后一题(真题，押题)
 */
function storeModelRealLastShiti(px, self) {
  //存储当前最后一题
  let last_view_key = 'lastModelReal' + self.data.id; //存储上次访问的题目的key
  //本地存储最后一次访问的题目
  wx.setStorage({
    key: last_view_key,
    data: {
      'px': px
    },
  })
}

/**
 * 判断所有本节题已经做完
 */
function ifDoneAll(shitiArray, doneAnswerArray) {
  if (shitiArray.length == doneAnswerArray.length) { //所有题都答完了
    wx.showToast({
      title: '所有题已经作答',
    })
  }
}
/**
 * 收藏题重新开始练习
 */
function markRestart(self) {
  let restart = self.data.restart;
  let shitiArray = self.data.shitiArray;

  if (restart) { //如果点击了重新开始练习，就清除缓存
    let shiti = self.data.shitiArray[0];

    initShiti(shiti, 1, self); //初始化试题对象

    self.setData({ //先把答题板数组置空
      markAnswerItems: []
    })

    initMarkAnswer(shitiArray.length, self); //初始化答题板数组

    self.setData({
      shiti: self.data.shitiArray[0],
      checked: false,
      doneAnswerArray: [], //已做答案数组
      rightNum: 0, //正确答案数
      wrongNum: 0, //错误答案数
    })
  }
}

/**
 * 练习题重新开始做题
 */

function lianxiRestart(self) {
  let restart = self.data.restart;
  let shitiArray = self.data.shitiArray;
  let jieIdx = self.data.jieIdx;
  let zhangIdx = self.data.zhangIdx;

  if (restart) { //如果点击了重新开始练习，就清除缓存
    let shiti = self.data.shitiArray[0];

    initShiti(shiti, 1, self); //初始化试题对象

    self.setData({ //先把答题板数组置空
      markAnswerItems: []
    })

    initMarkAnswer(shitiArray.length, self); //初始化答题板数组

    let answer_nums_array = wx.getStorageSync("shiti" + self.data.zhangjie_id);

    //根据章是否有字节的结构来
    if (jieIdx != "undefined") {
      answer_nums_array[zhangIdx][jieIdx] = [];
    } else {
      answer_nums_array[zhangIdx] = [];
    }
    wx.setStorageSync("shiti" + self.data.zhangjie_id, answer_nums_array); //重置已答数组

    self.setData({
      shiti: self.data.shitiArray[0],
      doneAnswerArray: [], //已做答案数组
      rightNum: 0, //正确答案数
      wrongNum: 0, //错误答案数
    })
  }
}

/**
 * 真题重新开始练习
 */

function restartModelReal(self) {
  let shiti = self.data.shitiArray[0];
  let shitiArray = self.data.shitiArray;

  for (let i = 0; i < shitiArray.length; i++) {
    shitiArray[i].done_daan = "";
  }

  initShiti(shiti, 1, self); //初始化试题对象

  self.setData({ //先把答题板数组置空
    markAnswerItems: []
  })

  initMarkAnswer(shitiArray.length, self); //初始化答题板数组

  let answer_nums_array = wx.getStorageSync("modelReal" + self.data.id); //将已答答案置空
  wx.setStorage({
    key: "modelReal" + self.data.id,
    data: [],
  })
  wx.setStorage({
    key: "modelRealIsSubmit" + self.data.id,
    data: false,
  })
  self.setData({
    shiti: self.data.shitiArray[0],
    doneAnswerArray: [], //已做答案数组
    shitiArray: shitiArray,
    isSubmit: false,
    checked: false,
    text: "立即交卷"
  })
}

module.exports = {
  initShiti: initShiti,
  initMarkAnswer: initMarkAnswer,
  setMarkAnswerItems: setMarkAnswerItems,
  changeSelectStatus: changeSelectStatus,
  setRightWrongNums: setRightWrongNums,
  changeNum: changeNum,
  postAnswerToServer: postAnswerToServer,
  storeAnswerStatus: storeAnswerStatus,
  changeMultiShiti: changeMultiShiti,
  storeLastShiti: storeLastShiti,
  storeAnswerArray: storeAnswerArray,
  processDoneAnswer: processDoneAnswer,
  processModelRealDoneAnswer: processModelRealDoneAnswer,
  ifDoneAll: ifDoneAll,
  initMultiSelectChecked: initMultiSelectChecked,
  changeShitiChecked: changeShitiChecked,
  lianxiRestart: lianxiRestart,
  markRestart: markRestart,
  changeModelRealSelectStatus: changeModelRealSelectStatus,
  storeModelRealAnswerStatus: storeModelRealAnswerStatus,
  storeModelRealLastShiti: storeModelRealLastShiti,
  restartModelReal: restartModelReal,
  setMarkAnswer: setMarkAnswer
}