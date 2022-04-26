'use strict'
const { cacheManager } = require('../../../backgroundJobs/queues')

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
  lifecycles: {
    async beforeUpdate(params, data) {
      if (data.state === 'idle') {
        const entity = await strapi.services.script.findOne(params)
        await deleteScriptSequences(params)
        await deleteSessionContents(params)
        await strapi.services.script.clearCacheScriptState(entity)
        await strapi.services.sessioncontent.clearScriptSessioncontentsList(
          entity
        )
      }
    },

    async beforeDelete(params, data) {
      const entity = await strapi.services.script.findOne(params)
      await deleteScriptSequences(params)
      await deleteSessionContents(params)
      await strapi.services.script.clearCacheScriptState(entity)
      await strapi.services.sessioncontent.clearScriptSessioncontentsList(
        entity
      )
    }
  }
}

const deleteScriptSequences = async ({ id }) => {
  await strapi.query('scriptsequence').delete({ script: id })
}

const deleteSessionContents = async ({ id }) => {
  await strapi.query('sessioncontent').delete({ script: id })
}
