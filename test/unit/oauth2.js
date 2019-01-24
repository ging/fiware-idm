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

describe('OAuth Token Request: ', function() {
  describe('Client Credentials: When requesting with valid client id and secret', function() {
    const client_credentials_valid = utils.readExampleFile(
      './test/oauth_requests/client_credentials_valid.json'
    );

    const good_token_request = {
      url: config.host + '/oauth2/token',
      method: 'POST',
      body: client_credentials_valid.body,
      headers: client_credentials_valid.headers,
    };

    it('should return a 200 OK', function(done) {
      request(good_token_request, function(error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('access_token');
        should(json).have.property('token_type');
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('Client Credentials: When requesting with an invalid client id or secret', function() {
    const client_credentials_invalid = utils.readExampleFile(
      './test/oauth_requests/client_credentials_invalid.json'
    );

    const good_token_request = {
      url: config.host + '/oauth2/token',
      method: 'POST',
      body: client_credentials_invalid.body,
      headers: client_credentials_invalid.headers,
    };

    it('should return a 400 Invalid client', function(done) {
      request(good_token_request, function(error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(400);
        done();
      });
    });
  });

  describe('Resource Owner Password Credentials: When requesting with a valid username and password', function() {
    const password_credentials_valid = utils.readExampleFile(
      './test/oauth_requests/password_credentials_valid.json'
    );

    const good_token_request = {
      url: config.host + '/oauth2/token',
      method: 'POST',
      body: password_credentials_valid.body,
      headers: password_credentials_valid.headers,
    };

    it('should return a 200 OK', function(done) {
      request(good_token_request, function(error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('Resource Owner Password Credentials: When requesting with an invalid username and password', function() {
    const password_credentials_invalid = utils.readExampleFile(
      './test/oauth_requests/password_credentials_invalid.json'
    );

    const good_token_request = {
      url: config.host + '/oauth2/token',
      method: 'POST',
      body: password_credentials_invalid.body,
      headers: password_credentials_invalid.headers,
    };

    it('should return a 400 Invalid grant', function(done) {
      request(good_token_request, function(error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(400);
        done();
      });
    });
  });

  /*
  // This only works one time, because once an authorization code is used is no longer valid		
  describe('Authorization Code Credentials: When requesting with a valid code', function() {
  	const authorization_code_credentials_valid = utils.readExampleFile('./test/oauth_requests/authorization_code_credentials_valid.json');

    const good_token_request = {
      url: config.host + '/oauth2/token',
      method: 'POST',
      body: authorization_code_credentials_valid.body,
      headers: authorization_code_credentials_valid.headers,
    };

    it('should return a 200 OK', function(done) {
      request(good_token_request, function(error, response, body) {
        should.not.exist(error);
        var json = JSON.parse(body);
        should(json).have.property('access_token');
        should(json).have.property('token_type');
        response.statusCode.should.equal(200);
        done();
      });
    });
  });*/

  describe('Authorization Code Credentials: When requesting with an invalid code', function() {
    const authorization_code_credentials_invalid = utils.readExampleFile(
      './test/oauth_requests/authorization_code_credentials_invalid.json'
    );

    const good_token_request = {
      url: config.host + '/oauth2/token',
      method: 'POST',
      body: authorization_code_credentials_invalid.body,
      headers: authorization_code_credentials_invalid.headers,
    };

    it('should return a 400 Invalid grant', function(done) {
      request(good_token_request, function(error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(400);
        done();
      });
    });
  });

  describe('Authorization Code Credentials: When requesting with an expired code', function() {
    const authorization_code_credentials_expired = utils.readExampleFile(
      './test/oauth_requests/authorization_code_credentials_expired.json'
    );

    const good_token_request = {
      url: config.host + '/oauth2/token',
      method: 'POST',
      body: authorization_code_credentials_expired.body,
      headers: authorization_code_credentials_expired.headers,
    };

    it('should return a 400 Invalid grant', function(done) {
      request(good_token_request, function(error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(400);
        done();
      });
    });
  });

  /*
  // This only works one time, because once refresh token is used is no longer valid
  describe('Refresh Token Credentials: When requesting with a valid refresh token', function() {
  	const refresh_token_valid = utils.readExampleFile('./test/oauth_requests/refresh_token_valid.json');

    const good_token_request = {
      url: config.host + '/oauth2/token',
      method: 'POST',
      body: refresh_token_valid.body,
      headers: refresh_token_valid.headers,
    };

    it('should return a 200 OK', function(done) {
      request(good_token_request, function(error, response, body) {
        should.not.exist(error);
        var json = JSON.parse(body);
        should(json).have.property('access_token');
        should(json).have.property('token_type');
        response.statusCode.should.equal(200);
        done();
      });
    });
  });*/

  describe('Refresh Token Credentials: When requesting with an invalid refresh token', function() {
    const refresh_token_invalid = utils.readExampleFile(
      './test/oauth_requests/refresh_token_invalid.json'
    );

    const good_token_request = {
      url: config.host + '/oauth2/token',
      method: 'POST',
      body: refresh_token_invalid.body,
      headers: refresh_token_invalid.headers,
    };

    it('should return a 400 Invalid grant', function(done) {
      request(good_token_request, function(error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(400);
        done();
      });
    });
  });

  describe('Revoke Token: When requesting with a valid access token', function() {
    const revoke_token_valid = utils.readExampleFile(
      './test/oauth_requests/revoke_token_valid.json'
    );

    const good_token_request = {
      url: config.host + '/oauth2/revoke',
      method: 'POST',
      body: revoke_token_valid.body,
      headers: revoke_token_valid.headers,
    };

    it('should return a 200 OK (it is revoked if valid and if not is ignored)', function(done) {
      request(good_token_request, function(error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('Revoke Token: When requesting with a invalid access token', function() {
    const revoke_token_invalid = utils.readExampleFile(
      './test/oauth_requests/revoke_token_invalid.json'
    );

    const good_token_request = {
      url: config.host + '/oauth2/revoke',
      method: 'POST',
      body: revoke_token_invalid.body,
      headers: revoke_token_invalid.headers,
    };

    it('should return a 200 even if is invalid token', function(done) {
      request(good_token_request, function(error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('Validate a Token: When requesting with a valid access token', function() {
    const validate_token_valid = utils.readExampleFile(
      './test/oauth_requests/validate_token_valid.json'
    );

    const good_token_request = {
      url: config.host + '/user' + validate_token_valid.query,
      method: 'GET',
    };

    it('should return a 200 OK', function(done) {
      request(good_token_request, function(error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('app_id');
        should(json).have.property('id');
        response.statusCode.should.equal(201);
        done();
      });
    });
  });

  describe('Validate a Token: When requesting with a expired access token', function() {
    const validate_token_expired = utils.readExampleFile(
      './test/oauth_requests/validate_token_expired.json'
    );

    const good_token_request = {
      url: config.host + '/user' + validate_token_expired.query,
      method: 'GET',
    };

    it('should return a 401 Unauthorized', function(done) {
      request(good_token_request, function(error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(401);
        done();
      });
    });
  });

  describe('Validate a Token: When requesting with an invalid access token', function() {
    const validate_token_invalid = utils.readExampleFile(
      './test/oauth_requests/validate_token_invalid.json'
    );

    const good_token_request = {
      url: config.host + '/user' + validate_token_invalid.query,
      method: 'GET',
    };

    it('should return a 401 Unauthorized', function(done) {
      request(good_token_request, function(error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(401);
        done();
      });
    });
  });
});
