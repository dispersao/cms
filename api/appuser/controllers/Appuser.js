'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/guides/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {

  async create(ctx) {
    let entity = await strapi.services.appuser.create(ctx.request.body)
    console.log(entity)
    return strapi.services.appuser.formatAppuser(entity)
  },

  async find(ctx) {
    let entities;
    if (ctx.query._q) {
      entities = await strapi.services.appuser.search(ctx.query);
    } else {
      entities = await strapi.services.appuser.find(ctx.query);
    }
    return entities.map(entity => strapi.services.appuser.formatAppuser(entity))
  },

  async findOne(ctx) {
    let entity = await strapi.services.appuser.findOne(ctx.params);
    return strapi.services.appuser.formatAppuser(entity)
  },

  async update(ctx) {
    let reqBody = ctx.request.body
    if(ctx.request.body.script) {
      let script = await strapi.services.script.findOne({token: ctx.request.body.script})
      if (!script) {
        return ctx.badRequest('invalidToken')
      } else if(script.state === 'idle' || script.state === 'finished') {
        return ctx.badRequest('invalidState')
      } else {
        reqBody = {
          ...reqBody,
          script: script.id
        }
      }
    }
    let entity = await strapi.services.appuser.update(
      ctx.params,
      reqBody
    )
    return strapi.services.appuser.formatAppuser(entity)
  }
};
