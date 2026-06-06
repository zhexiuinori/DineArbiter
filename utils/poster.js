function generatePoster(canvasId, result) {
  return new Promise((resolve, reject) => {
    const query = wx.createSelectorQuery()
    query.select(`#${canvasId}`).fields({ node: true, size: true }).exec((res) => {
      if (!res[0]) {
        reject(new Error('Canvas节点未找到'))
        return
      }

      const canvas = res[0].node
      const ctx = canvas.getContext('2d')
      const dpr = wx.getSystemInfoSync().pixelRatio
      const width = res[0].width
      const height = res[0].height

      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)

      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, '#0F1117')
      gradient.addColorStop(0.5, '#1A1D23')
      gradient.addColorStop(1, '#0F1117')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      ctx.fillStyle = '#2D5BFF'
      ctx.font = 'bold 24px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('📜 端水判决书 📜', width / 2, 50)

      ctx.fillStyle = 'rgba(255,255,255,0.4)'
      ctx.font = '12px sans-serif'
      ctx.fillText(`案号：DS-${Date.now().toString(36).toUpperCase()}`, width / 2, 75)

      const cardY = 95
      const cardH = 180
      const cardGrad = ctx.createLinearGradient(20, cardY, width - 20, cardY + cardH)
      cardGrad.addColorStop(0, '#2D5BFF')
      cardGrad.addColorStop(1, '#1A4FE0')

      ctx.beginPath()
      roundRect(ctx, 20, cardY, width - 40, cardH, 14)
      ctx.fillStyle = cardGrad
      ctx.fill()

      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 28px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(result.restaurant.emoji + ' ' + result.restaurant.name, width / 2, cardY + 50)

      ctx.font = '14px sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      const tags = result.restaurant.tags.join(' · ')
      ctx.fillText(tags, width / 2, cardY + 80)

      ctx.fillText(`💰 人均¥${result.restaurant.avgPrice}  📍 ${result.restaurant.location}`, width / 2, cardY + 105)

      ctx.font = '13px sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      wrapText(ctx, result.restaurant.desc, width / 2, cardY + 135, width - 80, 20)

      const commentY = cardY + cardH + 25
      ctx.fillStyle = 'rgba(255,255,255,0.1)'
      ctx.beginPath()
      roundRect(ctx, 20, commentY, width - 40, 100, 10)
      ctx.fill()

      ctx.fillStyle = '#2D5BFF'
      ctx.font = 'bold 14px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText('🧙 端水大师·AI锐评', 35, commentY + 25)

      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      ctx.font = '13px sans-serif'
      wrapText(ctx, result.aiComment, 35, commentY + 50, width - 70, 18)

      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.font = '11px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('由端水大师AI提供技术支持 · 公平公正公开', width / 2, height - 20)

      wx.canvasToTempFilePath({
        canvas,
        success: (res) => {
          resolve(res.tempFilePath)
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  })
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = text.split('')
  let line = ''
  let currentY = y

  for (let i = 0; i < chars.length; i++) {
    const testLine = line + chars[i]
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, x, currentY)
      line = chars[i]
      currentY += lineHeight
    } else {
      line = testLine
    }
  }
  ctx.fillText(line, x, currentY)
}

function savePosterToAlbum(filePath) {
  return new Promise((resolve, reject) => {
    wx.saveImageToPhotosAlbum({
      filePath,
      success: resolve,
      fail: (err) => {
        if (err.errMsg.includes('deny') || err.errMsg.includes('auth')) {
          wx.showModal({
            title: '需要授权',
            content: '需要您授权保存图片到相册',
            confirmText: '去授权',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting({
                  success: (settingRes) => {
                    if (settingRes.authSetting['scope.writePhotosAlbum']) {
                      wx.saveImageToPhotosAlbum({
                        filePath,
                        success: resolve,
                        fail: reject
                      })
                    } else {
                      reject(new Error('用户拒绝授权'))
                    }
                  }
                })
              }
            }
          })
        } else {
          reject(err)
        }
      }
    })
  })
}

function generateShareImage(canvasId) {
  return new Promise((resolve, reject) => {
    const query = wx.createSelectorQuery()
    query.select(`#${canvasId}`).fields({ node: true, size: true }).exec((res) => {
      if (!res[0]) {
        reject(new Error('Canvas节点未找到'))
        return
      }

      const canvas = res[0].node
      const ctx = canvas.getContext('2d')
      const dpr = wx.getSystemInfoSync().pixelRatio
      const width = res[0].width
      const height = res[0].height

      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)

      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, '#2D5BFF')
      gradient.addColorStop(1, '#1A4FE0')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 36px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('⚖️ 端水大师', width / 2, height / 2 - 20)

      ctx.font = '18px sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      ctx.fillText('AI在线判决 · 群友表态 · 一键端水', width / 2, height / 2 + 20)

      wx.canvasToTempFilePath({
        canvas,
        success: (res) => resolve(res.tempFilePath),
        fail: (err) => reject(err)
      })
    })
  })
}

module.exports = {
  generatePoster,
  savePosterToAlbum,
  generateShareImage
}
