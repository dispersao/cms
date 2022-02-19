module.exports = ({ env }) => {
  return {
    settings: {
      cache: {
        enabled: true,
        type: 'redis',
        logs: 'true',
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
            { path: '/sessioncontents/', method: 'GET'},
            { path: '/sessioncontents/:id/', method: 'GET'},
            { path: '/sessioncontents/', method: 'POST'},
            { path: '/sessioncontents/:id', method: 'PUT'},
            { path: '/sessioncontents/:id', method: 'DELETE'},
            { path: '/sessioncontents/:id/state', method: 'PUT'},
            { path: '/sessioncontents/:id/likes/count', method: 'GET'},
          ]
        }, 'likes']
      }
    }
  }
}
