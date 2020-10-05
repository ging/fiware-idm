/*
 * Copyright 2019 -  Universidad Politécnica de Madrid.
 *
 * This file is part of Keyrock
 *
 */

// Load database configuration before
require('../config/config_database');

process.env.IDM_DB_PASS = 'test';
process.env.IDM_DB_USER = 'root';

// const keyrock = require('../../bin/www');
const config_service = require('../../lib/configService.js');
config_service.set_config(require('../config-test.js'));
const config = config_service.get_config();
const should = require('should');
const request = require('request');
const utils = require('../utils');

const oauth = utils.readExampleFile('./test/templates/oauth2.json');

describe('OAuth Token Request: ', function () {
  describe('1) Client Credentials: When requesting with valid client id and secret', function () {
    const good_token_request = {
      url: config.host + '/oauth2/token',
      method: 'POST',
      body: oauth.requests.client_credentials_valid.body,
      headers: oauth.headers
    };

    it('should return a 200 OK', function (done) {
      request(good_token_request, function (error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('access_token');
        should(json).have.property('token_type');
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('2) Client Credentials: When requesting with an invalid client id or secret', function () {
    const good_token_request = {
      url: config.host + '/oauth2/token',
      method: 'POST',
      body: oauth.requests.client_credentials_invalid.body,
      headers: oauth.fake_headers
    };

    it('should return a 400 Invalid client', function (done) {
      request(good_token_request, function (error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(400);
        done();
      });
    });
  });

  describe('3) Resource Owner Password Credentials: When requesting with a valid username and password', function () {
    const good_token_request = {
      url: config.host + '/oauth2/token',
      method: 'POST',
      body: oauth.requests.password_credentials_valid.body,
      headers: oauth.headers
    };

    it('should return a 200 OK', function (done) {
      request(good_token_request, function (error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('4) Resource Owner Password Credentials: When requesting with an invalid username and password', function () {
    const good_token_request = {
      url: config.host + '/oauth2/token',
      method: 'POST',
      body: oauth.requests.password_credentials_invalid.body,
      headers: oauth.headers
    };

    it('should return a 400 Invalid grant', function (done) {
      request(good_token_request, function (error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(400);
        done();
      });
    });
  });

  describe('5) Authorization Code Credentials: When requesting with a valid code', function () {
    const good_token_request = {
      url: config.host + '/oauth2/token',
      method: 'POST',
      body: oauth.requests.authorization_code_credentials_valid.body,
      headers: oauth.headers
    };

    it('should return a 200 OK', function (done) {
      request(good_token_request, function (error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('access_token');
        should(json).have.property('token_type');
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('6) Authorization Code Credentials: When requesting with an invalid code', function () {
    const good_token_request = {
      url: config.host + '/oauth2/token',
      method: 'POST',
      body: oauth.requests.authorization_code_credentials_invalid.body,
      headers: oauth.headers
    };

    it('should return a 400 Invalid grant', function (done) {
      request(good_token_request, function (error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(400);
        done();
      });
    });
  });

  describe('7) Authorization Code Credentials: When requesting with an expired code', function () {
    const good_token_request = {
      url: config.host + '/oauth2/token',
      method: 'POST',
      body: oauth.requests.authorization_code_credentials_expired.body,
      headers: oauth.headers
    };

    it('should return a 400 Invalid grant', function (done) {
      request(good_token_request, function (error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(400);
        done();
      });
    });
  });

  describe('8) Refresh Token Credentials: When requesting with a valid refresh token', function () {
    const good_token_request = {
      url: config.host + '/oauth2/token',
      method: 'POST',
      body: oauth.requests.refresh_token_valid.body,
      headers: oauth.headers
    };

    it('should return a 200 OK', function (done) {
      request(good_token_request, function (error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('access_token');
        should(json).have.property('token_type');
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('9) Refresh Token Credentials: When requesting with an invalid refresh token', function () {
    const good_token_request = {
      url: config.host + '/oauth2/token',
      method: 'POST',
      body: oauth.requests.refresh_token_invalid.body,
      headers: oauth.headers
    };

    it('should return a 400 Invalid grant', function (done) {
      request(good_token_request, function (error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(400);
        done();
      });
    });
  });

  describe('10) Revoke Token: When requesting with a valid access token', function () {
    const good_token_request = {
      url: config.host + '/oauth2/revoke',
      method: 'POST',
      body: oauth.requests.revoke_token_valid.body,
      headers: oauth.headers
    };

    it('should return a 200 OK (it is revoked if valid and if not is ignored)', function (done) {
      request(good_token_request, function (error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('11) Revoke Token: When requesting with a invalid access token', function () {
    const good_token_request = {
      url: config.host + '/oauth2/revoke',
      method: 'POST',
      body: oauth.requests.revoke_token_invalid.body,
      headers: oauth.headers
    };

    it('should return a 200 even if is invalid token', function (done) {
      request(good_token_request, function (error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('12) Validate a Token: When requesting with a valid access token', function () {
    const good_token_request = {
      url: config.host + '/user' + oauth.requests.validate_token_valid.query,
      method: 'GET'
    };

    it('should return a 200 OK', function (done) {
      request(good_token_request, function (error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('app_id');
        should(json).have.property('id');
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('13) Validate a Token: When requesting with a expired access token', function () {
    const good_token_request = {
      url: config.host + '/user' + oauth.requests.validate_token_expired.query,
      method: 'GET'
    };

    it('should return a 401 Unauthorized', function (done) {
      request(good_token_request, function (error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(401);
        done();
      });
    });
  });

  describe('14) Validate a Token: When requesting with an invalid access token', function () {
    const good_token_request = {
      url: config.host + '/user' + oauth.requests.validate_token_invalid.query,
      method: 'GET'
    };

    it('should return a 401 Unauthorized', function (done) {
      request(good_token_request, function (error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(401);
        done();
      });
    });
  });
});
