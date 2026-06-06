const { generateSessionId } = require('../../utils/util')

Page({
  data: {
    region: [],
    locationText: '',
    latitude: 0,
    longitude: 0,
    time: '',
    maxPeople: 4,
    budgetLevel: 2,
    vetoText: '',
    roomId: ''
  },

  onLoad: function () {
    this.autoLocate()
  },

  autoLocate: function () {
    wx.showLoading({ title: '定位中...' })
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        wx.hideLoading()
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          locationText: '已定位'
        })
      },
      fail: () => {
        wx.hideLoading()
        this.setData({ locationText: '' })
      }
    })
  },

  onLocateTap: function () {
    wx.vibrateShort({ type: 'light' })
    this.autoLocate()
  },

  onRegionChange: function (e) {
    this.setData({ region: e.detail.value })
  },

  onTimeChange: function (e) {
    this.setData({ time: e.detail.value })
    wx.vibrateShort({ type: 'light' })
  },

  onDecrease: function () {
    if (this.data.maxPeople > 2) {
      this.setData({ maxPeople: this.data.maxPeople - 1 })
      wx.vibrateShort({ type: 'light' })
    }
  },

  onIncrease: function () {
    if (this.data.maxPeople < 20) {
      this.setData({ maxPeople: this.data.maxPeople + 1 })
      wx.vibrateShort({ type: 'light' })
    }
  },

  onBudgetTap: function (e) {
    const level = Number(e.currentTarget.dataset.level)
    this.setData({ budgetLevel: level })
    wx.vibrateShort({ type: 'medium' })
  },

  onVetoInput: function (e) {
    this.setData({ vetoText: e.detail.value })
  },

  onSummonTap: function () {
    if (this._summoning) return
    this._summoning = true

    const { region, locationText, time, maxPeople, budgetLevel, vetoText } = this.data

    if (!region[1] && !locationText) {
      wx.showToast({ title: '请定位或选择区域', icon: 'none' })
      return
    }
    if (!time) {
      wx.showToast({ title: '请选择时间', icon: 'none' })
      return
    }

    wx.vibrateShort({ type: 'heavy' })

    const roomId = generateSessionId()
    const regionName = region[1] || locationText
    const budgetRanges = {
      1: { min: 0, max: 50 },
      2: { min: 50, max: 150 },
      3: { min: 150, max: 9999 }
    }
    const sessionData = {
      sessionId: roomId,
      region: regionName,
      time,
      maxPeople,
      budgetLevel,
      budgetRange: budgetRanges[budgetLevel] || budgetRanges[2],
      vetoText,
      creatorId: 'user_' + Date.now(),
      createdAt: new Date().toISOString(),
      status: 'voting',
      votes: []
    }

    try {
      wx.setStorageSync('currentSession', sessionData)
      wx.setStorageSync('session_' + roomId, sessionData)
      const mySessions = wx.getStorageSync('mySessions') || []
      if (!mySessions.includes(roomId)) {
        mySessions.unshift(roomId)
        if (mySessions.length > 20) {
          const removed = mySessions.splice(20)
          removed.forEach(id => {
            try {
              wx.removeStorageSync('session_' + id)
              wx.removeStorageSync('votes_' + id)
              wx.removeStorageSync('result_' + id)
              wx.removeStorageSync('myVote_' + id)
            } catch (e) {}
          })
        }
        wx.setStorageSync('mySessions', mySessions)
      }
    } catch (e) {
      console.error('存储失败', e)
    }

    const app = getApp()
    app.globalData.currentSession = sessionData

    this.setData({ roomId })

    wx.showToast({ title: '房间已创建，点击分享！', icon: 'success' })

    this._summoning = false
  },

  onEnterVote: function () {
    wx.vibrateShort({ type: 'medium' })
    wx.navigateTo({
      url: '/pages/vote/vote?roomId=' + this.data.roomId + '&isCreator=1'
    })
  },

  onShareAppMessage: function () {
    const roomId = this.data.roomId
    const app = getApp()
    return {
      title: '谁家好人现在还没定下吃啥？进来表态，AI端水大师在线判决！',
      path: '/pages/vote/vote?roomId=' + roomId,
      imageUrl: (app.globalData && app.globalData.shareImagePath) || ''
    }
  }
})
