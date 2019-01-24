/*
 * Copyright 2019 -  Universidad Politécnica de Madrid.
 *
 * This file is part of Keyrock
 *
 */

'use strict';

process.env.IDM_DB_PASS = 'test';
process.env.IDM_DB_USER = 'root';

var keyrock = require('../../bin/www'),
  config = require('../../config.js'),
  nock = require('nock'),
  should = require('should'),
  request = require('request'),
  utils = require('../utils'),
  mockedClientServer,
  contextBrokerMock;

describe('Log-In: ', function() {
  describe('When Logging in with a valid username and password', function() {
    var goodLogin = {
      url: config.host + '/v1/auth/tokens',
      method: 'POST',
      json: utils.readExampleFile('./test/oauthRequests/goodLogin.json'),
      headers: {
        'Content-Type': 'application/json',
      },
    };

    it('should return a 201 OK', function(done) {
      request(goodLogin, function(error, response, body) {
        should.not.exist(error);
        response.statusCode.should.equal(201);
        done();
      });
    });
  });

  describe('When Logging in with an invalid username and password', function() {
    var badLogin = {
      url: config.host + '/v1/auth/tokens',
      method: 'POST',
      json: utils.readExampleFile('./test/oauthRequests/badLogin.json'),
      headers: {
        'Content-Type': 'application/json',
      },
    };

    it('should return a 401 OK', function(done) {
      request(badLogin, function(error, response, body) {
        should.not.exist(error);
        response.statusCode.should.equal(401);
        done();
      });
    });
  });

  describe('When Logging in with an real username and bad password', function() {
    var wrongPasswordLogin = {
      url: config.host + '/v1/auth/tokens',
      method: 'POST',
      json: utils.readExampleFile(
        './test/oauthRequests/wrongPasswordLogin.json'
      ),
      headers: {
        'Content-Type': 'application/json',
      },
    };

    it('should return a 401 OK', function(done) {
      request(wrongPasswordLogin, function(error, response, body) {
        should.not.exist(error);
        response.statusCode.should.equal(401);
        done();
      });
    });
  });
});
