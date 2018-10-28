let common = require('shiti.js');

function zuotiOnload(options, px, res, username, acode,self){
  let shitiArray = res.data.shiti;

  common.initShitiArrayDoneAnswer(shitiArray);//将试题的所有done_daan置空

  common.initMarkAnswer(shitiArray.length, self); //初始化答题板数组

  //得到swiper数组
  let preShiti = undefined;//前一题
  let nextShiti = undefined;//后一题
  let midShiti = shitiArray[px - 1];//中间题
  let sliderShitiArray = [];

  common.initShiti(midShiti, self); //初始化试题对象
  if(px != 1 && px !=shitiArray.length){//如果不是第一题也是不是最后一题
    preShiti = shitiArray[px-2];
    common.initShiti(preShiti, self); //初始化试题对象
    nextShiti = shitiArray[px];
    common.initShiti(nextShiti, self); //初始化试题对象
  }else if(px == 1){//如果是第一题
    nextShiti = shitiArray[px];
    common.initShiti(nextShiti, self); //初始化试题对象
  }else{
    preShiti = shitiArray[px-2];
    common.initShiti(preShiti, self); //初始化试题对象
  }


  //对是否是已答试题做处理
  wx.getStorage({
    key: "shiti" + options.zhangjie_id,
    success: function (res1) {
      //根据章是否有子节所有已经回答的题
      let doneAnswerArray = self.data.jieIdx != "undefined" ? res1.data[self.data.zhangIdx][self.data.jieIdx] : res1.data[self.data.zhangIdx]
      common.setMarkAnswerItems(doneAnswerArray, options.nums, self.data.isModelReal, self.data.isSubmit, self); //设置答题板数组     

      //映射已答题目的已作答的答案到shitiArray
      for (let i = 0; i < doneAnswerArray.length; i++) {
        let doneAnswer = doneAnswerArray[i];
        shitiArray[doneAnswer.px - 1].done_daan = doneAnswer.done_daan;//设置已答试题的答案
      }
      
      //先处理是否是已经回答的题,渲染3个
      if (preShiti != undefined) common.processDoneAnswer(preShiti.done_daan, preShiti, self);
      common.processDoneAnswer(midShiti.done_daan, midShiti, self);
      if (nextShiti != undefined) common.processDoneAnswer(nextShiti.done_daan, nextShiti, self);
     
      //根据已答试题库得到正确题数和错误题数
      let rightAndWrongObj = common.setRightWrongNums(doneAnswerArray);

      //如果已答试题数目大于0才更新shiti
      if (doneAnswerArray.length > 0) {
        self.setData({
          doneAnswerArray: doneAnswerArray, //获取该节所有的已做题目
          rightNum: rightAndWrongObj.rightNum,
          wrongNum: rightAndWrongObj.wrongNum
        })
      }
    },
  })

  if (nextShiti != undefined) sliderShitiArray[1] = nextShiti;
  sliderShitiArray[0] = midShiti;
  if (preShiti != undefined) sliderShitiArray[2] = preShiti;

  self.setData({
    //设置过场动画
    winH: wx.getSystemInfoSync().windowHeight,
    opacity: 1,

    z_id: options.z_id, //点击组件的id编号
    zhangjie_id: options.zhangjie_id, //章节的id号，用于本地存储的key
    zhangIdx: options.zhangIdx, //章的id号
    jieIdx: options.jieIdx, //节的id号

    px:px,
    title: options.title,//标题
    nums: shitiArray.length, //题数
    shitiArray: shitiArray, //整节的试题数组
    sliderShitiArray: sliderShitiArray,//滑动数组
    lastSliderIndex: 0,//默认滑动条一开始是0
    isLoaded: false, //是否已经载入完毕,用于控制过场动画
    username: username, //用户账号名称
    acode: acode //用户唯一码
  });
  wx.hideLoading();
}

function wrongAndMarkOnload(options, px, res, username, acode, self){

  let shitiArray = res.data.shiti;

  let shiti = shitiArray[0];

  // common.initShitiArrayDoneAnswer(shitiArray);//将试题的所有done_daan置空

  common.initShiti(shiti, self); //初始化试题对象

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
}

module.exports = {
  zuotiOnload: zuotiOnload,
  wrongAndMarkOnload: wrongAndMarkOnload
}
