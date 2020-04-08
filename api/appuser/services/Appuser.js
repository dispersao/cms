'use strict';
const { sanitizeEntity } = require('strapi-utils')

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/guides/services.html#core-services)
 * to customize this service
 */

module.exports = {
  formatAppuser:  appuser => {
    const user = sanitizeEntity(appuser, { model: strapi.models.appuser })

    let script = user.script
    script = script ? { 
      state: script.state,
      token: script.token
    } : script

    return {
      ...user,
      script
    }
  }
};
