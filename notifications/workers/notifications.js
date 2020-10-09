const { Expo } = require('expo-server-sdk')
const escapeStringRegexp = require('escape-string-regexp')
 
let expo = new Expo()

module.exports = async (job, done) => {
  try {
    const { receipts } = require('../queues')
    const { messages, contentId } = job.data;

    let chunks = expo.chunkPushNotifications(messages)
    const tickets = await Promise.all(chunks.map(chunk => {
      return expo.sendPushNotificationsAsync(chunk)
    }))

    const receiptList = []
    const errors = []
    const userPromises = []

    tickets.forEach((ticketList, index) => {
      const correspondingChunk = chunks[index]
      ticketList.forEach(ticket => {
        const { status, details, message } = ticket
        if(status === 'ok') {
          receiptList.push({
            chunkIndex: index,
            id: ticket.id})
        } else if(status === 'error'){
          if(details.error === 'DeviceNotRegistered') {
            const pushMessage = correspondingChunk.find(chunk => {
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
        }
      })
    })

    await Promise.all(userPromises)

    receipts.add({
      contentId,
      chunks,
      tickets: receiptList
    })
    
    const sentError = errors.length ? errors : null;
    done(sentError, job.data);
  } catch (error) {
    console.log(error)
    done(error);
  }
};
