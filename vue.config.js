const GitRevisionPlugin = require('git-revision-webpack-plugin');

module.exports = {
  pages: {
    popup: {
      template: 'public/browser-extension.html',
      entry: './src/popup/main.ts',
      title: 'Popup',
    },
  },
  pluginOptions: {
    browserExtension: {
      componentOptions: {
        background: {
          entry: 'src/background.ts',
        },
        contentScripts: {
          entries: {
            'content-script': ['src/content-scripts/content-script.ts'],
          },
        },
      },
    },
  },
  productionSourceMap: false,
  configureWebpack: (config) => {
    // return config;
    config.plugins.unshift(new GitRevisionPlugin());
    // return config;
  },
};
