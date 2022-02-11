module.exports = ({ env }) => {
  return {
    settings: {
      cache: {
        enabled: true,
        type: 'redis',
        logs: 'true',
        enableEtagSupport: true,
        populateContext: true,
        withKoaContext: true,
        withStrapiMiddleware: true,
        redisConfig: {
          host: process.env.redis_host,
          port: process.env.redis_port,
          password: process.env.redis_password,
          db: 1
        },
        models: [{
          model: 'sessioncontent',
          routes: [
            '/sessioncontents/',
            '/sessioncontents/:id/likes/count'
          ]
        }, 'likes']
      }
    }
  }
}
