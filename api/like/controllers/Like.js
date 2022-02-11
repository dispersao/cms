'use strict';
const { sanitizeEntity } = require('strapi-utils')

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async create(ctx) {
    const entity = await strapi.services.like.create(ctx.request.body);
    const keys = await ctx.middleware.cache.store.keys()
    console.log(keys)
   // await ctx.middleware.cache.bust({ model: 'sessioncontent', id: ctx.sessioncontent, path: '/sessioncontents/:slug/likes/count' });
    return entity
  },
  async update(ctx) {
    const entity = await strapi.services.like.update(ctx.params, ctx.request.body);
    strapi.middleware.cache.store.keys().then(keys => {
      console.log(keys.filter)
      const removableKeys = keys.filter(k => k.indexOf(`sessioncontents/${entity.sessioncontent.id}`) >= 0)
      strapi.middleware.cache.clearCache(removableKeys);
    })

    const model = strapi.models.sessioncontent
    return sanitizeEntity(entity, { model })
  },
  async delete(ctx){
    const entity = await strapi.services.like.delete(ctx.params);
    const keys = await ctx.middleware.cache.store.keys()
    console.log(keys)

    //await strapi.middleware.cache.bust({ model: 'sessioncontent', id: params.sessioncontent, path: '/sessioncontents/:slug/likes/count' });
    return entity
  }
};
