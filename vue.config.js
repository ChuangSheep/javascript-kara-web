//const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')

module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],

  chainWebpack: (config) => {
    config
      .plugin('html')
      .tap((args) => {
        args[0].title = 'jskara-web';
        return args;
      });
  },

  configureWebpack: {
    devtool: 'source-map',
    plugins: [
      //new VuetifyLoaderPlugin()
    ],
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
