/* eslint-disable no-unused-vars */
module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],

  chainWebpack: (config) => {
    config.plugin('VuetifyLoaderPlugin').tap(args => [{
      match(originalTag, { kebabTag, camelTag, path, component }) {
        if (kebabTag.startsWith('core-')) {
          return [camelTag, `import ${camelTag} from '@/components/core/${camelTag.substring(4)}.vue'`]
        }
      }
    }])
    config
      .plugin('html')
      .tap((args) => {
        args[0].title = 'jskara-web';
        return args;
      });
  },


  configureWebpack: {
    devtool: 'source-map',
  },

  pluginOptions: {
    i18n: {
      locale: 'de',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: true,
      whitelist: ['en', 'de']
    }
  },

  publicPath: process.env.NODE_ENV === 'production'
    ? '/jskara-web/'
    : '/'
}
