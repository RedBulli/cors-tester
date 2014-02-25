var returnObjectLib = require('./lib/returnObject')
  , parameterHandling = require('./lib/parameterHandling');

module.exports.simpleTest = function(configParam, callbackParam) {
  var config = parameterHandling.getDefaultedConfig(configParam);
  var callback = parameterHandling.getCallback(callbackParam);
  makeRequest(configParam, function(retval) {
    var simpleRetVal = returnObjectLib.convertToSimpleReturnValue(retval);
    callbackParam(simpleRetVal);
  });
};

module.exports.makeCorsRequest = function(configParam, callbackParam) {
  var config = parameterHandling.getDefaultedConfig(configParam);
  var callback = parameterHandling.getCallback(callbackParam);
  makeRequest(config, callback);
};


function makeRequest(config, callback) {
  var phantom = require('node-phantom-simple');
  var params = {
    phantomPath: require('phantomjs').path
  };
  phantom.create(create, params);

  function create(err, ph) {
    if (err) {
      callback(err);
    } else {
      singleTest(ph, config, function(networkEvents) {
        ph.exit();
        var returnObject = returnObjectLib.getReturnObjectFromXhrNetworkEvents(config.url, networkEvents);
        callback(returnObject);
      });
    }
  }
}

function singleTest(ph, config, callback) {
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