const { VOTE_TAGS } = require('../../utils/restaurant')
const { getRandomItems } = require('../../utils/util')
const { playLikeSound, playDislikeSound } = require('../../utils/audio')

Page({
  data: {
    session: null,
    sessionId: '',
    isCreator: false,
    voteSubmitted: false,
    currentTag: null,
    remainingTags: [],
    currentIndex: 0,
    totalTags: 0,
    moveX: 0,
    rotate: 0,
    flyDirection: '',
    isAnimating: false,
    progress: 0,
    myLikes: [],
    myDislikes: [],
    customLikes: [],
    customDislikes: [],
    customWantText: '',
    photos: [],
    supplement: '',
    voteCount: 0,
    maxPeople: 4,
    allVoted: false,
    feedItems: [],
    touchStartX: 0,
    touchStartY: 0
  },

  onLoad: function (options) {
    const roomId = options.roomId || options.sessionId || ''
    const isCreator = options.isCreator === '1'
    let session = null

    if (roomId) {
      try {
        session = wx.getStorageSync('session_' + roomId)
        const mySessions = wx.getStorageSync('mySessions') || []
        if (!mySessions.includes(roomId)) {
          mySessions.unshift(roomId)
          wx.setStorageSync('mySessions', mySessions)
        }
      } catch (e) {
        console.error('读取session失败', e)
      }
    }

    if (!session) {
      try {
        session = wx.getStorageSync('currentSession')
      } catch (e) {}
    }

    const hasResult = roomId ? wx.getStorageSync('result_' + roomId) : null
    if (hasResult) {
      this.setData({ sessionId: roomId, isCreator, session: session || { region: '未知', time: '待定', maxPeople: 4 } })
      setTimeout(() => { this.goJudge() }, 100)
      return
    }

    const myVoteKey = 'myVote_' + roomId
    const myVote = wx.getStorageSync(myVoteKey)
    const alreadyVoted = !!myVote

    const tags = getRandomItems(VOTE_TAGS, 12)
    const currentTag = alreadyVoted ? null : (tags.length > 0 ? tags[0] : null)
    const remainingTags = alreadyVoted ? [] : tags.slice(1)

    const votes = roomId ? (wx.getStorageSync('votes_' + roomId) || []) : []
    const voteCount = votes.length

    this.setData({
      sessionId: roomId,
      isCreator: isCreator,
      session: session || { region: '未知', time: '待定', maxPeople: 4 },
      currentTag: currentTag,
      remainingTags: remainingTags,
      totalTags: tags.length,
      voteSubmitted: alreadyVoted,
      voteCount: voteCount,
      myLikes: alreadyVoted ? (myVote.likes || []) : [],
      myDislikes: alreadyVoted ? (myVote.dislikes || []) : [],
      customLikes: alreadyVoted ? (myVote.customLikes || []) : [],
      customDislikes: alreadyVoted ? (myVote.customDislikes || []) : [],
      supplement: alreadyVoted ? (myVote.supplement || '') : '',
      photos: alreadyVoted ? (myVote.photos || []) : []
    })

    try {
      const sessionData = wx.getStorageSync('session_' + roomId) || {}
      this.setData({
        maxPeople: sessionData.maxPeople || 4
      })
    } catch (e) {}

    this.addFeedItem(alreadyVoted ? '你已提交过表态' : '你进入了表态墙')
  },

  onShow: function () {
    if (this.data.sessionId) {
      try {
        const votes = wx.getStorageSync('votes_' + this.data.sessionId) || []
        this.setData({ voteCount: votes.length })
        this.checkAllVoted()
      } catch (e) {}
    }
  },

  checkAllVoted: function () {
    const maxPeople = this.data.maxPeople
    if (this.data.voteCount >= maxPeople) {
      this.setData({ allVoted: true })
      return true
    }
    return false
  },

  goJudge: function () {
    wx.vibrateShort({ type: 'heavy' })
    wx.navigateTo({
      url: '/pages/result/result?sessionId=' + this.data.sessionId
    })
  },

  addFeedItem: function (text) {
    const items = this.data.feedItems
    items.unshift(text)
    if (items.length > 20) items.pop()
    this.setData({ feedItems: items })
  },

  onTouchStart: function (e) {
    if (this.data.isAnimating) return
    this.setData({
      touchStartX: e.touches[0].clientX,
      touchStartY: e.touches[0].clientY
    })
  },

  onTouchMove: function (e) {
    if (this.data.isAnimating) return
    const deltaX = e.touches[0].clientX - this.data.touchStartX
    const moveX = deltaX * 2
    const rotate = deltaX * 0.1
    this.setData({ moveX, rotate })
  },

  onTouchEnd: function (e) {
    if (this.data.isAnimating) return
    const { moveX } = this.data
    if (Math.abs(moveX) > 120) {
      if (moveX > 0) {
        this.handleLike()
      } else {
        this.handleDislike()
      }
    } else {
      this.setData({ moveX: 0, rotate: 0 })
    }
  },

  onLikeTap: function () {
    if (this.data.isAnimating) return
    wx.vibrateShort({ type: 'medium' })
    this.handleLike()
  },

  onDislikeTap: function () {
    if (this.data.isAnimating) return
    wx.vibrateShort({ type: 'medium' })
    this.handleDislike()
  },

  onSkipTap: function () {
    if (this.data.isAnimating) return
    wx.vibrateShort({ type: 'light' })
    this.flyOutAndNext('skip')
  },

  onSkipAll: function () {
    wx.vibrateShort({ type: 'light' })
    this.setData({
      currentTag: null,
      remainingTags: [],
      progress: 100
    })
  },

  handleLike: function () {
    const tag = this.data.currentTag
    if (tag) {
      const myLikes = [...this.data.myLikes, tag]
      this.setData({ myLikes })
      this.addFeedItem(`你心动了【${tag.emoji}${tag.text}】`)
      playLikeSound(tag.text)
    }
    this.flyOutAndNext('right')
  },

  handleDislike: function () {
    const tag = this.data.currentTag
    if (tag) {
      const myDislikes = [...this.data.myDislikes, tag]
      this.setData({ myDislikes })
      this.addFeedItem(`你避雷了【${tag.emoji}${tag.text}】`)
      playDislikeSound()
    }
    this.flyOutAndNext('left')
  },

  flyOutAndNext: function (direction) {
    const flyX = direction === 'right' ? 1200 : direction === 'left' ? -1200 : 0
    const flyRotate = direction === 'right' ? 30 : direction === 'left' ? -30 : 0

    this.setData({
      isAnimating: true,
      moveX: flyX,
      rotate: flyRotate,
      flyDirection: direction === 'right' ? 'fly-right' : direction === 'left' ? 'fly-left' : 'fly-up'
    })

    setTimeout(() => {
      const nextTag = this.data.remainingTags.length > 0 ? this.data.remainingTags[0] : null
      const newRemaining = this.data.remainingTags.slice(1)
      const newIndex = this.data.currentIndex + 1
      const progress = Math.min((newIndex / this.data.totalTags) * 100, 100)

      this.setData({
        currentTag: nextTag,
        remainingTags: newRemaining,
        currentIndex: newIndex,
        moveX: 0,
        rotate: 0,
        flyDirection: '',
        isAnimating: false,
        progress
      })
    }, 400)
  },

  onCustomWantInput: function (e) {
    this.setData({ customWantText: e.detail.value })
  },

  onAddCustomWant: function () {
    const text = this.data.customWantText.trim()
    if (!text) return

    const customLikes = [...this.data.customLikes, {
      id: 'custom_' + Date.now(),
      text: text,
      emoji: '🍽️',
      type: 'like'
    }]

    this.setData({
      customLikes,
      customWantText: ''
    })
    wx.vibrateShort({ type: 'light' })
  },

  onRemoveCustomLike: function (e) {
    const index = e.currentTarget.dataset.index
    const customLikes = [...this.data.customLikes]
    customLikes.splice(index, 1)
    this.setData({ customLikes })
  },

  onAddPhoto: function () {
    wx.chooseImage({
      count: 4 - this.data.photos.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const photos = [...this.data.photos, ...res.tempFilePaths]
        this.setData({ photos })
        wx.vibrateShort({ type: 'light' })
      }
    })
  },

  onDeletePhoto: function (e) {
    const index = e.currentTarget.dataset.index
    const photos = [...this.data.photos]
    photos.splice(index, 1)
    this.setData({ photos })
  },

  onSupplementInput: function (e) {
    this.setData({ supplement: e.detail.value })
  },

  onSubmitVote: function () {
    wx.vibrateShort({ type: 'heavy' })

    const allLikes = [...this.data.myLikes, ...this.data.customLikes]
    const allDislikes = [...this.data.myDislikes, ...this.data.customDislikes]

    const voteData = {
      likes: allLikes,
      dislikes: allDislikes,
      supplement: this.data.supplement,
      photos: this.data.photos,
      timestamp: new Date().toISOString()
    }

    try {
      const key = 'votes_' + this.data.sessionId
      const existing = wx.getStorageSync(key) || []
      existing.push(voteData)
      wx.setStorageSync(key, existing)

      const myVoteKey = 'myVote_' + this.data.sessionId
      wx.setStorageSync(myVoteKey, {
        likes: this.data.myLikes,
        dislikes: this.data.myDislikes,
        customLikes: this.data.customLikes,
        customDislikes: this.data.customDislikes,
        supplement: this.data.supplement,
        photos: this.data.photos
      })
    } catch (e) {
      console.error('保存投票失败', e)
    }

    const updatedVotes = wx.getStorageSync('votes_' + this.data.sessionId) || []
    this.setData({
      voteSubmitted: true,
      voteCount: updatedVotes.length
    })

    this.addFeedItem('你提交了表态！')

    if (this.checkAllVoted()) {
      this.addFeedItem('🎉 所有人已表态，即将自动端水！')
      setTimeout(() => {
        this.goJudge()
      }, 1500)
    } else {
      wx.showToast({ title: '表态提交成功！', icon: 'success' })
    }
  },

  onStartJudge: function () {
    this.goJudge()
  },

  onUrgeTap: function () {
    wx.vibrateShort({ type: 'medium' })
    wx.showModal({
      title: '📣 催进度',
      content: '端水大师喊你快点表态，不然今晚吃西北风！',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  onShareAppMessage: function () {
    const app = getApp()
    return {
      title: '谁家好人现在还没定下吃啥？进来表态，AI端水大师在线判决！',
      path: '/pages/vote/vote?roomId=' + this.data.sessionId,
      imageUrl: (app.globalData && app.globalData.shareImagePath) || ''
    }
  }
})
