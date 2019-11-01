'use strict';
const { sanitizeEntity } = require('strapi-utils');

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
    console.log(parts)
    let seqData = {
      ...ctx.request.body,
      parts
    }
    console.log('--------')
    console.log(seqData)
    entity = await strapi.services.sequence.create(seqData)
    const model = strapi.models.sequence
    return sanitizeEntity(entity, { model });
  }
};
