App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.warn('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      try {
        wx.cloud.init({
          env: 'cloud1-d2gjrpsgfaf82e79a',
          traceUser: true
        })
        this.globalData.cloudReady = true
      } catch (e) {
        console.warn('云开发初始化失败，将使用本地模式', e)
      }
    }
  },

  onError: function (msg) {
    console.error('全局错误:', msg)
  },

  globalData: {
    currentSession: null,
    shareImagePath: '',
    cloudReady: false
  }
})
