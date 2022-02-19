'use strict'
const { sanitizeEntity } = require('strapi-utils')

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async create(ctx) {
    const entity = await strapi.services.like.create(ctx.request.body)
    await deleteCache(entity.sessioncontent.id)
    return entity
  },
  async update(ctx) {
    const entity = await strapi.services.like.update(
      ctx.params,
      ctx.request.body
    )
    await deleteCache(entity.sessioncontent.id)

    const model = strapi.models.sessioncontent
    return sanitizeEntity(entity, { model })
  },
  async delete(ctx) {
    const entity = await strapi.services.like.delete(ctx.params)
    await deleteCache(entity.sessioncontent.id)
    return entity
  }
}

const deleteCache = async sessioncontent => {
  let keys = await strapi.middleware.cache.store.keys()
  keys = Promise.all(
    keys
      .filter(
        key => key.indexOf(`sessioncontents/${sessioncontent}/likes/count`) >= 0
      )
      .map(key => strapi.middleware.cache.store.del(key))
  )
}
