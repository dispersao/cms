'use strict'
const { cacheManager } = require('../../../backgroundJobs/queues')

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
  clearCacheScriptState: async ({ token }) => {
    cacheManager.add({
      action: 'delete',
      paths: [`\\/scripts\\/${token}\\/state`]
    })
  },
  clearCacheSessioncontentList: async ({ token, type }) => {
    const typeExt = type ? `\\\?type\\\="${type}"` : '' //NOT WORKING
    const path = `\\/scripts\\/${token}\\/sessioncontents${typeExt}`
    cacheManager.add({
      action: 'delete',
      paths: [path]
    })
  }
}
