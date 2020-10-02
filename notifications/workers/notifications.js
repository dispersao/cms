const { Expo } = require('expo-server-sdk')
let expo = new Expo()

module.exports = async (job, done) => {
  try {
    const { receipts } = require('../queues')
    const { messages, contentId } = job.data;

    let chunks = expo.chunkPushNotifications(messages)
    const tickets = await Promise.all(chunks.map(chunk => {
      return expo.sendPushNotificationsAsync(chunk)
    }))

    const receiptIds = []
    const errors = []

    tickets.flat().forEach(ticket => {
      const { status, details, message } = ticket
      if(status === 'ok') {
        receiptIds.push(ticket.id)
      } else if(status === 'error') {
        errors.push(message)
      }
    })

    console.log('sent PNs')
    console.log(receiptIds)
    console.log('failed')
    console.log(errors)

    receipts.add({
      contentId,
      receiptIds
    })
    
    const sentError = errors.length ? errors : null;
    done(sentError, job.data);
  } catch (error) {
    console.log(error)
    done(error);
  }
};
