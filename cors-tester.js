module.exports.runOnce = function(configParam, callbackParam) {
  var parameterHandling = require('./lib/parameterHandling');
  var config = parameterHandling.getDefaultedConfig(configParam);
  var callback = parameterHandling.getDefaultedCallback(callbackParam);
  var phantom = require('node-phantom-simple');
  var params = {
    phantomPath: require('phantomjs').path
  };
  phantom.create(create, params);
  function create(err, ph) {
    if (err) {
      throw new Error(err);
    }
    var singleTest = initialize(ph, config);
    singleTest(function(networkEvents) {
      ph.exit();
      var returnObject = require('./lib/returnObject').getReturnObjectFromXhrNetworkEvents(config.url, networkEvents);
      callback(returnObject);
    });
  } 
}

function initialize(ph, config) {

  function singleTest(callback) {
    var serverHost = 'http://localhost:' + config.port;
    var url = serverHost + '/?url=' + config.url + '&method=' + config.method;
    var server = require('./lib/requesterServer').createServer(config.port);
    var networkEvents = {
      requests: [],
      responses: [],
      errors: [],
      timeouts: []
    };
    ph.createPage(openPage);

    function openPage(err, page) {
      page.open(url);

      page.onResourceError = function(resourceError) {
        networkEvents.errors.push(resourceError);
      };
      page.onResourceRequested = function(requestData, networkRequest) {
        networkEvents.requests.push(requestData);
      };

      page.onResourceReceived = function(response) {
        networkEvents.responses.push(response);
      };

      page.onLoadFinished = function(status) {
        server.close();
        callback(networkEvents);
      };
    }
  }

  return singleTest;
}
