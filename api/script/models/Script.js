'use strict'
const { cacheManager } = require('../../../backgroundJobs/queues')

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
  lifecycles: {
    async beforeUpdate(params, data) {
      const entity = await strapi.services.script.findOne(params)
      await strapi.services.script.clearCacheScriptState(entity)
      await clearUsersCache(params)
      if (data.state === 'idle') {
        await deleteScriptSequences(params)
        await deleteSessionContents(params)
        await strapi.services.script.clearCacheSessioncontentList(entity)
      } else if (data.state === 'started') {
        const entity = await strapi.services.script.findOne(params)
        const profileContents = entity.sessioncontents.filter(
          ses => ses.profile
        )
        const profiles = await strapi.services.profile.find()

        await Promise.all(
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
      }
    },

    async beforeDelete(params, data) {
      const entity = await strapi.services.script.findOne(params)
      await deleteScriptSequences(params)
      await deleteSessionContents(params)
      await clearUsersCache(params)
      await strapi.services.script.clearCacheScriptState(entity)
      await strapi.services.script.clearCacheSessioncontentList(entity)
    }
  }
}

const deleteScriptSequences = async ({ id }) => {
  await strapi.query('scriptsequence').delete({ script: id })
}

const deleteSessionContents = async ({ id }) => {
  await strapi.query('sessioncontent').delete({ script: id })
}

const clearUsersCache = async ({ id }) => {
  const users = await strapi.services.appuser.find({ script: id })
  return Promise.all(
    users.map(user =>
      strapi.services.appuser.clearCacheAppuser({ appuser: user.id })
    )
  )
}
