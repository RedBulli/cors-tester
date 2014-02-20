module.exports.singleTest = function(testServerPort, testUrl, testMethod) {
  //var testUrl = 'http://localhost:5000/users/me';
  //var testMethod = 'GET'
  var server = createServer(testServerPort);

  var phantom = require('phantom');

  phantom.create(function(ph) {
    return ph.createPage(function(page) {
      var serverHost = 'http://localhost:' + testServerPort;
      return page.open(serverHost + '/?url=' + testUrl + '&method=' + testMethod, function(status) {
        if (status == 'success') {
          return page.evaluate(
            (evaluatePage), 
            function(result) {
              handlePageResult(result)
              ph.exit();
              server.close();
            }
          );
        } else {
          ph.exit();
          server.close();
          throw new Error('Cannot connect to the CORS-testserver.');
        }
      });
    });
  });

  function createServer(port) {
    var http = require('http');
    var fs = require('fs');
    var index = fs.readFileSync('cors.html');

    return server = http.createServer(function (req, res) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(index);
    }).listen(port);
  }

  function handlePageResult(result) {
    console.log(result);
  }

  function evaluatePage() {
    var error = document.getElementById('error').innerHTML;
    if (error && error.length > 0) {
      return {error: error};
    }
    else {
      return {
        status: document.getElementById('status').innerHTML,
        response: document.getElementById('response').innerHTML
      };
    }
  }
}
