// components/markAnswer/markAnswer.js
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    done_answers:{
      type: Array,
      value:[]
    },
    markAnswerItems:{
      type: Array,
      value:[]
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isShow:false
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
 
    //点击编号事件
    _tapEvent(e) {
      let px = e.currentTarget.dataset.px;
      //触发取消回调
      this.triggerEvent("tapEvent",{"px":px});
    },
    setBackground(e){
      console.log(e)
      return "red";
    }
  }
})
