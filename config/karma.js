'use strict'

// Karma configuration
// Generated on Wed Mar 16 2016 09:44:59 GMT+0800 (中国标准时间)
var webpackConfig = require('./webpack')

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [

      './node_modules/phantomjs-polyfill/bind-polyfill.js',
      {
        pattern: './tests/**/*.spec.js',
        watched: false,
        served: true,
        included: true
      }

    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {

      './tests/**/*.spec.js' : ['webpack', 'sourcemap','coverage']

    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter

    reporters: ['progress','coverage'],



    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher

    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits

    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    webpack: {
        // karma watches the test entry points
        // (you don't need to specify the entry option)
        // webpack watches dependencies
      devtool: 'inline-source-map',
      resolve: webpackConfig.resolve,
      plugins: webpackConfig.plugins,
      module: {
        preLoaders: [{
          test: /\.js$/,
          loader: 'isparta',
          exclude: /node_modules|tests/
        }],
        loaders: [{
          test: /\.handlebars$/,
          loader: 'handlebars'
        }, {
          test: /\.html$/,
          loader: 'html'
        }, {
          test: /\.gif$/,
          loader: 'url?limit=8192'
        }]
      }
        // webpack configuration
    },
    coverageReporter: {
      reporters: [
        { type : 'text-summary' },
        { type : 'lcov', dir : 'coverage' }
      ]

    },
    webpackMiddleware: {
      // webpack-dev-middleware configuration
      // i. e.
      noInfo: true
    }
  })
}
