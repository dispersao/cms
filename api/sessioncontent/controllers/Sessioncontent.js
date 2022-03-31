'use strict';
const { sanitizeEntity } = require('strapi-utils')
const { Expo } = require('expo-server-sdk')
const { getTranslationByLang } = require('../../../locales/')

const { notifications } = require('../../../backgroundJobs/queues');

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
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

  async getLikesCount(ctx) {
    console.log('going through getlikes')
    const { id } = ctx.params

    const query = { sessioncontent: id, ...ctx.query }

    let amount

    if (ctx.query._q) {
      amount = await strapi.services.like.countSearch(query)
    } else {
      amount = await strapi.services.like.count(query)
    }
    return { total: amount }
   
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
      'profile.photo'
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
      'post.contentcreator.icon',
      'comment',
      'comment.contentcreator',
      'comment.contentcreator.icon',
      'comment.post.contentcreator'
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
  const refName = entity.comment ? entity.comment.post.contentcreator.name : ''

  const messages = appusers.map(appuser => {
    if (Expo.isExpoPushToken(appuser.expotoken)) {
      
      return {
        to: appuser.expotoken,
        sound: 'default',
        priority: 'high',
        channelId: 'dispersao-posts',
        title: `${entity[type].contentcreator.name}`,
        body: getTranslationByLang(appuser.locale, `notification.${type}`, {name: refName}),
        data: { 
          sessioncontent: entity.id,
          type,
          thumb: entity[type].contentcreator.icon?.url,
          author: entity[type].contentcreator.name,
          published_at:entity.updated_at,
          refName
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
};
