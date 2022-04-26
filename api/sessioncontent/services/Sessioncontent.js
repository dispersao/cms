'use strict'
const { cacheManager } = require('../../../backgroundJobs/queues')

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
  clearScriptSessioncontentsList: async ({ token }) => {
    cacheManager.add({
      action: 'delete',
      paths: [`\\/sessioncontents\\?script\\.token\\=\\"${token}`]
    })
  },
  clearCacheSessioncontentLikesCount: async ({ id }) => {
    cacheManager.add({
      action: 'delete',
      paths: [`\\/sessioncontents\\/${id}\\/likes\\/count`]
    })
  }
}
