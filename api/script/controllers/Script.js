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
    // sendMessages(entity, ctx.request.body.state)

    if (ctx.request.body.scriptsequences) {
      const scrToDelete = entity.scriptsequences.filter(scrseq => {
        return !ctx.request.body.scriptsequences.includes(scrseq.id)
      })
      await Promise.all(
        scrToDelete.map(scrseq => {
          return strapi.services.scriptsequence.delete({ id: scrseq.id })
        })
      )
    }

    if (ctx.request.body.sessioncontents) {
      const sscoToDelete = entity.sessioncontents.filter(sescon => {
        return !ctx.request.body.sessioncontents.includes(sescon.id)
      })
      await Promise.all(
        sscoToDelete.map(sescon => {
          return strapi.services.sessioncontent.delete({ id: sescon.id })
        })
      )
    }

    entity = await strapi.services.script.update(ctx.params, ctx.request.body)

    await deleteCache(entity)
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

      await Promise.all(
        entity.scriptsequences.map(scrseq => {
          return strapi.services.scriptsequence.delete({ id: scrseq.id })
        })
      )

      await Promise.all(
        entity.sessioncontents.map(sescon => {
          return strapi.services.sessioncontent.delete({ id: sescon.id })
        })
      )
    }

    entity = await strapi.services.script.update(ctx.params, params)

    if (token) {
      await publishProfiles(entity)
    }
    entity = await strapi.services.script.findOne(ctx.params)

    await deleteCache(entity)

    const model = strapi.models.script
    return sanitizeEntity(entity, { model })
  }
}

const publishProfiles = async entity => {
  const profileContents = entity.sessioncontents.filter(ses => ses.profile)
  const profiles = await strapi.services.profile.find()

  const profilesToCreate = await Promise.all(
    profiles
      .filter(prof => !profileContents.includes(prof))
      .map(prof =>
        strapi.services.sessioncontent.create({
          script: entity.id,
          state: 'published',
          programmed_at: 0,
          profile: prof.id
        })
      )
  )
  return profilesToCreate
}

const deleteCache = async ({ token }) => {
  cacheManager.add({
    action: 'delete',
    paths: [`scripts/${token}/state`]
  })
}
