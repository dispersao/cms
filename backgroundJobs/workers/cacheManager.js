module.exports = async ({ data }, done) => {
  try {
    if (data.action === 'delete') {
      const keys = await strapi.middleware.cache.store.keys()
      console.log('keys before delete', keys)
      console.log('will remove paths', data.paths)

      await Promise.all(
        keys
          .filter(key => data.paths.some(path => key.match(new RegExp(path))))
          .map(key => strapi.middleware.cache.store.del(key))
      )
      const newkeys = await strapi.middleware.cache.store.keys()
      console.log('keys after delete', newkeys)
      done(
        `cleared cache keys ${keys
          .filter(key => !newkeys.includes(key))
          .join(', ')}`
      )
    }
  } catch (e) {
    done(e)
    console.log(e)
  }
}
