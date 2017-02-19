const path = require('path'),
  webpack = require('webpack'),
  ExtractTextPlugin = require('extract-text-webpack-plugin'),
  CopyWebpackPlugin = require("copy-webpack-plugin"),
  dir_js = path.resolve(__dirname, 'src/scripts'),
  dir_build = path.resolve(__dirname, 'dist');

module.exports = {
  entry: {
    background : path.resolve(dir_js, 'background.js'),
    contentscript : path.resolve(dir_js, 'contentscript.js'),
    popup : path.resolve(dir_js, 'popup.js')
  },
  output: {
    path: dir_build,
    filename: 'scripts/[name].js'
  },
  resolve: {
    modules: ['node_modules', dir_js],
    alias: {
      'vue$': 'vue/dist/vue.common.js'
    }
  },
  devtool: 'inline-source-map',
  stats: {
    colors: true,
    chunkModules: false
  },
  plugins: [
    new ExtractTextPlugin('[name].css'),
    new CopyWebpackPlugin([
      { from: 'src/manifest.json' },
      { from: 'src/images', to: 'images' }
    ]),
    new webpack.NoEmitOnErrorsPlugin()
  ],

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'less-loader']
        })
      },
      {
        test: /\.html$/,
        loader: 'file-loader',
        query: {
          name: '[name].html'
        }
      }
    ]
  }
};
