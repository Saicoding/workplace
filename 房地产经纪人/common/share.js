function getNum(word) {
  switch (word) {
    case "A":
      return 0;
      break;
    case "B":
      return 1;
      break;
    case "C":
      return 2;
      break;
    case "D":
      return 3;
      break;
    case "E":
      return 4;
      break;
    case "F":
      return 5;
      break;
    case "G":
      return 6;
      break;
    case "H":
      return 7;
      break;
    case "I":
      return 8;
      break;
    case "J":
      return 9;
      break;
    case "K":
      return 10;
      break;
    case "L":
      return 11;
      break;
    case "M":
      return 12;
      break;
    case "N":
      return 13;
      break;
    case "O":
      return 14;
      break;
    case "P":
      return 15;
      break;
    case "Q":
      return 16;
      break;
    case "R":
      return 17;
      break;
    case "S":
      return 18;
      break;
    case "T":
      return 19;
      break;
    case "U":
      return 20;
      break;
    case "V":
      return 21;
      break;
    case "W":
      return 22;
      break;
    case "X":
      return 23;
      break;
    case "Y":
      return 24;
      break;
    case "Z":
      return 25;
      break;
    default:
      return 26;
      break;
  }
}

function monitorConnectType(self){
  //侦测网络情况
  let isOn = wx.getStorageSync('turnonWifiPrompt');
  console.log(isOn+"网络类型")

  if (isOn == "" || isOn == 0) {
    let interval = setInterval((res) => {
      wx.getNetworkType({ //查看当前的网络类型,如果是非wifi,就不自动播放,如果多次是同一类型就只执行一次
        success: function (res) {
          let networkType = res.networkType
          console.log(networkType)
          
          if (networkType != "wifi") {
            let lastType = self.data.lastType;
            if (lastType != "noWifi") {
              self.myVideo.stop();
              self.myVideo.pause();
              self.setData({
                isWifi: false,
                autoplay: false,
                isPlaying: false,
                lastType: "noWifi"
              })
            }

          } else {
            let lastType = self.data.lastType;

            if (lastType != "wifi") {
              self.setData({
                autoplay: true,
                isPlaying: true,
                isWifi: true,
                lastType: "wifi"
              })
            }
          }
        }
      })
    }, 2000)
    self.setData({
      interval: interval
    })
  } else {
    self.setData({
      isWifi: true,
      useFlux: true,
      autoplay: true,
      isPlaying: true,
    })
  }
}

module.exports={
  getNum: getNum,
  monitorConnectType: monitorConnectType
}