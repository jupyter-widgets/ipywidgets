module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'karma-typescript'],
    reporters: ['mocha', , 'karma-typescript', 'coverage'],
    files: ['test/*.ts', 'src/*.ts'],
    preprocessors: {
      '**/*.ts': 'karma-typescript'
    },
    mime: {
      'text/x-typescript': ['ts']
    },
    port: 9876,
    colors: true,
    singleRun: true,
    logLevel: config.LOG_INFO,
    browserNoActivityTimeout: 30000,
    coverageReporter: {
      reporters : [
        { 'type': 'text' },
        { 'type': 'lcov', dir: 'test/coverage' },
        { 'type': 'html', dir: 'test/coverage' }
      ]
    },
    karmaTypescriptConfig: {
      compilerOptions: {
        declaration: true,
        lib: ['dom', 'es5', 'es2015.promise', 'es2015.iterable'],
        types: [],
        noEmitOnError: true,
        module: 'commonjs',
        target: 'ES6',
      }
    }
  });
};
