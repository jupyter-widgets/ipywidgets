module.exports = function (config) {
  var cfg = {
    basePath: '..',
    frameworks: ['mocha'],
    reporters: ['mocha'],
    files: ['test/build/bundle.js'],
    port: 9876,
    colors: true,
    singleRun: true,
    logLevel: config.LOG_INFO,
    browsers: ['Chrome'],
    customLaunchers: {
        Chrome_travis_ci: {
            base: 'Chrome',
            flags: ['--no-sandbox']
        }
    },
  }

  if (process.env.TRAVIS) {
      cfg.browsers = ['Chrome_travis_ci'];
  }

  config.set(cfg);
};
