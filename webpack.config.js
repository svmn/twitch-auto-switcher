const path = require('path'),
  webpack = require('webpack'),
  MiniCssExtractPlugin = require('mini-css-extract-plugin'),
  CopyWebpackPlugin = require('copy-webpack-plugin'),
  ChromeExtensionReloader = require('webpack-chrome-extension-reloader'),
  dir_js = path.resolve(__dirname, 'src/scripts'),
  dir_build = path.resolve(__dirname, 'dist');

module.exports = {
  entry: {
    background: path.resolve(dir_js, 'background.js'),
    contentscript: path.resolve(dir_js, 'contentscript.js'),
    popup: path.resolve(dir_js, 'popup.js'),
  },
  output: {
    path: dir_build,
    filename: 'scripts/[name].js',
  },
  resolve: {
    modules: ['node_modules', dir_js],
    alias: {
      vue$: 'vue/dist/vue.common.js',
    },
  },
  devtool: 'inline-source-map',
  stats: {
    colors: true,
    chunkModules: false,
  },
  mode: 'development',
  plugins: [
    new MiniCssExtractPlugin({ filename: '[name].css' }),
    new CopyWebpackPlugin([{ from: 'src/manifest.json' }, { from: 'src/images', to: 'images' }]),
    new ChromeExtensionReloader({
      port: 9090, // Which port use to create the server
      reloadPage: true, // Force the reload of the page also
      entries: {
        //The entries used for the content/background scripts
        contentScript: 'contentscript', //Use the entry names, not the file name or the path
        background: 'background',
        popup: 'popup',
      },
    }),
    new webpack.NoEmitOnErrorsPlugin(),
  ],
  module: {
    rules: [
      // {
      //   test: /\.js$/,
      //   exclude: /node_modules/,
      //   use: {
      //     loader: 'babel-loader',
      //     options: {
      //       presets: ['@babel/preset-env'],
      //     },
      //   },
      // },
      {
        test: /\.less$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader'],
      },
      {
        test: /\.html$/,
        loader: 'file-loader',
        options: {
          name: '[name].html',
        },
      },
    ],
  },
};
