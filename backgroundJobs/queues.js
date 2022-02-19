
const { 
  notifications: notificationsWorker,
  receipts: receiptsWorker,
  cacheManager: cacheManagerWorker
 } = require('./workers');
const Queue = require('bull')

const redis = {
  port: process.env.redis_port || 6379,
  host: process.env.redis_host || '127.0.0.1',
  db: process.env.redis_queue_db || 0,
  password: process.env.redis_password
}

const notifications = new Queue('notification-send', { redis })
const receipts = new Queue('notification-receipt', { redis })
const cacheManager = new Queue('cache-management', { redis })

notifications.process((job, done) => notificationsWorker(job, done))
receipts.process((job, done) => receiptsWorker(job, done))
cacheManager.process((job, done) => cacheManagerWorker(job, done))

module.exports = { notifications, receipts, cacheManager }
