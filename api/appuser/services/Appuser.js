'use strict';
const { sanitizeEntity } = require('strapi-utils')

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
  formatAppuser:  appuser => {
    const user = sanitizeEntity(appuser, { model: strapi.models.appuser })

    let script = user && user.script
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
