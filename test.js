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
  , cors_tester_lib = require('./cors-tester');

describe('CORS-tester', function() {
  this.timeout(config.timeout);
  var cors_tester;
  before(function(done) {
    cors_tester_lib.init(function(tester) {
      cors_tester = tester;
      done();
    });
  });

  after(function() {
    cors_tester.close();
  });

  describe('config', function() {
    describe('invalids', function() {
      it('should throw Error if no parameters are given', function() {
        expect(cors_tester.singleTest).to.throw(Error);
      });

      it('should throw TypeError if the first parameter is an int', function() {
        var fn = function() {
          cors_tester.singleTest(1);
        };
        expect(fn).to.throw(TypeError);
      });

      it('should throw TypeError if config parameter is a function', function() {
        var fn = function() {
          cors_tester.singleTest(function(){});
        };
        expect(cors_tester.singleTest).to.throw(TypeError);
      });

      it('should throw TypeError if callback parameter is not a function', function() {
        var fn = function() {
          cors_tester.singleTest('http://localhost:9000', 'http://localhost:9000');
        };
        expect(cors_tester.singleTest).to.throw(TypeError);
      });

      it('should throw Error if config object doesnt have a url', function() {
        var fn = function() {
          cors_tester.singleTest({method: 'GET', port: 4004}, function() {});
        };
        expect(cors_tester.singleTest).to.throw(Error);
      });

/*      it('should return a htmlerror if no document is found', function() {
        cors_tester.singleTest('http://localhost:99999', function(retval) {
          retval.should.have.property('htmlerror');
        });
      });*/

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
      cors_tester.singleTest(testConfig, function(retval) {
        retval.statusCode.should.equal('0');
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
      cors_tester.singleTest(corsEnabledURL, function(retval) {
        retval.statusCode.should.equal('200');
        done();
      });
    });

    it('should pass cors requests', function(done) {
      var testConfig = {
        port: config.corsRequesterPort,
        url: corsEnabledURL,
        method: 'GET'
      };
      cors_tester.singleTest(testConfig, function(retval) {
        retval.statusCode.should.equal('200');
        done();
      });
    });

    it('should return 404 if xhr returns 404', function(done) {
      var testConfig = {
        port: config.corsRequesterPort,
        url: corsEnabledURL + 'notfound404',
        method: 'GET'
      };
      cors_tester.singleTest(testConfig, function(retval) {
        retval.statusCode.should.equal('404');
        done();
      });
    });

    it('should pass the correct http method', function(done) {
      var testConfig = {
        port: config.corsRequesterPort,
        url: corsEnabledURL + 'post',
        method: 'POST'
      };
      cors_tester.singleTest(testConfig, function(retval) {
        retval.statusCode.should.equal('200');
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
      cors_tester.singleTest(testConfig, function(retval) {
        retval.statusCode.should.equal('200');
        done();
      });
    });

    it('should fail cors requests from non allowedOrigin', function(done) {
      var testConfig = {
        port: config.corsRequesterPort+1,
        url: corsEnabledURL,
        method: 'GET'
      };
      cors_tester.singleTest(testConfig, function(retval) {
        retval.statusCode.should.equal('0');
        done();
      });
    });

  });

});
