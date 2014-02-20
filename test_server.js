var express = require('express');

module.exports.createCorsEnabledServer = function(allowedOrigin) {
  var app = express();
  var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', allowedOrigin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, X-Requested-With');
    if ('OPTIONS' === req.method) {
      return res.send(200);
    } else {
      return next();
    }
  };
  app.configure(function() {
    app.use(allowCrossDomain);
  });
  app.get('/', index);
  app.post('/post', index);
  return app;
}

module.exports.createCorsDisabledServer = function() {
  var app = express();
  app.get('/', index);
  return app;
}

function index(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  res.write('SUCCESS');
  return res.end();
}
