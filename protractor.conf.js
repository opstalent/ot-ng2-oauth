exports.config = {
  baseUrl: 'http://localhost:9876/debug.html',

  specs: [
    'src/**/*.e2e-spec.js'
  ],
  exclude: [],

  framework: 'jasmine2',

  allScriptsTimeout: 110000,

  jasmineNodeOpts: {
    showTiming: true,
    showColors: true,
    isVerbose: false,
    includeStackTrace: false,
    defaultTimeoutInterval: 400000
  },
  directConnect: true,

  capabilities: {
    'browserName': 'chrome'
  },

  onPrepare: function () {
    var SpecReporter = require('jasmine-spec-reporter');
    jasmine.getEnv().addReporter(new SpecReporter({displayStacktrace: true}));
    browser.ignoreSynchronization = true;
  },
  useAllAngular2AppRoots: true
};
