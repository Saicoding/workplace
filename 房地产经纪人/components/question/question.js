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
      value:"",
      observer:function(tx){
        let style1 ="";
        let style2 ="";
        let style3 = "";
        if(tx == "材料题"){
          style1 ="display:block;height:400rpx;margin-bottom:60rpx;"//占位框
          style3="position:fixed;z-index:10000";
          style2 = "positon:fixed;height:400rpx;left:20rpx;";//问题框
        }else{
          style1 = "display:none;";//占位框
          style2 = "height:auto";//问题框
          style3 = "position:block";
        }
        this.setData({
          style1:style1,
          style2:style2,
          style3: style3 
        })
      }
    },
    question:{
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

  pageLifetimes:{
    show:function(){
      let tx = this.data.tx;
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
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
    },

    toogleShow: function (){
      if (this.data.tx != "材料题" ) return ;
      let isFold = this.data.isFold;
      isFold ? this.spreadAnimation() : this.foldAnimation()
    }
  }
})
