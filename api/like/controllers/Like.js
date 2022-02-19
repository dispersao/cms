'use strict'
const { sanitizeEntity } = require('strapi-utils')
const { cacheManager } = require('../../../backgroundJobs/queues');

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async create(ctx) {
    const entity = await strapi.services.like.create(ctx.request.body)
    await deleteCache(entity)
    return entity
  },
  async update(ctx) {
    const entity = await strapi.services.like.update(
      ctx.params,
      ctx.request.body
    )
    await deleteCache(entity)

    const model = strapi.models.sessioncontent
    return sanitizeEntity(entity, { model })
  },
  async delete(ctx) {
    const entity = await strapi.services.like.delete(ctx.params)
    await deleteCache(entity)
    return entity
  }
}

const deleteCache = async ({sessioncontent: { id: sessioncontentid }, appuser: { id: appuserid}}) => {
  cacheManager.add({
    action: 'delete',
    paths: [
      `sessioncontents/${sessioncontentid}/likes/count`,
      `appusers/${appuserid}/likes`
    ]
  })
}
