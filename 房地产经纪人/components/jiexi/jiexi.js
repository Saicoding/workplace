// components/jiexi/jiexi.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isAnswer:{
      type:Boolean,
      value:false
    },
    jiexi:{
      type:String,
      value:"该题没有解析"
    },
    answer:{
      type: String,
      value:""
    },
    isModelReal:{
      type:Boolean,
      value:false
    },

    buy:{
      type:Number,
      value:-1,
      observer:function(res){
        if(res ==1){
          this.setData({
            hidden:true,
          })
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    close:function(){
      this.setData({
        hidden:true
      })
    }
  }
})
