'use strict';
const { sanitizeEntity } = require('strapi-utils')
const { Expo } = require('expo-server-sdk')

const { notifications } = require('../../../notifications/queues');


// const { redis } = require('../../../config/environments/')

// const redis = require("redis")
// const client = redis.createClient({
//     host: process.env.redis_host,
//     no_ready_check: true,
//     auth_pass: process.env.redis_password,
// })
 
// client.on('connect', () => {   
//   console.log("connected");
// });                               
      
// client.on('error', (error) => {   
//   console.log(error.message);
// });  

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

  async stateUpdate (ctx) {
    const states = [
      'pending', 
      'published'
    ]

    if (!ctx.request.body.state || !states.includes(ctx.request.body.state)){
      return ctx.badRequest('invalidState')
    }
    let entity = await strapi.services.sessioncontent.findOne(ctx.params, [
      'post', 
      'post.content',
      'post.contentcreator'
    ])

    if(entity.state === states[0] && ctx.request.body.state === states[1] && entity.post) {
      sendMessages(entity)
    }

    entity = await strapi.services.sessioncontent.update(ctx.params, ctx.request.body)
    const model = strapi.models.sessioncontent
    return sanitizeEntity(entity, { model })
  },

  async findPostsAndComments (ctx) {
    const a = await strapi.query('sessioncontent').model.query(qb => {
      qb.where('post', 'IS NOT NULL').orWhere('comment', 'IS NOT NULL')
    })
    .fetch()
    console.log(a, ctx.query)
  }
};

const sendMessages = async (entity) => {
  let expo = new Expo()

  const appusers = await strapi.services.appuser.find({
    script:entity.script
  })

  const messages = appusers.map(appuser => {
    if (Expo.isExpoPushToken(appuser.expotoken)) {
      return {
        to: appuser.expotoken,
        sound: 'default',
        title: `${entity.post.contentcreator.name} published`,
        body: `${entity.post.content}`,
        data: { 
          post: entity.id 
        },
      }
    }
  })
  .filter(Boolean);

  notifications.add({
    contentId: entity.id,
    messages,
  });
}
