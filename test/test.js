var config = {
  corsDisabledServerPort: 4002,
  corsEnabledServerPort: 4003,
  corsRequesterPort: 4006,
  timeout: 10000
};

var chai = require('chai')
  , should = chai.should()
  , expect = chai.expect
  , serverApp = require('./test_server')
  , cors_tester_lib = require('./../cors-tester');

describe('CORS-tester', function() {
  this.timeout(config.timeout);

  describe('config', function() {
    describe('invalids', function() {
      it('should throw Error if no parameters are given', function() {
        expect(cors_tester_lib.runOnce).to.throw(Error);
      });

      it('should throw TypeError if the first parameter is an int', function() {
        var fn = function() {
          cors_tester_lib.runOnce(1);
        };
        expect(fn).to.throw(TypeError);
      });

      it('should throw TypeError if config parameter is a function', function() {
        var fn = function() {
          cors_tester_lib.runOnce(function(){});
        };
        expect(fn).to.throw(TypeError);
      });

      it('should throw TypeError if callback parameter is not a function', function() {
        var fn = function() {
          cors_tester_lib.runOnce('http://localhost:9000', 'http://localhost:9000');
        };
        expect(fn).to.throw(TypeError);
      });

      it('should throw Error if config object doesnt have a url', function() {
        var fn = function() {
          cors_tester_lib.runOnce({method: 'GET', port: 4004}, function() {});
        };
        expect(fn).to.throw(Error);
      });

      it('should return an error if the url is malformed', function(done) {
        cors_tester_lib.runOnce('http://localhost:999999999', function(retval) {
          should.not.exist(retval.error.errorCode);
          retval.error.errorString.should.equal('No XHR requests made. This is most likely due to malformed URL');
          done();
        });
      });

      it('should return an error if the host doesnt exist', function(done) {
        cors_tester_lib.runOnce('http://l:9999/?id=ddd', function(retval) {
          retval.error.errorCode.should.equal(3);
          retval.error.errorString.should.equal('Host l not found');
          done();
        });
      });

    });

  });

  describe('cors disabled', function() {
    var corsDisabledServer;
    var corsDisabledURL = 'http://localhost:' + config.corsDisabledServerPort + '/';

    before(function() {
      corsDisabledServer = serverApp
        .createCorsDisabledServer()
        .listen(config.corsDisabledServerPort);
    });

    after(function() {
      corsDisabledServer.close();
    });

    it('should fail cors requests', function(done) {
      var testConfig = {
        port: config.corsRequesterPort,
        url: corsDisabledURL,
        method: 'GET'
      };
      cors_tester_lib.runOnce(testConfig, function(retval) {
        retval.error.errorString.should.equal('Operation canceled');
        retval.error.errorCode.should.equal(5);
        done();
      });
    });

  });

  describe('cors enabled with a *', function() {
    var corsEnabledServer;
    var corsEnabledURL = 'http://localhost:' + config.corsEnabledServerPort + '/';
    var allowedOrigin = '*';

    before(function() {
      corsEnabledServer = serverApp
        .createCorsEnabledServer(allowedOrigin)
        .listen(config.corsEnabledServerPort);
    });

    after(function() {
      corsEnabledServer.close();
    });

    it('should work with only an url given', function(done) {
      var testConfig = {
        port: config.corsRequesterPort,
        url: corsEnabledURL,
        method: 'GET'
      };
      cors_tester_lib.runOnce(corsEnabledURL, function(retval) {
        retval.success.should.equal('Success');
        done();
      });
    });

    it('should pass cors requests', function(done) {
      var testConfig = {
        port: config.corsRequesterPort,
        url: corsEnabledURL,
        method: 'GET'
      };
      cors_tester_lib.runOnce(testConfig, function(retval) {
        retval.success.should.equal('Success');
        done();
      });
    });

    it('should return 404 if xhr returns 404', function(done) {
      var testConfig = {
        port: config.corsRequesterPort,
        url: corsEnabledURL + 'notfound404',
        method: 'GET'
      };
      cors_tester_lib.runOnce(testConfig, function(retval) {
        retval.error.errorCode.should.equal(203);
        retval.error.errorString.should.equal('Error downloading http://localhost:4003/notfound404 - server replied: Not Found');
        done();
      });
    });

    it('should pass the correct http method', function(done) {
      var testConfig = {
        port: config.corsRequesterPort,
        url: corsEnabledURL + 'post',
        method: 'POST'
      };
      cors_tester_lib.runOnce(testConfig, function(retval) {
        retval.success.should.equal('Success');
        done();
      });
    });
  });

  describe('cors enabled without a wilcard', function() {
    var corsEnabledServer;
    var corsEnabledURL = 'http://localhost:' + config.corsEnabledServerPort + '/';
    var allowedOrigin = 'http://localhost:' + config.corsRequesterPort;

    before(function() {
      corsEnabledServer = serverApp
        .createCorsEnabledServer(allowedOrigin)
        .listen(config.corsEnabledServerPort);
    });

    after(function() {
      corsEnabledServer.close();
    });

    it('should pass cors requests from allowedOrigin', function(done) {
      var testConfig = {
        port: config.corsRequesterPort,
        url: corsEnabledURL,
        method: 'GET'
      };
      cors_tester_lib.runOnce(testConfig, function(retval) {
        retval.success.should.equal('Success');
        done();
      });
    });

    it('should fail cors requests from non allowedOrigin', function(done) {
      var testConfig = {
        port: config.corsRequesterPort+1,
        url: corsEnabledURL,
        method: 'GET'
      };
      cors_tester_lib.runOnce(testConfig, function(retval) {
        retval.error.errorString.should.equal('Operation canceled');
        retval.error.errorCode.should.equal(5);
        done();
      });
    });

  });

});
