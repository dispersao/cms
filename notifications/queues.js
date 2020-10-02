
const { 
  notifications: notificationsWorker,
  receipts: receiptsWorker
 } = require('./workers');
const Queue = require('bull')

const redis = {
  port: process.env.redis_port || 6379,
  host: process.env.redis_host || '127.0.0.1',
  db: process.env.redis_db || 0,
  password: process.env.redis_password
}

const notifications = new Queue('notification-send', { redis })
const receipts = new Queue('notification-receipt', { redis })

notifications.process((job, done) => notificationsWorker(job, done))
receipts.process((job, done) => receiptsWorker(job, done))

module.exports = { notifications, receipts }
