'use strict';
const { sanitizeEntity } = require('strapi-utils')
const keygen = require("keygenerator")

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/guides/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {

  async create(ctx) {
    let entity
    const { id } = ctx.state.user

    const token = keygen._({
      forceUppercase: true,
      length: 6
    })


    const scriptObj = {
      ...ctx.request.body,
      author: id,
      token
    };
  
    entity = await strapi.services.script.create(scriptObj)
  
    // Send 201 `created`
    console.log(ctx.created(entity))
    
    const model = strapi.models.script
    return sanitizeEntity(entity, { model });
  },

  async update (ctx) {
    let entity
    if(ctx.request.body.scriptsequences) {
      entity = await strapi.services.script.findOne(ctx.params)
      const scrToDelete = entity.scriptsequences.filter(scrseq => {
        return !ctx.request.body.scriptsequences.includes(scrseq.id)
      })
      await Promise.all(scrToDelete.map( scrseq => {
        return strapi.services.scriptsequence.delete({id: scrseq.id})
      }))
    }
    entity = await strapi.services.script.update(
      ctx.params,
      ctx.request.body
    )

    const model = strapi.models.script
    return sanitizeEntity(entity, { model });
  }
};
