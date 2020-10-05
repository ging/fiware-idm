/*
 * Copyright 2019 -  Universidad Politécnica de Madrid.
 *
 * This file is part of Keyrock
 *
 */

// Load database configuration before
require('../../config/config_database');

const config_service = require('../../../lib/configService.js');
config_service.set_config(require('../../config-test.js'));
const config = config_service.get_config();
const should = require('should');
const request = require('request');
const utils = require('../../utils');

const authenticate = utils.readExampleFile('./test/templates/api/000-authenticate.json');

const admin_login = authenticate.good_admin_login;
const user_login = authenticate.good_login;

describe('API - 1 - Service provider: ', function () {
  describe('1) When requesting services providers with a token of an admin user', function () {
    let valid_token;

    // CREATE AN VALID TOKEN
    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const good_admin_login = {
        url: config.host + '/v1/auth/tokens',
        method: 'POST',
        json: admin_login,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      return request(good_admin_login, function (error, response) {
        valid_token = response.headers['x-subject-token'];
        done();
      });
    });
    it('should return a 200 OK', function (done) {
      const list_users = {
        url: config.host + '/v1/service_providers/configs',
        method: 'GET',
        headers: {
          'X-Auth-token': valid_token
        }
      };
      request(list_users, function (error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('information');
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('2) When requesting services providers with a token of an non-admin user', function () {
    let invalid_token;

    // CREATE AN INVALID TOKEN
    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const good_user_login = {
        url: config.host + '/v1/auth/tokens',
        method: 'POST',
        json: user_login,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      return request(good_user_login, function (error, response) {
        invalid_token = response.headers['x-subject-token'];
        done();
      });
    });

    it('should return a 403 Forbidden', function (done) {
      const list_users = {
        url: config.host + '/v1/service_providers/configs',
        method: 'GET',
        headers: {
          'X-Auth-token': invalid_token
        }
      };
      request(list_users, function (error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(403);
        done();
      });
    });
  });
});
