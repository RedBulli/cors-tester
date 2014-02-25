var config = {
  corsDisabledServerPort: 4002,
  corsEnabledServerPort: 4003,
  corsRequesterPort: 4006,
  timeout: 10000
};

config.corsEnabledURL = 'http://localhost:' + config.corsEnabledServerPort + '/';
config.corsDisabledURL = 'http://localhost:' + config.corsDisabledServerPort + '/';

var chai = require('chai')
  , should = chai.should()
  , expect = chai.expect
  , serverApp = require('./test_server')
  , corsTester = require('./../cors-tester');

function createCorsEnabledServer(allowedOrigin) {
  return serverApp
      .createCorsEnabledServer(allowedOrigin)
      .listen(config.corsEnabledServerPort);
}

function createCorsDisabledServer() {
  return serverApp
      .createCorsDisabledServer()
      .listen(config.corsDisabledServerPort);
}

describe('CORS-tester', function() {
  this.timeout(config.timeout);

  describe('config', function() {
    describe('invalids', function() {
      it('should throw Error if no parameters are given', function() {
        expect(corsTester.makeCorsRequest).to.throw(Error);
      });

      it('should throw TypeError if the first parameter is an int', function() {
        var fn = function() {
          corsTester.makeCorsRequest(1);
        };
        expect(fn).to.throw(TypeError);
      });

      it('should throw TypeError if config parameter is a function', function() {
        var fn = function() {
          corsTester.makeCorsRequest(function(){});
        };
        expect(fn).to.throw(TypeError);
      });

      it('should throw TypeError if callback parameter is not a function', function() {
        var fn = function() {
          corsTester.makeCorsRequest('http://localhost:9000', 'http://localhost:9000');
        };
        expect(fn).to.throw(TypeError);
      });

      it('should throw Error if config object doesnt have a url', function() {
        var fn = function() {
          corsTester.makeCorsRequest({method: 'GET', port: 4004}, function() {});
        };
        expect(fn).to.throw(Error);
      });

      it('should return an error if the url is malformed', function(done) {
        corsTester.makeCorsRequest('http://localhost:999999999', function(returnValue) {
          returnValue.error.errorString.should.equal('No XHR requests made. This is most likely due to malformed URL');
          done();
        });
      });

      it('should return an error if the host doesnt exist', function(done) {
        corsTester.makeCorsRequest('http://l:9999/?id=ddd', function(returnValue) {
          returnValue.error.errorCode.should.equal(3);
          returnValue.error.errorString.should.equal('Host l not found');
          done();
        });
      });

    });

  });

  describe('cors disabled', function() {
    var corsDisabledServer;

    before(function() {
      corsDisabledServer = createCorsDisabledServer();
    });

    after(function() {
      corsDisabledServer.close();
    });

    it('should fail cors requests', function(done) {
      var testConfig = {
        port: config.corsRequesterPort,
        url: config.corsDisabledURL,
        method: 'GET'
      };
      corsTester.makeCorsRequest(testConfig, function(returnValue) {
        returnValue.error.errorString.should.equal('Operation canceled');
        returnValue.error.errorCode.should.equal(5);
        done();
      });
    });

  });

  describe('cors enabled with a *', function() {
    var corsEnabledServer;

    before(function() {
      corsEnabledServer = createCorsEnabledServer('*');
    });

    after(function() {
      corsEnabledServer.close();
    });

    it('should work with only an url given', function(done) {
      var testConfig = {
        port: config.corsRequesterPort,
        url: config.corsEnabledURL,
        method: 'GET'
      };
      corsTester.makeCorsRequest(config.corsEnabledURL, function(returnValue) {
        returnValue.response.status.should.equal(200);
        returnValue.success.should.equal('Success');
        done();
      });
    });

    it('should pass cors requests', function(done) {
      var testConfig = {
        port: config.corsRequesterPort,
        url: config.corsEnabledURL,
        method: 'GET'
      };
      corsTester.makeCorsRequest(testConfig, function(returnValue) {
        returnValue.response.status.should.equal(200);
        returnValue.success.should.equal('Success');
        done();
      });
    });

    it('should return 404 if xhr returns 404', function(done) {
      var testConfig = {
        port: config.corsRequesterPort,
        url: config.corsEnabledURL + 'notfound404',
        method: 'GET'
      };
      corsTester.makeCorsRequest(testConfig, function(returnValue) {
        returnValue.response.status.should.equal(404);
        returnValue.error.errorString.should.equal(
          'Error downloading http://localhost:' + config.corsEnabledServerPort + '/notfound404 - server replied: Not Found'
        );
        done();
      });
    });

    it('should pass the correct http method', function(done) {
      var testConfig = {
        port: config.corsRequesterPort,
        url: config.corsEnabledURL + 'post',
        method: 'POST'
      };
      corsTester.makeCorsRequest(testConfig, function(returnValue) {
        returnValue.response.status.should.equal(200);
        returnValue.success.should.equal('Success');
        done();
      });
    });

  });

  describe('cors enabled without a wilcard', function() {
    var corsEnabledServer;
    var allowedOrigin = 'http://localhost:' + config.corsRequesterPort;

    before(function() {
      corsEnabledServer = createCorsEnabledServer(allowedOrigin);
    });

    after(function() {
      corsEnabledServer.close();
    });

    it('should pass cors requests from allowedOrigin', function(done) {
      var testConfig = {
        port: config.corsRequesterPort,
        url: config.corsEnabledURL,
        method: 'GET'
      };
      corsTester.makeCorsRequest(testConfig, function(returnValue) {
        returnValue.success.should.equal('Success');
        done();
      });
    });

    it('should fail cors requests from non allowedOrigin', function(done) {
      var testConfig = {
        port: config.corsRequesterPort+1,
        url: config.corsEnabledURL,
        method: 'GET'
      };
      corsTester.makeCorsRequest(testConfig, function(returnValue) {
        returnValue.error.errorString.should.equal('Operation canceled');
        returnValue.error.errorCode.should.equal(5);
        done();
      });
    });
  });

  describe('simpleTest', function() {
    var corsEnabledServer;
    var allowedOrigin = 'http://localhost:' + config.corsRequesterPort;

    before(function() {
      corsEnabledServer = createCorsEnabledServer(allowedOrigin);
    });

    after(function() {
      corsEnabledServer.close();
    });

    it('should return success when cors passed', function(done) {
      var testConfig = {
        port: config.corsRequesterPort,
        url: config.corsEnabledURL,
        method: 'GET'
      };
      corsTester.simpleTest(testConfig, function(returnValue) {
        returnValue.should.equal('Success!');
        done();
      });
    });

    it('should fail cors requests from non allowedOrigin', function(done) {
      var testConfig = {
        port: config.corsRequesterPort+1,
        url: config.corsEnabledURL,
        method: 'GET'
      };
      corsTester.simpleTest(testConfig, function(returnValue) {
        returnValue.should.equal('Cors not allowed!');
        done();
      });
    });

    it('should return 404 message if not found', function(done) {
      var testConfig = {
        port: config.corsRequesterPort,
        url: config.corsEnabledURL + 'notfound404',
        method: 'GET'
      };
      corsTester.simpleTest(testConfig, function(returnValue) {
        returnValue.should.equal(
          'Error downloading http://localhost:' + config.corsEnabledServerPort + '/notfound404 - server replied: Not Found'
        );
        done();
      });
    });
  });

  describe('simpleTest with only url parameter', function() {
    var corsEnabledServer;

    before(function() {
      corsEnabledServer = createCorsEnabledServer('*');
    });

    after(function() {
      corsEnabledServer.close();
    });

    it('should return success when cors passed', function(done) {
      corsTester.simpleTest(config.corsEnabledURL, function(returnValue) {
        returnValue.should.equal('Success!');
        done();
      });
    });
  });

});
