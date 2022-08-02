'use strict'
const { sanitizeEntity } = require('strapi-utils')
const { cacheManager } = require('../../../backgroundJobs/queues')

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
  formatAppuser: appuser => {
    const user = sanitizeEntity(appuser, { model: strapi.models.appuser })

    let script = user && user.script
    script = script
      ? {
          state: script.state,
          token: script.token
        }
      : script

    return {
      ...user,
      script
    }
  },
  clearCacheAppuser: async ({ appuser }) => {
    cacheManager.add({
      action: 'delete',
      paths: [`\\/appusers\\/${appuser}`]
    })
  },
  clearCacheAppuserLikes: async ({ appuser }) => {
    cacheManager.add({
      action: 'delete',
      paths: [`\\/appusers\\/${appuser}\\/likes`]
    })
  }
}
