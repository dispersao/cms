'use strict'

const { default: createStrapi } = require('strapi')

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */
//review delete of likes
module.exports = {
  lifecycles: {
    async afterCreate(entity) {
      await updateCaches(entity)
    },
    async afterUpdate(entity) {
      await updateCaches(entity)
    },
    async afterDelete(data) {
      const entities = Array.isArray(data) ? data : [data]
      await Promise.all(
        entities.map(async entity => {
          await updateCaches(entity)
        })
      )
    }
  }
}

const updateCaches = async entity => {
  const { sessioncontent, appuser } = entity
  await strapi.services.sessioncontent.clearCacheSessioncontentLikesCount({
    id: sessioncontent.id
  })
  await strapi.services.appuser.clearCacheAppuserLikes({
    appuser: appuser.id
  })
}
