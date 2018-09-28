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
  },
  /* 更改题库 */
  bindPickerChange: function(e) {
    var self = this
    //console.log('picker发送选择改变，携带值为', self.data.array[e.detail.value].id)
    self.setData({
      index: e.detail.value,
      zhangjie_id: self.data.array[e.detail.value].id
    })

    app.post(API_URL, "action=SelectZj_l&z_id=" + self.data.zhangjie_id).then((res) => {
      console.log(res.data); //正确返回结果
      let self = this;

      //设置是否有字节属性
      let zhangjie = res.data.list;
      for (let i = 0; i < zhangjie.length; i++) {
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
    let self = this;
    let index = e.currentTarget.dataset.itemidx; //选择章节的index
    let zhangjie = self.data.zhangjie;
    let folder = zhangjie[index].isFolder //章节的展开与折叠状态
    let hasChild = zhangjie[index].hasChild //是否有子节

    if (!hasChild) {
      this.GOzuoti(e);

    }

    //设置章节是展开还是折叠状态
    if (folder == undefined) {
      zhangjie[index].isFolder = true;
    } else if (folder) {
      zhangjie[index].isFolder = false;
    } else {
      zhangjie[index].isFolder = true;
    }

    self.setData({
      zhangjie: zhangjie
    })
  },
  /**
   * 
   */
  stopTap: function() {
    return;
  },
  /**
   * 点击章节后，设置该章节对应的folder状态
   */
  setFolder: function() {

  },

  /*做题 */
  GOzuoti: function(e) {
    let self = this;
    let z_id = e.currentTarget.id;
    let zhangIdx = e.currentTarget.dataset.itemidx;//点击的章index
    let jieIdx = e.currentTarget.dataset.jieidx;//点击的节index
    let zhangjie = self.data.zhangjie;//章节
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
    var self = this

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