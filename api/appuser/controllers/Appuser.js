'use strict'

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async create(ctx) {
    let entity = await strapi.services.appuser.create(ctx.request.body)
    return strapi.services.appuser.formatAppuser(entity)
  },

  async find(ctx) {
    let entities
    if (ctx.query._q) {
      entities = await strapi.services.appuser.search(ctx.query, ['script'])
    } else {
      entities = await strapi.services.appuser.find(ctx.query)
    }
    return entities.map(entity => strapi.services.appuser.formatAppuser(entity))
  },

  async findOne(ctx) {
    const { id } = ctx.params
    let entity = await strapi.services.appuser.findOne({ id }, ['script'])
    return (entity && strapi.services.appuser.formatAppuser(entity)) || entity
  },

  async findLikes(ctx) {
    const { id } = ctx.params
    let appuser = await strapi.services.appuser.findOne({ id })
    const script = appuser.script.id
    let entities = await strapi.services.like.find({
      appuser: id,
      'sessioncontent.script': script.toString()
    }, [])

    return entities
  },

  async update(ctx) {
    let reqBody = ctx.request.body
    if (ctx.request.body.script) {
      let script = await strapi.services.script.findOne({
        token: ctx.request.body.script
      })
      if (!script) {
        return ctx.badRequest('invalidToken')
      } else if (script.state === 'idle' || script.state === 'finished') {
        return ctx.badRequest('invalidState')
      } else {
        reqBody = {
          ...reqBody,
          script: script.id
        }
      }
    }
    let entity = await strapi.services.appuser.update(ctx.params, reqBody)
    return strapi.services.appuser.formatAppuser(entity)
  }
}
