/**
 * 时间 : 2018/10/11 20:33
 * 
 * 说明 : 该页是首页
 * 
 */

const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址
const app = getApp(); //获取app对象

Page({

  /**
   * 页面的初始数据
   */
  data: {
    index: 0, //用于题库的index编号,可以得到是第几个题库
    folder_object: [], //展开字节的对象,用于判断点击的章之前有多少个字节被展开
    loaded: false //是否已经载入一次,用于答题时点击返回按钮,首页再次展现后更新做题数目
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let self = this;
    this.setWindowWidthHeightScrollHeight(); //获取窗口高度 宽度 并计算章节滚动条的高度

    app.post(API_URL, "action=SelectZj").then((res) => {
      
      this.setZhangjie(res.data.list);//得到当前题库的缓存,并设置变量:1.所有题库数组 2.要显示的题库id 3.要显示的题库index

      app.post(API_URL, "action=SelectZj_l&z_id=" + self.data.zhangjie_id).then((res) => {//得到上一步设置的题库下的所有章节

        //设置章是否有子节
        let zhangjie = res.data.list //得到所有章节
        let answer_nums_array = [] //答题数目array

        for (let i = 0; i < zhangjie.length; i++) {
          zhangjie[i].height = 0; //设置点击展开初始高度
          zhangjie[i].display = true; //设置点击展开初始动画为true
          zhangjie[i].isFolder = true; //设置展开初始值
          zhangjie[i].zhang_answer_num = 0; //初始化答题数
          let child = zhangjie[i].zhangjie_child; //字节

          answer_nums_array[i] = []; //初始化本地存储
          if (child.length > 0) {
            zhangjie[i].hasChild = true;
            for (let j = 0; j < child.length; j++) {
              answer_nums_array[i][j] = []; //初始化本地存储
              zhangjie[i].zhangjie_child[j].answer_nums = 0; //初始化节的已作答数目
            }
          } else {
            zhangjie[i].hasChild = false;
          }
        }
        // wx.clearStorage(self.data.zhangjie_id)
        // 得到存储答题状态
        wx.getStorage({
          key: self.data.zhangjie_id,
          success: function(res) {
            //将每个节的已经作答的本地存储映射到组件中          
            for (let i = 0; i < zhangjie.length; i++) {
              let zhang_answer_num = 0; //章的总作答数
              if (zhangjie[i].zhangjie_child == undefined) { //如果只有章，没有节
                zhang_answer_num = res.data[i].length;
              } else {
                for (let j = 0; j < zhangjie[i].zhangjie_child.length; j++) {
                  zhangjie[i].zhangjie_child[j].answer_nums = res.data[i][j].length;
                  zhang_answer_num += res.data[i][j].length;
                }
              }
              zhangjie[i].zhang_answer_num = zhang_answer_num;
            }
            //因为是在同步内部，最后需要更新章节信息，不更新数据不会改变
            self.setData({
              zhangjie: zhangjie
            })
          },
          fail: function() { //如果没有本地存储就初始化
            wx.setStorage({
              key: self.data.zhangjie_id,
              data: answer_nums_array
            })
          }
        })

        self.setData({
          zhangjie: zhangjie,
          loaded: true //已经载入完毕
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
  /* 更改题库 */
  bindPickerChange: function(e) {
    var self = this

    self.setData({
      index: e.detail.value, //设置是第几个题库
      zhangjie_id: self.data.array[e.detail.value].id, //设置章节的id编号
      folder_object: [], //初始化展开字节的对象,因为更换章节后默认都是不展开状态
      scroll: 0 //初始化章节的滑动条
    })

    app.post(API_URL, "action=SelectZj_l&z_id=" + self.data.zhangjie_id).then((res) => {
      let answer_nums_array = [] //答题数目array

      let zhangjie = res.data.list; //该题库的所有章节
      for (let i = 0; i < zhangjie.length; i++) {
        zhangjie[i].height = 0; //设置点击展开初始高度
        zhangjie[i].display = true; //设置点击展开初始动画为true
        zhangjie[i].isFolder = true; //设置展开初始值
        zhangjie[i].zhang_answer_num = 0; //初始化答题数为0
        answer_nums_array[i] = []; //初始化本地存储

        let child = zhangjie[i].zhangjie_child;
        if (child.length > 0) {
          zhangjie[i].hasChild = true;
          for (let j = 0; j < child.length; j++) {
            answer_nums_array[i][j] = []; //初始化本地存储
            zhangjie[i].zhangjie_child[j].answer_nums = 0;
          }
        } else {
          zhangjie[i].hasChild = false;
        }
      }
      self.setData({
        zhangjie: zhangjie
      })

      // 得到存储答题状态
      wx.getStorage({
        key: self.data.zhangjie_id,
        success: function(res) {
          //将每个节的已经作答的本地存储映射到组件中          
          for (let i = 0; i < zhangjie.length; i++) {
            let zhang_answer_num = 0; //章的总作答数
            if (zhangjie[i].zhangjie_child.length == 0) { //如果只有章，没有节
              zhang_answer_num = res.data[i].length;
            } else {
              for (let j = 0; j < zhangjie[i].zhangjie_child.length; j++) {
                zhangjie[i].zhangjie_child[j].answer_nums = res.data[i][j].length;
                zhang_answer_num += res.data[i][j].length;
              }
            }
            zhangjie[i].zhang_answer_num = zhang_answer_num;
          }
          //因为是在同步内部，最后需要更新章节信息，不更新数据不会改变
          self.setData({
            zhangjie: zhangjie
          })
        },
        fail: function() { //如果没有本地存储就初始化
          wx.setStorage({
            key: self.data.zhangjie_id,
            data: answer_nums_array
          })
        }
      })
      wx.setStorageSync("tiku_id", {
        "id": self.data.array[e.detail.value].id,
        "index": self.data.index
      });

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

  /**
   * 做题 
   */
  GOzuoti: function(e) {
    let self = this;
    //获取是否有登录权限
    wx.getStorage({
      key: 'user',
      success: function(res) { //如果已经登陆过
        console.log(res)
        let z_id = e.currentTarget.id;
        let zhangIdx = e.currentTarget.dataset.itemidx; //点击的章index
        let jieIdx = e.currentTarget.dataset.jieidx; //点击的节index

        let zhangjie = self.data.zhangjie; //章节
        let zhangjie_id = self.data.zhangjie_id; //当前题库的id，用来作为本地存储的key值

        //如果章节没有字节,将章节总题数置为做题数
        let nums = 0;
        if (zhangjie[zhangIdx].zhangjie_child.length != 0) {
          nums = zhangjie[zhangIdx].zhangjie_child[jieIdx].nums;
        } else {
          nums = zhangjie[zhangIdx].nums;
        }
        console.log(z_id)
        wx.setStorage({
            key: 'id',
            data: "0"
          }),
          wx.navigateTo({
            url: 'zuoti/index?z_id=' + z_id + '&nums=' + nums + '&zhangjie_id=' + zhangjie_id + '&zhangIdx=' + zhangIdx + '&jieIdx=' + jieIdx
          })

      },
      fail: function(res) { //如果没有username就跳转到登录界面
        wx.navigateTo({
          url: '/pages/login1/login1',
        })
      }
    })
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
    let self = this;
    let zhangjie = self.data.zhangjie;
    if (!self.data.loaded) return //如果没有完成首次载入就什么都不作
    // 得到存储答题状态
    wx.getStorage({
      key: self.data.zhangjie_id,
      success: function(res) {
        //将每个节的已经作答的本地存储映射到组件中          
        for (let i = 0; i < zhangjie.length; i++) {
          let zhang_answer_num = 0; //章的总作答数
          if (zhangjie[i].zhangjie_child.length == 0) { //如果只有章，没有节
            zhang_answer_num = res.data[i].length;
          } else {
            for (let j = 0; j < zhangjie[i].zhangjie_child.length; j++) {
              zhangjie[i].zhangjie_child[j].answer_nums = res.data[i][j].length;
              zhang_answer_num += res.data[i][j].length;
            }
          }
          zhangjie[i].zhang_answer_num = zhang_answer_num;
        }
        //因为是在同步内部，最后需要更新章节信息，不更新数据不会改变
        self.setData({
          zhangjie: zhangjie
        })
      }
    }, )
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

  },

  /**
   * 获取窗口高度 宽度 并计算章节滚动条的高度
   */
  setWindowWidthHeightScrollHeight:function(){
    let windowWidth = wx.getSystemInfoSync().windowWidth; //获取窗口宽度(px)
    let windowHeight = wx.getSystemInfoSync().windowHeight; //获取窗口高度(px)
    windowHeight = (windowHeight * (750 / windowWidth)); //转换窗口高度(rpx)
    let scrollHeight =   windowHeight - 720 //计算滚动框高度(rpx) 

    this.setData({
      windowWidth: windowWidth, //窗口宽度
      windowHeight: windowHeight, //窗口可视高度
      scrollHeight: scrollHeight, //滚动条高度
    })
  },

  /**
   * 
   */
  setZhangjie:function(res){
    let z_id = 0;
    let index = 0;
    let tiku = wx.getStorageSync("tiku_id");
    if (tiku == "") {
      z_id = res[0].id;
      index = 0;
    } else {
      z_id = tiku.id;
      index = tiku.index;
    }

    this.setData({
      array: res,
      zhangjie_id: z_id,
      index: index
    })
  }
})