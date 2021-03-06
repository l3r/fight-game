// Karma configuration
// Generated on Tue Jan 06 2015 08:53:47 GMT+0200 (FLE Standard Time)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'browserify'],


    // list of files / patterns to load in the browser
    files: [
        'tests/phantomjs-polyfills.js',
        'node_modules/socket.io/lib/socket.js',
        'public/js/socket.io-1.2.0.js',
        'public/js/jquery-1.11.2.min.js',
        'tests/client/**/*.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    browserify: {
        debug: true
    },

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        'node_modules/socket.io/lib/socket.js': ['browserify'],
        'tests/client/**/*.js': ['browserify']
    },

    proxies: {
        '/img/': 'http://localhost:3000/img/'
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


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
    singleRun: false
  });
};
