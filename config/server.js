module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  proxy: false,
  cron: {
    enabled: false
  },
  admin: {
    autoOpen: false,
    auth: {
      secret: env('ADMIN_JWT_SECRET', '***')
    }
  }
});
