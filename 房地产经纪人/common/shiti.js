/**
 * 初始化试题
 */
function initShiti(shiti, px, self) {
  let TX = shiti.TX;

  //给试题设置章idx 节idx 和默认已做答案等
  shiti.done_daan = "";
  shiti.isAnswer = false;
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
    shiti.A_checked = false;
    shiti.B_checked = false;
    shiti.C_checked = false;
    shiti.D_checked = false;
    shiti.E_checked = false;
  } else if (TX == 99) { //材料
    shiti.num_color = "#eaa91d";
    shiti.tx = "材料题";
    shiti.doneAnswer = [];
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
  self.setData({
    markAnswerItems: markAnswerItems
  })
}

/**
 * 初始化一个多选题的checked
 */
function initMultiSelectChecked(shiti){
  shiti.A_checked = false;
  shiti.B_checked = false;
  shiti.C_checked = false;
  shiti.D_checked = false;
  shiti.E_checked = false;
}
/**
 * 初始化一个多选题的srcs
 */
function initMultiShitiSrcs(shiti){
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
function changeShitiChecked(done_daan,shiti){
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
 */
function setMarkAnswerItems(jie_answer_array, nums, self) {
  let markAnswerItems = self.data.markAnswerItems;
  for (let i = 0; i < jie_answer_array.length; i++) {
    let px = jie_answer_array[i].px;
    markAnswerItems[px - 1] = {
      "select": jie_answer_array[i].select,
      "isRight": jie_answer_array[i].isRight,
    }
  }

  self.setData({
    markAnswerItems: markAnswerItems
  })
}

/**
  * 更新存储已答试题,更新答题板数据（单选和多选）
  */
function storeAnswerStatus(shiti,self) {
  let zhangIdx = self.data.zhangIdx;
  let jieIdx = self.data.jieIdx;
  let doneAnswerArray = self.data.doneAnswerArray

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
  doneAnswerArray.push(obj) //存储已经做题的状态

  self.setData({
    doneAnswerArray: doneAnswerArray
  })

  wx.setStorage({
    key: self.data.zhangjie_id,
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
 * 更改选择状态
 */
function changeSelectStatus(done_daan, shiti,self) {
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
 * 对已答试题进行处理
 */
function processDoneAnswer(doneAnswerArray,shiti,self){
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
 * 根据已答试题库得到正确题数和错误题数
 * 参数:
 *    1.isRight : 试题是否正确 1 正确 0 错误
 */
function setRightWrongNums(doneAnswerArray) {
  let right = 0;
  let wrong = 0;

  for(let i = 0 ;i<doneAnswerArray.length;i++){
    let doneAnswer = doneAnswerArray[i];
    if(doneAnswer.isRight == 0){
      right++;
    }else{
      wrong++;
    }
  }
  return {'rightNum':right,'wrongNum':wrong};
}

/**
 * 根据flag对rightNum和wrongNum处理
 */
function changeNum(flag,self) {
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
  console.log(done_daan)
  initMultiShitiSrcs(shiti);
  shiti.selectAnswer = done_daan;

  for (let i = 0; i < done_daan.length; i++) {
    shiti.srcs[done_daan[i]] = "/imgs/right_answer.png"; //将所有选中的选项置位正确图标
  }
}

/**
 * 向服务器提交做题结果
 */
function postAnswerToServer(acode, username, id, flag, done_daan,app,API_URL) {
  //向服务器提交做题结果
  app.post(API_URL, "action=saveShitiResult&acode=" + acode + "&username=" + username + "&tid=" + id + "&flag=" + flag + "&answer=" + done_daan, false).then((res) => {
  })
}

/**
 * 存储最后一题
 */
function storeLastShiti(px,self) {
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
 * 判断所有本节题已经做完
 */
function ifDoneAll(shitiArray,doneAnswerArray){
  if (shitiArray.length == doneAnswerArray.length) {//所有题都答完了
    wx.showToast({
      title: '所有题已经作答',
    })
  }
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
  ifDoneAll: ifDoneAll,
  initMultiSelectChecked: initMultiSelectChecked,
  changeShitiChecked: changeShitiChecked
}