'use strict';

const path = require('path');

const webpackConfig = require('./build/webpack.base.conf');

const isProduction = process.env.NODE_ENV === 'production'; // 生产环境

const isDevelopment = process.env.NODE_ENV === 'development'; // 开发环境

const resolve = dir => path.join(__dirname, dir);

module.exports = {
  lintOnSave: true, // eslint-loader 是否在保存的时候检查
  devServer: {
    // port: 9527,
    // open: true,
    // overlay: {
    //   warnings: false,
    //   errors: true
    // }
    // proxy: {}
  },
  configureWebpack: () => {
    return webpackConfig;
  },
  chainWebpack(config) {
    config.entry('index').add('babel-polyfill');
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end();
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/assets'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end();

    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap(options => {
        options.compilerOptions.preserveWhitespace = true;
        return options;
      })
      .end();

    config.module.rule();

    config.when(isDevelopment, config => config.devtool('cheap-source-map'));

    config.when(isProduction, config => {
      config
        .plugin('ScriptExtHtmlWebpackPlugin')
        .after('html')
        .use('script-ext-html-webpack-plugin', [
          {
            inline: /runtime\..*\.js$/
          }
        ])
        .end();
      config.optimization.splitChunks({
        chunks: 'all',
        cacheGroups: {
          libs: {
            name: 'chunk-libs',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial' // only package third parties that are initially dependent
          },
          elementUI: {
            name: 'chunk-elementUI', // split elementUI into a single package
            priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
            test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
          },
          commons: {
            name: 'chunk-commons',
            test: resolve('src/components'), // can customize your rules
            minChunks: 3, //  minimum common number
            priority: 5,
            reuseExistingChunk: true
          }
        }
      });
      config.optimization.runtimeChunk('single');
    });
  }
};
