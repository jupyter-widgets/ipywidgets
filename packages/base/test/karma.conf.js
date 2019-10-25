const webpackConfig = require("./webpack.conf");

delete webpackConfig.entry;

module.exports = function (config) {
  config.set({
    basePath: '..',
    frameworks: ['mocha'],
    reporters: ['mocha'],
    files: [
        "test/src/index.ts",
    ],
    preprocessors: {
      "test/src/index.ts": ["webpack"],
    },
    mime: {
      "text/x-typescript": ["ts", "tsx"],
    },
    port: 9876,
    colors: true,
    singleRun: true,
    logLevel: config.LOG_INFO,
    browserNoActivityTimeout: 30000,
    webpack: webpackConfig,
  });
};
