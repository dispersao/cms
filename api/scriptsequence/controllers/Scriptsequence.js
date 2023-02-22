'use strict'
const { sanitizeEntity } = require('strapi-utils')

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async bulkUpdate(ctx) {
    const entities = await Promise.all(
      ctx.request.body.map(el => {
        const { id, ...data } = el
        return strapi.services.scriptsequence.update({ id }, data)
      })
    )

    const model = strapi.models.scriptsequence
    return entities.map(entity => sanitizeEntity(entity, { model }))
  }
}
