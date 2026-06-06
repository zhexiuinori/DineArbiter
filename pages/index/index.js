const { generateShareImage } = require('../../utils/poster')

Page({
  data: {
    activeSession: null,
    historySessions: [],
    shareImagePath: ''
  },

  onShow: function () {
    this.loadSessions()
    this.generateShareCover()
  },

  generateShareCover: function () {
    const app = getApp()
    if (app.globalData.shareImagePath) {
      this.setData({ shareImagePath: app.globalData.shareImagePath })
      return
    }
    wx.nextTick(() => {
      setTimeout(() => {
        generateShareImage('shareCanvas').then(path => {
          app.globalData.shareImagePath = path
          this.setData({ shareImagePath: path })
        }).catch(() => {})
      }, 300)
    })
  },

  loadSessions: function () {
    let activeSession = null
    const historySessions = []

    try {
      const sessionIds = wx.getStorageSync('mySessions') || []

      sessionIds.forEach(id => {
        const session = wx.getStorageSync('session_' + id)
        if (!session) return

        const hasResult = wx.getStorageSync('result_' + id)

        if (hasResult) {
          historySessions.unshift({ ...session, status: 'done' })
        } else if (session.status === 'voting') {
          if (!activeSession) {
            activeSession = session
          } else {
            historySessions.unshift({ ...session, status: 'voting' })
          }
        }
      })
    } catch (e) {
      console.error('读取会话失败', e)
    }

    this.setData({ activeSession, historySessions })
  },

  onStartTap: function () {
    wx.vibrateShort({ type: 'medium' })
    wx.navigateTo({
      url: '/pages/create/create'
    })
  },

  onContinueTap: function () {
    wx.vibrateShort({ type: 'light' })
    const session = this.data.activeSession
    if (!session) return

    const hasResult = wx.getStorageSync('result_' + session.sessionId)
    if (hasResult) {
      wx.navigateTo({
        url: '/pages/result/result?sessionId=' + session.sessionId
      })
    } else {
      wx.navigateTo({
        url: '/pages/vote/vote?roomId=' + session.sessionId + '&isCreator=1'
      })
    }
  },

  onHistoryTap: function (e) {
    wx.vibrateShort({ type: 'light' })
    const session = e.currentTarget.dataset.session
    if (!session) return

    if (session.status === 'done') {
      wx.navigateTo({
        url: '/pages/result/result?sessionId=' + session.sessionId
      })
    } else {
      wx.navigateTo({
        url: '/pages/vote/vote?roomId=' + session.sessionId
      })
    }
  },

  onShareAppMessage: function () {
    return {
      title: '谁家好人现在还没定下吃啥？进来表态，AI端水大师在线判决！',
      path: '/pages/index/index',
      imageUrl: this.data.shareImagePath || ''
    }
  }
})
