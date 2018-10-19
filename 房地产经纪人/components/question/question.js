// components/question/question.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    num_color:{
      type:String,
      value:""
    },
    px:{
      type:Number,
      value:1
    },
    tx:{
      type:String,
      value:""
    },
    question:{
      type:String,
      value:""
    },
    tx:{
      type:String,
      value:""
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    isFold:true,
    first:true
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getHeight:function(){
      let query = wx.createSelectorQuery();
      let self = this;
      query.select('#haha').boundingClientRect();
      query.exec(function(res){
          console.log(res)
      })

    },
    foldAnimation:function(){
      let qAnimation = wx.createAnimation({
        duration: 1000,
        delay: 0,
        timingFunction: "ease-in",
        transformOrigin:"50%,50%"
      })

      qAnimation.height("400rpx", "100rpx").step({
        duration: 1000,
      })

      this.setData({
        foldData: qAnimation.export(),
        isFold: true,
      })
      console.log('折叠')
    },

    spreadAnimation:function(){
      // this.getHeight();
      let qAnimation = wx.createAnimation({
        duration: 1000,
        delay: 0,
        timingFunction: "ease-out",
        transformOrigin: "50%,50%"
      })

      qAnimation.height("100rpx", "400rpx").step({
      })

      this.setData({
        foldData: qAnimation.export(),
        isFold:false,
        first:false
      })
      console.log('展开')
    },

    toogleShow: function (){
      if (this.data.tx != "材料题" ) return ;
      let isFold = this.data.isFold;
      console.log(isFold)
      isFold ? this.spreadAnimation() : this.foldAnimation()
    }
  }
})
