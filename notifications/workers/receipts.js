const { Expo } = require('expo-server-sdk')
let expo = new Expo()

module.exports = async (job, done) => {
  try {
    const { receiptIds, contentId } = job.data;

    let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
    console.log('will wait for receipts')
    console.log(receiptIdChunks)

    const receipts = await Promise.all(receiptIdChunks.map(chunk => {
      return expo.getPushNotificationReceiptsAsync(chunk);
    }))

    const correct = []
    const errors = []

    Object.entries(receipts).map(([key, value]) => {
      let { status, message, details } = value
      if (status === 'ok') {
        correct.push(key)
      } else if (status === 'error') {
        console.error(`There was an error sending a notification: ${message}`);
        if (details && details.error) {
          errors.push(details.error)
        }
      }
    })    
    done((!errors.length && null) || errors, correct);
  } catch (error) {
    console.log(error)
    done(error);
  }
};
