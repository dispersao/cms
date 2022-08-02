'use strict'

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
  lifecycles: {
    async beforeDelete(data) {
      const entities = await strapi.services.sessioncontent.find(data)
      await Promise.all(
        entities.map(
          async entity =>
            await strapi.query('like').delete({ sessioncontent: entity.id })
        )
      )
    },
    async afterDelete(data) {
      const entities = Array.isArray(data) ? data : [data]
      await Promise.all(
        entities.map(async entity => {
          await strapi.services.sessioncontent.clearCacheSessioncontentLikesCount(
            { id: entity.id }
          )
          clearScriptSessioncontentList(entity)
        })
      )
    },
    async afterUpdate(data) {
      const entities = Array.isArray(data) ? data : [data]
      await Promise.all(
        entities.map(async entity => {
          clearScriptSessioncontentList(entity)
        })
      )
    },
    async afterCreate(data) {
      const entities = Array.isArray(data) ? data : [data]
      await Promise.all(
        entities.map(async entity => {
          clearScriptSessioncontentList(entity)
        })
      )
    }
  }
}

const clearScriptSessioncontentList = async entity => {
  let type
  if (entity.post) {
    type = 'post'
  } else if (entity.comment) {
    type = 'comment'
  } else if (entity.profile) {
    type = 'profile'
  }
  await strapi.services.script.clearCacheSessioncontentList({
    token: entity.script.token,
    type
  })
}
