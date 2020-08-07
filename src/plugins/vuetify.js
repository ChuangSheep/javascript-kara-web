import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import '@fortawesome/fontawesome-free/css/all.css'

import en from 'vuetify/es5/locale/en'
import de from 'vuetify/es5/locale/de'


Vue.use(Vuetify);
const opts = {
  lang: {
    locales: { en, de },
    current: localStorage.getItem("userLang") || navigator.language.split('-')[0],
  },
  icons: {
    iconfont: 'fa',
  },
};

export default new Vuetify(opts);
