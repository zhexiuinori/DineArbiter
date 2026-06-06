let audioAvailable = null

function playSound(name) {
  if (audioAvailable === false) return

  try {
    const ctx = wx.createInnerAudioContext()
    ctx.volume = 0.6
    ctx.src = '/audio/' + name + '.mp3'
    ctx.onCanplay(() => {
      if (audioAvailable === null) audioAvailable = true
      ctx.play().catch(() => {})
    })
    ctx.onError(() => {
      if (audioAvailable === null) audioAvailable = false
      ctx.destroy()
    })
    ctx.onEnded(() => {
      ctx.destroy()
    })
  } catch (e) {
    audioAvailable = false
  }
}

function playLikeSound(tagText) {
  if (tagText === '微醺' || tagText === '喝酒') {
    playSound('open_bottle')
  } else {
    playSound('like')
  }
}

function playDislikeSound() {
  playSound('dislike')
}

function playGavelSound() {
  playSound('gavel')
}

function playSlapSound() {
  playSound('slap')
}

function playDingSound() {
  playSound('ding')
}

function hapticFeedback(type) {
  const types = {
    light: 'light',
    medium: 'medium',
    heavy: 'heavy'
  }
  wx.vibrateShort({ type: types[type] || 'medium' })
}

module.exports = {
  playSound,
  playLikeSound,
  playDislikeSound,
  playGavelSound,
  playSlapSound,
  playDingSound,
  hapticFeedback
}
