'use strict';
const { sanitizeEntity } = require('strapi-utils')
const { Expo } = require('expo-server-sdk')
const { getTranslationByLang } = require('../../../locales/')

const { notifications } = require('../../../notifications/queues');

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
      'post.contentcreator',
      'comment',
      'comment.contentcreator'
    ])

    if(/*entity.state === states[0] &&*/ ctx.request.body.state === states[1] && (entity.post || entity.comment)) {
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
  const appusers = await strapi.services.appuser.find({
    script: entity.script,
    enabled: true,
    expotoken_null: false
  })

  if(!appusers){
    return
  }

  const type = entity.post ? 'post' : 'comment'

  const messages = appusers.map(appuser => {
    if (Expo.isExpoPushToken(appuser.expotoken)) {
      return {
        to: appuser.expotoken,
        sound: 'default',
        title: `${entity[type].contentcreator.name}`,
        body: getTranslationByLang(appuser.locale, `notification.${type}`, {}),
        data: { 
          sessioncontent: entity.id,
          type
        }
      }
    }
  })
  .filter(Boolean);
  console.log('messages', messages)

  notifications.add({
    contentId: entity.id,
    messages,
  });
}
