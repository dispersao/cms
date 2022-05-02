'use strict'
const { sanitizeEntity } = require('strapi-utils')
const keygen = require('keygenerator')
const { cacheManager } = require('../../../backgroundJobs/queues')

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async create(ctx) {
    let entity
    const { id } = ctx.state.user

    const scriptObj = {
      ...ctx.request.body,
      author: id
    }

    entity = await strapi.services.script.create(scriptObj)

    // Send 201 `created`
    const model = strapi.models.script
    return sanitizeEntity(entity, { model })
  },

  async update(ctx) {
    let entity = await strapi.services.script.findOne(ctx.params)
    entity = await strapi.services.script.update(ctx.params, ctx.request.body)

    const model = strapi.models.script
    return sanitizeEntity(entity, { model })
  },

  async enabled(ctx) {
    let entities = await strapi.services.script.find({
      state_in: ['started', 'playing', 'paused']
    })

    return {
      total: entities.length
    }
  },

  async getState(ctx) {
    let entity = await strapi.services.script.findOne({
      token: ctx.params.token
    })
    return (
      entity && {
        state: entity.state,
        token: entity.token
      }
    )
  },

  async stateUpdate(ctx) {
    const states = ['idle', 'started', 'playing', 'paused', 'finished']

    if (!ctx.request.body.state || !states.includes(ctx.request.body.state)) {
      return ctx.badRequest('invalidState')
    }

    let entity = await strapi.services.script.findOne(ctx.params)

    let params = {
      ...ctx.request.body
    }

    let token

    if (ctx.request.body.state === 'started') {
      if (!entity.token) {
        token = keygen.number({
          length: 6
        })
        params.token = token
      }
    } else if (ctx.request.body.state === 'finished') {
      params.token = null
    } else if (ctx.request.body.state === 'idle') {
      console.log('on state update', ctx.request.body.state)
      params.token = null
    }

    entity = await strapi.services.script.update(ctx.params, params)
    entity = await strapi.services.script.findOne(ctx.params)

    const model = strapi.models.script
    return sanitizeEntity(entity, { model })
  },

  async findSessioncontents(ctx) {
    let script = await strapi.services.script.findOne({
      token: ctx.params.token
    })
    const query = {
      script: script.id,
      state: 'published'
    }
    if (ctx.query?.type) {
      query[`${ctx.query.type}_null`] = false
    }
    console.log(query)
    let entities = await strapi.services.sessioncontent.find(query, [
      'post',
      'post.contentcreator',
      'post.contentcreator.icon',
      'post.media',
      'post.video',
      'comment',
      'comment.contentcreator',
      'comment.contentcreator.icon',
      'profile',
      'profile.contentcreator',
      'profile.contentcreator.icon',
      'profile.photo'
    ])

    const model = strapi.models.sessioncontent
    return entities.map(entity => sanitizeEntity(entity, { model }))
  }
}
