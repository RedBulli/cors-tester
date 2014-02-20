var defaultConfigs = {
  method: 'GET',
  port: 4000
};

module.exports.init = function(callback) {
  var phantom = require('phantom');
  phantom.create(function(ph) {
    callback(initialize(ph));
  });
}

function initialize(ph) {
  
  function close() {
    ph.exit();
  }

  function getDefaultedConfig(configParam) {
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

  function getDefaultedCallback(callback) {
    if (callback) {
      assertCallbackIsAFunction(callback);
      return callback;
    } else {
      return function(){};
    }
  }

  function assertConfigIsAStringOrAnObject(configParam) {
    var type = typeof configParam;
    if (type !== 'object' && type !== 'string') {
      throw new TypeError('First (url||config) parameter has to be a string or an object');
    }
  }

  function assertCallbackIsAFunction(callback) {
    var type = typeof callback;
    if (type !== 'function') {
      throw new TypeError('Second (callback) parameter has to be a function');
    }
  }

  function singleTest(configParam, callbackParam) {
    var config = getDefaultedConfig(configParam);
    var callback = getDefaultedCallback(callbackParam);
    var serverHost = 'http://localhost:' + config.port;
    var url = serverHost + '/?url=' + config.url + '&method=' + config.method;
    
    var server = createServer();
    ph.createPage(openPage);

    function openPage(page) {
      page.open(url, processPage);
      function processPage(status) {
        server.close();
        if (status == 'success') {
          return page.evaluate(
            (evaluatePage),
            function(result) {
              callback(result);
            }
          );
        } else {
          throw new Error('Cannot connect to the CORS-testserver.');
        }
      }
    }

    function createServer() {
      var http = require('http');
      var fs = require('fs');
      var index = fs.readFileSync('cors.html');

      return server = http.createServer(function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(index);
      }).listen(config.port);
    }

    function evaluatePage() {
      if (document.getElementById('error') === null) {
        return {htmlerror: 'Failed to load HTML'};
      }
      var error = document.getElementById('error').innerHTML;
      if (error && error.length > 0) {
        return {
          error: error,
          statusCode: document.getElementById('statusCode').innerHTML
        };
      }
      else {
        return {
          statusCode: document.getElementById('statusCode').innerHTML,
          response: document.getElementById('response').innerHTML
        };
      }
    }
  }

  return {
    singleTest: singleTest,
    close: close
  }
}
