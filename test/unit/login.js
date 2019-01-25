/*
 * Copyright 2019 -  Universidad Politécnica de Madrid.
 *
 * This file is part of Keyrock
 *
 */

process.env.IDM_DB_PASS = 'test';
process.env.IDM_DB_USER = 'root';

// const keyrock = require('../../bin/www');
const config = require('../../config.js');
const should = require('should');
const request = require('request');
const utils = require('../utils');

const login = utils.readExampleFile('./test/templates/login.json');

describe('Log-In: ', function() {
  describe('1) When Logging in with a valid username and password', function() {
    const good_login = {
      url: config.host + '/v1/auth/tokens',
      method: 'POST',
      json: login.good_login,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    it('should return a 201 OK', function(done) {
      request(good_login, function(error, response /*, body*/) {
        should.not.exist(error);
        response.statusCode.should.equal(201);
        done();
      });
    });
  });

  describe('2) When Logging in with an invalid username and password', function() {
    const bad_login = {
      url: config.host + '/v1/auth/tokens',
      method: 'POST',
      json: login.bad_login,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    it('should return a 401 OK', function(done) {
      request(bad_login, function(error, response /*, body*/) {
        should.not.exist(error);
        response.statusCode.should.equal(401);
        done();
      });
    });
  });

  describe('3) When Logging in with an real username and bad password', function() {
    const wrong_password_login = {
      url: config.host + '/v1/auth/tokens',
      method: 'POST',
      json: login.wrong_password_login,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    it('should return a 401 OK', function(done) {
      request(wrong_password_login, function(error, response /*, body*/) {
        should.not.exist(error);
        response.statusCode.should.equal(401);
        done();
      });
    });
  });
});
