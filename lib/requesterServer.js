module.exports.createServer = function(port) {
  var http = require('http');
  var fs = require('fs');
  var index = fs.readFileSync('cors.html');

  return server = http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(index);
  }).listen(port);
};
