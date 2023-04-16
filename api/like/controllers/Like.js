'use strict'
const { sanitizeEntity } = require('strapi-utils')
const { cacheManager } = require('../../../backgroundJobs/queues')

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async find(ctx) {
    let entities;
    if (ctx.query._q) {
      entities = await strapi.services.like.search(ctx.query, ['dislike']);
    } else {
      entities = await strapi.services.like.find(ctx.query, ['dislike']);
    }
    const model = strapi.models.like

    return entities.map(entity => sanitizeEntity(entity, { model }));
  },
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
