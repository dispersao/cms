'use strict';
const { sanitizeEntity } = require('strapi-utils')

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/guides/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {

  async create(ctx) {
    let entity
    const { id } = ctx.state.user

    const scriptObj = {
      ...ctx.request.body,
      author: id,
    };
  
    entity = await strapi.services.script.create(scriptObj)
  
    // Send 201 `created`
    console.log(ctx.created(entity))
    
    const model = strapi.models.script
    return sanitizeEntity(entity, { model });
  }

};
