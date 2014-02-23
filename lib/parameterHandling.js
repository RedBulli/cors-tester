module.exports = {
  getDefaultedCallback: getDefaultedCallback,
  getDefaultedConfig: getDefaultedConfig
};

function getDefaultedCallback(callback) {
  if (callback) {
    assertCallbackIsAFunction(callback);
    return callback;
  } else {
    return function(){};
  }
}

function getDefaultedConfig(configParam) {
  var defaultConfigs = require('./defaultConfig.js');
  assertConfigIsAStringOrAnObject(configParam);
  if (!configParam) {
    throw new Error('No URL or config given!');
  }
  var config = {};
  if (typeof configParam == 'string') {
    config.url = configParam;
    config.port = defaultConfigs.port;
    config.method = defaultConfigs.method;
  } else {
    if (!configParam.url) {
      throw new Error('Config object must have key "url"!');
    }
    config.url = configParam.url;
    config.method = configParam.method || defaultConfigs.method;
    config.port = configParam.port || defaultConfigs.port;
  }
  return config;
}

function assertCallbackIsAFunction(callback) {
  var type = typeof callback;
  if (type !== 'function') {
    throw new TypeError('Second (callback) parameter has to be a function');
  }
}

function assertConfigIsAStringOrAnObject(configParam) {
  var type = typeof configParam;
  if (type !== 'object' && type !== 'string') {
    throw new TypeError('First (url||config) parameter has to be a string or an object');
  }
}