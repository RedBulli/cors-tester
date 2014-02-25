cors-tester
===========
**cors-tester** is used for testing [CORS](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing)-request to a server. Makes a XHR request to a specified endpoint. Whole process takes about 2 seconds.

##Getting started
###Download cors-tester
`npm install cors-tester`

###Using cors-tester
```javascript
var corsTesterLib = require('cors-tester');
//Full return values, with errors and responses
corsTesterLib.makeCorsRequest('http://localhost:9000', function(returnValue) {
  console.log(returnValue);
});

//OR a very simplified response
corsTesterLib.simpleTest('http://localhost:9000', function(returnValue) {
  console.log(returnValue);
});

// The first parameter can also be an object with the following variables
var config = {
  port: 4447,
  url: 'http://localhost:9000',
  method: 'POST'
};
corsTesterLib.simpleTest(config, function(returnValue) {
  console.log(returnValue);
});
```

##How it works
1. Setups a node.js http-server that serves a single html file
2. The file is opened by [Phantom.js](http://phantomjs.org/) browser with url-parameters
3. The html contains a script that makes a XHR-request to an url specified in the url-parameters
4. The application catches XHR-requests and responses and delivers them to the user


##Testing
`npm test`
