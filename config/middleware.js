module.exports = ({ env }) => {
  return {
    settings: {
      cache: {
        enabled: true,
        type: 'redis',
        logs: 'true',
        maxAge: 806400,
        withKoaContext: true,
        enableEtagSupport: true,
        withStrapiMiddleware: true,
        redisConfig: {
          host: process.env.redis_host,
          port: process.env.redis_port,
          password: process.env.redis_password,
          db: process.env.redis_cache_db || 1
        },
        models: [
          {
            model: 'sessioncontent',
            routes: [
              { path: '/sessioncontents/', method: 'GET' },
              { path: '/sessioncontents/:id/', method: 'GET' },
              { path: '/sessioncontents/', method: 'POST' },
              { path: '/sessioncontents/:id', method: 'PUT' },
              { path: '/sessioncontents/:id', method: 'DELETE' },
              { path: '/sessioncontents/:id/state', method: 'PUT' },
              { path: '/sessioncontents/:id/likes/count', method: 'GET' }
            ]
          },
          {
            model: 'appuser',
            routes: [
              { path: '/appusers/', method: 'GET' },
              { path: '/appusers/', method: 'POST' },
              { path: '/appusers/:id', method: 'PUT' },
              { path: '/appusers/:id', method: 'DELETE' },
              { path: '/appusers/:id/likes', method: 'GET' }
            ]
          },
          'likes',
          {
            model: 'scripts',
            routes: [
              { path: '/scripts/', method: 'GET' },
              { path: '/scripts/', method: 'POST' },
              { path: '/scripts/count/enabled', method: 'GET' },
              { path: '/scripts/:id', method: 'GET' },
              { path: '/scripts/:id', method: 'PUT' },
              { path: '/scripts/:id', method: 'DELETE' },
              { path: '/scripts/:token/state', method: 'PUT' },
              { path: '/scripts/:token/state', method: 'GET' },
              { path: '/scripts/:token/sessioncontents', method: 'GET' }
            ]
          }
        ]
      }
    }
  }
}
