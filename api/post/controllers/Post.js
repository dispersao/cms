'use strict';
const { sanitizeEntity } = require('strapi-utils')

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async find(ctx) {
    let entities;
    if (ctx.query._q) {
      entities = await strapi.services.post.search(ctx.query);
    } else {
      entities = await strapi.services.post.find(ctx.query, ['contentcreator', 'comments.contentcreator', 'content', 'media', 'categories']);
    }
    const model = strapi.models.post

    return entities.map(entity => sanitizeEntity(entity, { model }));
  }
};
