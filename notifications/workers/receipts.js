const { Expo } = require('expo-server-sdk')
const escapeStringRegexp = require('escape-string-regexp')

let expo = new Expo()

module.exports = async (job, done) => {
  try {
    const { tickets, contentId, chunks } = job.data;

    const ticketIds = tickets.map(ticket => ticket.id)

    let ticketIdChunks = expo.chunkPushNotificationReceiptIds(ticketIds);
    console.log('waiting for receipts')

    const receipts = await Promise.all(ticketIdChunks.map(ticketChunk => {
      return expo.getPushNotificationReceiptsAsync(ticketChunk);
    }))

    const correct = []
    const errors = []

    receipts.forEach(receipt => {
      Object.entries(receipt).forEach(([key, value]) => {
        let { status, message, details } = value
        if (status === 'ok') {
          correct.push(key)
        } else if (status === 'error') {
          if(details.error === 'DeviceNotRegistered') {
            const correspondingTicket = tickets.find(ticket => ticket.key === key)
            const correspondingChunk = correspondingTicket && chunks[correspondingTicket.chunkIndex]
            const pushMessage = correspondingChunk && correspondingChunk.find(chunk => {
              return new RegExp(escapeStringRegexp(chunk.to)).test(message)
            })
            if(pushMessage){
              userPromises.push(strapi.query('appuser').update(
                { expotoken: pushMessage.to },
                { enabled: false }
              ))
            }
          }
          errors.push(message)
        } else {
          console.log('different status', key, value)
        }
      })
    })

    console.log('errors', errors)
    console.log('correct', correct)

    done((!errors.length && null) || errors, correct);

  } catch (error) {
    console.log(error)
    done(error);
  }
};
