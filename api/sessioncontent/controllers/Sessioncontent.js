'use strict';
const { sanitizeEntity } = require('strapi-utils')

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/guides/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async create (ctx) {
    if (Array.isArray(ctx.request.body)) { // wait until all promises are resolved 
      return await Promise.all(ctx.request.body.map(strapi.services.sessioncontent.create))
    } else { 
      return strapi.services.sessioncontent.create(ctx.request.body)
    }
  },
  async find(ctx) {
    let entities;
    const fields =  [
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
      'profile.photo',
      'likes'
    ]

    if (ctx.query._q) {
      entities = await strapi.services.sessioncontent.search(ctx.query, fields);
    } else {
      entities = await strapi.services.sessioncontent.find(ctx.query, fields);
    }
    const model = strapi.models.sessioncontent

    return entities.map(entity => sanitizeEntity(entity, { model }));
  },

  async findPostsAndComments (ctx) {
    const a = await strapi.query('sessioncontent').model.query(qb => {
      qb.where('post', 'IS NOT NULL').orWhere('comment', 'IS NOT NULL')
    })
    .fetch()
    console.log(a, ctx.query)
  }
};
