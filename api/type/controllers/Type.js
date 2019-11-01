'use strict';
const { sanitizeEntity } = require('strapi-utils');


/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/guides/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async find (ctx) {
    const entity = strapi.services.type.find(ctx.query)
    return sanitizeEntity(entity, strapi.models.type)
  }
};
