'use strict';
const { sanitizeEntity } = require('strapi-utils')

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/guides/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {

  async create (ctx) {
    let entity
    const parts = await Promise.all(
      ctx.request.body.parts.map(part => {
       return strapi.services.part.create(part)
      })
    )
    let seqData = {
      ...ctx.request.body,
      parts
    }
    entity = await strapi.services.sequence.create(seqData)
    const model = strapi.models.sequence
    return sanitizeEntity(entity, { model });
  },

  async find(ctx) {
    let entities;
    if (ctx.query._q) {
      entities = await strapi.services.sequence.search(ctx.query);
    } else {
      entities = await strapi.services.sequence.find(ctx.query, ['location', 'type', 'categories', 'parts.characters']);
    }
    const model = strapi.models.sequence

    return entities.map(entity => sanitizeEntity(entity, { model }));
  },
  async findOne(ctx) {
    const entity = await strapi.services.sequence.findOne(ctx.params, ['location', 'type', 'categories', 'parts.characters']);
    const model = strapi.models.sequence
    return sanitizeEntity(entity, { model });
  }
};
