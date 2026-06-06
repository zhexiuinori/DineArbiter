const { filterRestaurants, rankRestaurants, RESTAURANTS, VOTE_TAGS } = require('../../utils/restaurant')
const { getRandomItems } = require('../../utils/util')
const { playGavelSound, playSlapSound } = require('../../utils/audio')
const { generatePoster, savePosterToAlbum } = require('../../utils/poster')

Page({
  data: {
    isThinking: true,
    thinkingText: '大师正在疯狂端水中...',
    thinkingProgress: 0,
    result: null,
    sessionId: '',
    vetoRestaurantId: '',
    chatMessages: [],
    chatInput: ''
  },

  onLoad: function (options) {
    const sessionId = options.sessionId || ''
    this.setData({ sessionId })

    try {
      const cached = wx.getStorageSync('result_' + sessionId)
      if (cached) {
        this.setData({ isThinking: false, result: cached })
        return
      }
    } catch (e) {}

    this.startThinking()
  },

  onUnload: function () {
    if (this._thinkingTimer) {
      clearInterval(this._thinkingTimer)
      delete this._thinkingTimer
    }
  },

  startThinking: function () {
    const texts = [
      '大师正在疯狂端水中...',
      '分析群友口味偏好...',
      '权衡各方利益...',
      '计算最优解...',
      '即将宣判...'
    ]

    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = Math.min(step * 20, 100)
      const textIndex = Math.min(Math.floor(step / 1.2), texts.length - 1)

      this.setData({
        thinkingProgress: progress,
        thinkingText: texts[textIndex]
      })

      if (step >= 5) {
        clearInterval(timer)
        this.callAiJudge()
      }
    }, 800)
  },

  callAiJudge: function () {
    let votes = []
    try {
      votes = wx.getStorageSync('votes_' + this.data.sessionId) || []
    } catch (e) {}

    if (votes.length === 0) {
      wx.showModal({
        title: '⚠️ 还没有表态数据',
        content: '这个房间还没有人表态，快去邀请群友来表态吧！',
        confirmText: '去表态',
        cancelText: '看演示',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/vote/vote?roomId=' + this.data.sessionId
            })
          } else {
            this.generateMockVotesAndJudge()
          }
        }
      })
      return
    }

    this.callAiJudgeWithVotes(votes)
  },

  callAiJudgeWithVotes: function (votes) {
    const app = getApp()
    if (!app.globalData.cloudReady) {
      this.localFallback(votes)
      return
    }

    wx.cloud.callFunction({
      name: 'aiJudge',
      data: {
        votes: votes,
        sessionId: this.data.sessionId,
        vetoRestaurantId: this.data.vetoRestaurantId,
        budgetRange: (wx.getStorageSync('session_' + this.data.sessionId) || {}).budgetRange || null
      },
      success: (res) => {
        if (res.result && res.result.code === 0) {
          const result = res.result.data
          result.caseId = Date.now().toString(36).toUpperCase()
          this.setData({ isThinking: false, result })
          this.cacheResult(result)
          wx.vibrateShort({ type: 'heavy' })
          playGavelSound()
        } else {
          this.localFallback(votes)
        }
      },
      fail: (err) => {
        console.error('云函数调用失败，使用本地逻辑:', err)
        wx.showToast({ title: 'AI暂时开小差，使用智能匹配', icon: 'none' })
        this.localFallback(votes)
      }
    })
  },

  localFallback: function (votes) {
    const session = wx.getStorageSync('session_' + this.data.sessionId) || {}
    const budgetRange = session.budgetRange || null

    const allLikes = []
    const allDislikes = []
    votes.forEach(v => {
      if (v.likes) allLikes.push(...v.likes)
      if (v.dislikes) allDislikes.push(...v.dislikes)
    })

    let candidates = filterRestaurants(allLikes, allDislikes)

    if (budgetRange) {
      candidates = candidates.filter(r => r.avgPrice >= budgetRange.min && r.avgPrice <= budgetRange.max)
      if (candidates.length === 0) {
        candidates = [...RESTAURANTS].filter(r => r.avgPrice >= budgetRange.min && r.avgPrice <= budgetRange.max)
      }
      if (candidates.length === 0) {
        candidates = filterRestaurants(allLikes, allDislikes)
      }
    }

    const ranked = rankRestaurants(candidates.length > 0 ? candidates : RESTAURANTS, allLikes, allDislikes)
    const winner = ranked[0] || RESTAURANTS[0]
    const runnersUp = ranked.slice(1, 3)

    const mockNames = ['爱吃草的李四', '想买醉的王五', '肉食系张三', '佛系赵六', '精致钱七', '实惠孙八']
    const shuffledNames = getRandomItems(mockNames, votes.length || 3)
    const p1 = shuffledNames[0] || '群友A'
    const p2 = shuffledNames[1] || '群友B'

    const templates = [
      `本局由'${p1}'和'${p2}'共同妥协达成——人生就是这样，你退一步我退一步，最后都进了${winner.name}。🤝`,
      `经过本大师反复端量，${winner.name}是唯一能让'${p1}'不翻脸、'${p2}'不掀桌的完美选择。⚖️`,
      `本大师端了三碗水，洒了两碗，最后一碗稳稳端到了${winner.name}。别问为什么，问就是缘分！🫗`
    ]

    const REASON_TEMPLATES = {
      '肉肉肉': '这家店的肉管够，放心大胆地吃！',
      '微醺': '氛围到位，小酌一杯刚刚好～',
      '好拍照': '出片率99%，朋友圈素材管够！',
      '辣辣辣': '辣度拉满，保证你吃得过瘾！',
      '清淡养生': '清淡不等于无聊，养生也快乐！',
      '大口吃': '分量管够，减肥明天再说！',
      '小资情调': '环境绝了，适合慢慢享受！',
      '实惠管饱': '性价比之王，钱包不心疼！',
      '夜宵走起': '深夜食堂已就位！',
      '甜品续命': '专治各种不开心！',
      '海鲜自由': '海鲜控的天堂！',
      '面食控': '面食的灵魂在这升华了！'
    }

    const reasons = shuffledNames.map((name, i) => {
      const userLikes = votes[i] ? votes[i].likes : []
      const mainTag = userLikes.length > 0 ? userLikes[0].text : ''
      const reason = REASON_TEMPLATES[mainTag] || '这家店综合评分最高，包你满意！'
      return { name, reason }
    })

    const result = {
      caseId: Date.now().toString(36).toUpperCase(),
      restaurant: winner,
      aiComment: templates[Math.floor(Math.random() * templates.length)],
      reasons,
      runnersUp,
      source: 'local'
    }

    this.setData({ isThinking: false, result })
    this.cacheResult(result)
    wx.vibrateShort({ type: 'heavy' })
    playGavelSound()
  },

  cacheResult: function (result) {
    try {
      wx.setStorageSync('result_' + this.data.sessionId, result)
    } catch (e) {}
  },

  generateMockVotesAndJudge: function () {
    const mockVotes = []
    for (let i = 0; i < 3; i++) {
      const likes = getRandomItems(VOTE_TAGS.filter(t => t.type === 'like'), 2)
      const dislikes = getRandomItems(VOTE_TAGS.filter(t => t.type === 'dislike'), 1)
      mockVotes.push({ likes, dislikes, supplement: '' })
    }
    this.callAiJudgeWithVotes(mockVotes)
  },

  onChatInput: function (e) {
    this.setData({ chatInput: e.detail.value })
  },

  onChatSend: function () {
    const question = this.data.chatInput.trim()
    if (!question) return

    wx.vibrateShort({ type: 'light' })

    const chatMessages = [...this.data.chatMessages, { role: 'user', content: question }, { role: 'ai', content: '大师思考中...', isLoading: true }]
    this.setData({ chatMessages, chatInput: '' })

    const app = getApp()
    if (!app.globalData.cloudReady) {
      const localReplies = [
        '本大师觉得这个选择已经很完美了，别纠结了！',
        '你要是实在不满意，那就给大师一巴掌重新来过吧！',
        '人生没有完美答案，但这家店绝对不亏！',
        '信大师，得永生！别问了，去吃吧！'
      ]
      setTimeout(() => {
        const reply = localReplies[Math.floor(Math.random() * localReplies.length)]
        const msgs = [...this.data.chatMessages]
        msgs[msgs.length - 1] = { role: 'ai', content: reply }
        this.setData({ chatMessages: msgs })
      }, 800)
      return
    }

    const result = this.data.result
    const context = result
      ? `当前判决：推荐${result.restaurant.name}（人均${result.restaurant.avgPrice}元），AI锐评：${result.aiComment}`
      : ''

    wx.cloud.callFunction({
      name: 'aiJudge',
      data: {
        action: 'chat',
        question: question,
        contextParam: context,
        chatHistory: chatMessages.slice(-6)
      },
      success: (res) => {
        const msgs = [...this.data.chatMessages]
        if (res.result && res.result.code === 0) {
          msgs[msgs.length - 1] = { role: 'ai', content: res.result.data.reply }
        } else {
          msgs[msgs.length - 1] = { role: 'ai', content: '大师思考中出了点问题，再问一次试试？' }
        }
        this.setData({ chatMessages: msgs })
      },
      fail: () => {
        const msgs = [...this.data.chatMessages]
        msgs[msgs.length - 1] = { role: 'ai', content: '大师暂时开小差了，稍后再问吧！' }
        this.setData({ chatMessages: msgs })
      }
    })
  },

  onVetoTap: function () {
    wx.vibrateShort({ type: 'heavy' })
    playSlapSound()

    wx.showModal({
      title: '👋 给大师一巴掌',
      content: '对判决不满意？大师重新端一次！',
      confirmText: '重判！',
      cancelText: '算了',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            isThinking: true,
            thinkingProgress: 0,
            result: null,
            vetoRestaurantId: this.data.result ? this.data.result.restaurant.id : ''
          })
          this.startThinking()
        }
      }
    })
  },

  onRejudgeTap: function () {
    wx.vibrateShort({ type: 'medium' })
    this.setData({
      isThinking: true,
      thinkingProgress: 0,
      result: null,
      chatMessages: [],
      chatInput: ''
    })
    this.startThinking()
  },

  onRestaurantTap: function () {
    const r = this.data.result && this.data.result.restaurant
    if (!r) return
    wx.vibrateShort({ type: 'light' })
    wx.navigateToMiniProgram({
      appId: 'wxde8ac0a21135c07d',
      path: '/index/pages/h5/h5?weburl=https%3A%2F%2Fm.dianping.com%2Fsearchlist%3Fkeyword%3D' + encodeURIComponent(r.name),
      envVersion: 'release',
      fail: () => {
        wx.setClipboardData({
          data: '大众点评搜索：' + r.name,
          success: () => {
            wx.showToast({ title: '已复制搜索词，去大众点评搜索吧', icon: 'none', duration: 2500 })
          }
        })
      }
    })
  },

  onSavePoster: function () {
    wx.showLoading({ title: '生成海报中...' })
    generatePoster('posterCanvas', this.data.result).then(filePath => {
      wx.hideLoading()
      return savePosterToAlbum(filePath)
    }).then(() => {
      wx.showToast({ title: '已保存到相册', icon: 'success' })
    }).catch(err => {
      wx.hideLoading()
      console.error('保存海报失败', err)
      wx.showToast({ title: '保存失败，请重试', icon: 'none' })
    })
  },

  onShareAppMessage: function () {
    const r = this.data.result
    const app = getApp()
    const restaurantName = r ? r.restaurant.name : '吃大餐'
    return {
      title: `⚖️ 端水判决：今晚去${restaurantName}！`,
      path: '/pages/result/result?sessionId=' + this.data.sessionId,
      imageUrl: (app.globalData && app.globalData.shareImagePath) || ''
    }
  }
})
