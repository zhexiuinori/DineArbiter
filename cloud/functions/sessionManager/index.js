const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { action, sessionId, sessionData, voteData } = event

  switch (action) {
    case 'createSession': {
      const result = await db.collection('sessions').add({
        data: {
          ...sessionData,
          createdAt: db.serverDate(),
          status: 'voting'
        }
      })
      return { code: 0, sessionId: result._id }
    }

    case 'getSession': {
      const result = await db.collection('sessions').doc(sessionId).get()
      return { code: 0, data: result.data }
    }

    case 'submitVote': {
      await db.collection('votes').add({
        data: {
          sessionId,
          ...voteData,
          createdAt: db.serverDate()
        }
      })
      const countResult = await db.collection('votes').where({ sessionId }).count()
      return { code: 0, voteCount: countResult.total }
    }

    case 'getVotes': {
      const result = await db.collection('votes').where({ sessionId }).get()
      return { code: 0, data: result.data }
    }

    case 'updateStatus': {
      const { status } = event
      await db.collection('sessions').doc(sessionId).update({
        data: { status }
      })
      return { code: 0 }
    }

    default:
      return { code: -1, message: '未知操作' }
  }
}
