const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址
//const https = require('../../utils/util.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //array: [{id:0,title:'无网络'}],
    index: 0,
    folder_object: [] //展开字节的对象,用于判断点击的章之前有多少个字节被展开
  },
  /* 更改题库 */
  bindPickerChange: function(e) {
    var self = this
    //console.log('picker发送选择改变，携带值为', self.data.array[e.detail.value].id)
    self.setData({
      index: e.detail.value,
      zhangjie_id: self.data.array[e.detail.value].id,
      folder_object: [],//初始化
      scroll: 0//初始化
    })


    app.post(API_URL, "action=SelectZj_l&z_id=" + self.data.zhangjie_id).then((res) => {
      console.log(res.data); //正确返回结果
      let self = this;

      //设置是否有字节属性
      let zhangjie = res.data.list;
      for (let i = 0; i < zhangjie.length; i++) {
        zhangjie[i].height = 0; //设置点击展开初始高度
        zhangjie[i].display = true; //设置点击展开初始动画为true
        zhangjie[i].isFolder = true; //设置展开初始值

        let child = zhangjie[i].zhangjie_child;
        if (child.length > 0) {
          zhangjie[i].hasChild = true;
        } else {
          zhangjie[i].hasChild = false;
        }
      }
      self.setData({
        zhangjie: zhangjie
      })
      wx.hideLoading();
    }).catch((errMsg) => {
      console.log(errMsg); //错误提示信息
      wx.hideLoading();
    });

  },
  /**
   * 当点击章节
   */
  onTapZhangjie: function(e) {
    //判断点击展开后 字节的高度+

    let self = this;
    let index = e.currentTarget.dataset.itemidx; //选择章节的index
    let zhangjie = self.data.zhangjie; //取得章节对象
    let folder = zhangjie[index].isFolder //章节的展开与折叠状态
    let hasChild = zhangjie[index].hasChild //是否有子节
    let height = zhangjie[index].height //展开高度
    let windowWidth = self.data.windowWidth;
    let num = zhangjie[index].zhangjie_child.length //取得有多少个章节
    let jie_height = num * 70 * windowWidth / 750 //获得字节高度(px),因为在定义节高度的时候用的是rpx，而滚动条位置是用px定位的，所以需要转换
    let zhangjie_block_height = 750 * windowWidth / 750 //获得章节模块距离顶部的距离,转换同上


    if (!hasChild) {
      this.GOzuoti(e);
      return
    }

    //设置章节是展开还是折叠状态
    if (folder) {
      zhangjie[index].isFolder = false;
    }

    //开始动画
    this.step(index, height, num, windowWidth);

    self.setData({
      zhangjie: zhangjie,
    })
  },
  /**
   * 实现展开折叠效果
   */
  step: function(index, height, num, windowWidth) {
    let self = this;
    let display = self.data.zhangjie[index].display; //取得现在是什么状态
    let zhangjie = self.data.zhangjie //取得章节对象
    let folder_object = self.data.folder_object //取得展开章节的对象
    let jie_num = 0;

    for (let i = 0; i < folder_object.length; i++) {
      if (folder_object[i].index < index) { //如果在点击选项前面有展开字节
        jie_num += folder_object[i].num //有几个节点就加几个节点
      }
    }

    let scroll = (index * 100 + jie_num * 70) * (windowWidth / 750);

    //设置动画循环
    let interval = setInterval(function() {
      height = display ? (height + 20) : (height - 20); //根据折叠状态进行页面高度变化
      zhangjie[index].height = height;
      self.setData({
        zhangjie: zhangjie,
        scroll: scroll
      })

      if (height <= 0) { //此时已经折叠
        height = 0;
        //把折叠对象从折叠对象数组中去除
        for (let i = 0; i < folder_object.length; i++) {
          if (folder_object[i].index == index) {
            folder_object.splice(i, 1)
          }
        }
        zhangjie[index].height = height;
        zhangjie[index].display = true;
        zhangjie[index].isFolder = true;
        self.setData({
          zhangjie: zhangjie
        })
        clearInterval(interval);
      } else if (height >= 70 * num) { //此时已经展开
        height = 70 * num;
        //添加对象到折叠数组
        folder_object.push({
          index: index,
          num: num
        })
        zhangjie[index].height = height;
        zhangjie[index].display = false;
        self.setData({
          zhangjie: zhangjie
        })
        clearInterval(interval);
      }
    }, 5)
  },

  /*做题 */
  GOzuoti: function(e) {
    let self = this;
    let z_id = e.currentTarget.id;
    let zhangIdx = e.currentTarget.dataset.itemidx; //点击的章index
    let jieIdx = e.currentTarget.dataset.jieidx; //点击的节index
    let zhangjie = self.data.zhangjie; //章节
    let nums = zhangjie[zhangIdx].zhangjie_child[jieIdx].nums;

    wx.setStorage({
        key: "id",
        data: "0"
      }),
      wx.navigateTo({
        url: 'zuoti/index?z_id=' + z_id + '&nums=' + nums
      })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let self = this;
    let windowWidth = wx.getSystemInfoSync().windowWidth; //获取窗口宽度(px)
    let windowHeight = wx.getSystemInfoSync().windowHeight; //获取窗口高度(px)
    windowHeight = (windowHeight * (750 / windowWidth)); //转换窗口高度(rpx)

    let scrollHeight = windowHeight - 720 //计算滚动框高度(rpx)

    //调用 app.js里的 post()方法

    app.post(API_URL, "action=SelectZj").then((res) => {
      self.setData({
        array: res.data.list,
        zhangjie_id: res.data.list[0].id,
      })
      app.post(API_URL, "action=SelectZj_l&z_id=" + self.data.zhangjie_id).then((res) => {
        //console.log(res);//正确返回结果
        //设置章是否有子节
        let zhangjie = res.data.list //得到所有章节

        for (let i = 0; i < zhangjie.length; i++) {
          zhangjie[i].height = 0; //设置点击展开初始高度
          zhangjie[i].display = true; //设置点击展开初始动画为true
          zhangjie[i].isFolder = true; //设置展开初始值

          let child = zhangjie[i].zhangjie_child;
          if (child.length > 0) {
            zhangjie[i].hasChild = true;
          } else {
            zhangjie[i].hasChild = false;
          }
        }
        self.setData({
          zhangjie: zhangjie,
          windowWidth: windowWidth, //窗口宽度
          windowHeight: windowHeight, //窗口可视高度
          scrollHeight: scrollHeight, //滚动条高度
        })
        wx.hideLoading();
      }).catch((errMsg) => {
        console.log(errMsg); //错误提示信息
        wx.hideLoading();
      });

    }).catch((errMsg) => {
      console.log(errMsg); //错误提示信息
      wx.hideLoading();
    });
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