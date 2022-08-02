'use strict'
const { sanitizeEntity } = require('strapi-utils')
const { cacheManager } = require('../../../backgroundJobs/queues')

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async create(ctx) {
    const entity = await strapi.services.like.create(ctx.request.body)
    return entity
  },
  async update(ctx) {
    const entity = await strapi.services.like.update(
      ctx.params,
      ctx.request.body
    )
    const model = strapi.models.like
    return sanitizeEntity(entity, { model })
  },
  async delete(ctx) {
    const entity = await strapi.services.like.delete(ctx.params)
    return entity
  }
}
