const i18next = require('i18next')
const en = require('./en/translation.json')
const pt = require('./pt/translation.json')

let fixedEn
let fixedPt

i18next.init({
  lng: 'en',
  resources: {
    en: {
      translation: en
    },
    pt: {
      translation: pt
    }
  }
}, (err, t) => {
  if(err) {
    console.warn(err)
  } else {
    fixedEn = i18next.getFixedT('en')
    fixedPt = i18next.getFixedT('pt')
  }
})

module.exports = {
  getTranslationByLang(lang, key, options){
    if(!fixedEn && !fixedPt){
      return
    }
    
    if(lang === 'pt') {
      return fixedPt(key, options)
    } else {
      return fixedEn(key, options)
    }
  }
}
