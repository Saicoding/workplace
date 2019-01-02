// components/errorRecovery/errorRecovery.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    money: {
      type: Number,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isShow: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //隐藏弹框
    hideDialog() {
      this.setData({
        isShow: false
      })
    },
    //展示弹框
    showDialog() {
      this.setData({
        isShow: true
      })
    },
    //toogle展示
    toogleDialog() {
      this.setData({
        isShow: !this.data.isShow
      })
    },
    //阻止事件冒泡
    stopBubbling: function(e) {},

    //点击了空地,让蒙版消失
    tapBlank: function(e) {
      this.setData({
        isShow: false
      })
    },

    //继续找人帮砍
    _GOxuexi: function() {
      this.hideDialog();
      this.triggerEvent("GOxuexi");
    },

    //关闭模块
    close: function() {
      this.hideDialog();
      this.triggerEvent("addKanjia");
    }

  }
})