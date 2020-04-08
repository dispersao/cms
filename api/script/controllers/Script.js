'use strict';
const { Expo } = require('expo-server-sdk')
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

    const scriptObj = {
      ...ctx.request.body,
      author: id,
      // token
    };
  
    entity = await strapi.services.script.create(scriptObj)
  
    // Send 201 `created`
    console.log(ctx.created(entity))
    
    const model = strapi.models.script
    return sanitizeEntity(entity, { model });
  },

  async update (ctx) {
    let entity = await strapi.services.script.findOne(ctx.params)
    // sendMessages(entity, ctx.request.body.state)

    if(ctx.request.body.scriptsequences) {

      const scrToDelete = entity.scriptsequences.filter(scrseq => {
        return !ctx.request.body.scriptsequences.includes(scrseq.id)
      })
      await Promise.all(scrToDelete.map(scrseq => {
        return strapi.services.scriptsequence.delete({id: scrseq.id})
      }))
    }

    if(ctx.request.body.sessioncontents) {
      const sscoToDelete = entity.sessioncontents.filter(sescon => {
        return !ctx.request.body.sessioncontents.includes(sescon.id)
      })
      await Promise.all(sscoToDelete.map(sescon => {
        return strapi.services.sessioncontent.delete({id: sescon.id})
      }))
    }

    entity = await strapi.services.script.update(
      ctx.params,
      ctx.request.body
    )

    const model = strapi.models.script
    return sanitizeEntity(entity, { model });
  },

  async enabled (ctx) {
    let entities = await strapi.services.script.find({
      state_in: ['started', 'playing', 'paused']
    });

    return {
      total: entities.length
    }
  },

  async stateUpdate (ctx) {
    const states = [
      'idle', 
      'started', 
      'playing', 
      'paused', 
      'finished'
    ]

    if (!ctx.request.body.state || !states.includes(ctx.request.body.state)){
      return ctx.badRequest('invalidState')
    }
    
    let entity = await strapi.services.script.findOne(ctx.params)

    let params = {
      ...ctx.request.body
    }

    let token

    if (ctx.request.body.state === 'started') {
      if (!entity.token) {
        token =  keygen.number({
          length: 6
        })
        params.token = token
      }
    } else if (ctx.request.body.state === 'finished'){
      params.token = null

    } else if(ctx.request.body.state === 'idle') {

      console.log('on state update', ctx.request.body.state)
      params.token = null
      
      await Promise.all(
        entity.scriptsequences
          .map(scrseq => {
            return strapi.services.scriptsequence.delete({id: scrseq.id})
          }
        )
      )

      await Promise.all(
        entity.sessioncontents
          .map(sescon => {
            return strapi.services.sessioncontent.delete({id: sescon.id})
          }
        )
      )
    }

    entity = await strapi.services.script.update(
      ctx.params,
      params
    )

    if (token) {
      await publishProfiles(entity)
    }
    entity = await strapi.services.script.findOne(ctx.params) 

    const model = strapi.models.script
    return sanitizeEntity(entity, { model })
  }
};

const publishProfiles = async (entity) => {
  const profileContents = entity.sessioncontents.filter(ses => ses.profile)
  const profiles = await strapi.services.profile.find()
  
  const profilesToCreate = await Promise.all(
    profiles.filter(prof => !profileContents.includes(prof))
    .map(prof => strapi.services.sessioncontent.create({
      script: entity.id,
      state: 'published',
      programmed_at: 0,
      profile: prof.id
    }))
  )
  return profilesToCreate
}


const sendMessages = async (entity, state) => {
  let expo = new Expo()

  if (state === 'started') {
    const appusers = await strapi.services.appuser.find({
      script:null
    })

    const messages = appusers.map(appuser => {
      if (Expo.isExpoPushToken(appuser.expotoken)) {
        return {
          to: appuser.expotoken,
          sound: 'default',
          body: 'script started',
          data: { script: entity.id },
        }
      }
    })
    .filter(Boolean)

    console.log('messages', messages)

    let chunks = expo.chunkPushNotifications(messages)
    let tickets = []
   
    // Send the chunks to the Expo push notification service. There are
    // different strategies you could use. A simple one is to send one chunk at a
    // time, which nicely spreads the load out over time:
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk)
        console.log('ticketChunk', ticketChunk)
        tickets.push(...ticketChunk)
        // NOTE: If a ticket contains an error code in ticket.details.error, you
        // must handle it appropriately. The error codes are listed in the Expo
        // documentation:
        // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
      } catch (error) {
        console.error(error)
      }
    }
   

    let receiptIds = []
    for (let ticket of tickets) {
      // NOTE: Not all tickets have IDs; for example, tickets for notifications
      // that could not be enqueued will have error information and no receipt ID.
      if (ticket.id) {
        receiptIds.push(ticket.id)
      }
    }

    let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds)
    for (let chunk of receiptIdChunks) {
      try {
        let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
        console.log(receipts);
  
        // The receipts specify whether Apple or Google successfully received the
        // notification and information about an error, if one occurred.
        for (const receiptId in receipts) {
          const { status, message, details } = receipts[receiptId];
          if (status === "ok") {
            continue;
          } else if (status === "error") {
            console.error(
              `There was an error sending a notification: ${message}`
            );
            if (details && details.error) {
              // The error codes are listed in the Expo documentation:
              // https://docs.expo.io/versions/latest/guides/push-notifications/#individual-errors
              // You must handle the errors appropriately.
              console.error(`The error code is ${details.error}`);
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
}
