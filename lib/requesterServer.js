module.exports.createServer = function(port) {
  var http = require('http')
    , fs = require('fs')
    , path = require('path')
    , index = fs.readFileSync(path.join(__dirname,'html', 'cors.html'));

  return server = http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(index);
  }).listen(port);
};
