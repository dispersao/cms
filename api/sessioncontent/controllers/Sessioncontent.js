'use strict';
const { sanitizeEntity } = require('strapi-utils')

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/guides/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async create (ctx) {
    if (Array.isArray(ctx.request.body)) { // wait until all promises are resolved 
      return await Promise.all(ctx.request.body.map(strapi.services.sessioncontent.create))
    } else { 
      return strapi.services.sessioncontent.create(ctx.request.body)
    }
  }
};
