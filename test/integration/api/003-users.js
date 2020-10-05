/*
 * Copyright 2019 -  Universidad Politécnica de Madrid.
 *
 * This file is part of Keyrock
 *
 */

// Load database configuration before
require('../../config/config_database');

// const keyrock = require('../../bin/www');
const config = require('../../config-test.js');
const should = require('should');
const request = require('request');
const utils = require('../../utils');

const authenticate = utils.readExampleFile('./test/templates/api/000-authenticate.json');

const admin_login = authenticate.good_admin_login;
const user_login = authenticate.good_login;

const users = utils.readExampleFile('./test/templates/api/003-users.json');

let valid_token;
let invalid_token;

describe('API - 3 - Users: ', function () {
  // CREATE A VALID ADMIN TOKEN
  // eslint-disable-next-line no-undef
  before(function (done) {
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

  // CREATE A VALID USER TOKEN
  // eslint-disable-next-line no-undef
  before(function (done) {
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

  describe('1) When requesting list of users with a token of an admin user', function () {
    it('should return a 200 OK', function (done) {
      const list_users = {
        url: config.host + '/v1/users',
        method: 'GET',
        headers: {
          'X-Auth-token': valid_token
        }
      };
      request(list_users, function (error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('users');
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('2) When requesting list of users with a token of a non-admin user', function () {
    it('should return a 403 Forbidden', function (done) {
      const list_users = {
        url: config.host + '/v1/users',
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

  describe('3) When creating a user', function () {
    it('should return a 201 OK', function (done) {
      const create_user = {
        url: config.host + '/v1/users',
        method: 'POST',
        body: JSON.stringify(users.create.valid_user_body),
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': valid_token
        }
      };

      request(create_user, function (error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('user');
        response.statusCode.should.equal(201);
        done();
      });
    });
  });

  describe('4) When reading user info', function () {
    let user_id;

    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const create_user = {
        url: config.host + '/v1/users',
        method: 'POST',
        body: JSON.stringify(users.read.create),
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': valid_token
        }
      };

      request(create_user, function (error, response, body) {
        const json = JSON.parse(body);
        user_id = json.user.id;
        done();
      });
    });

    it('should return a 200 OK', function (done) {
      const read_user = {
        url: config.host + '/v1/users/' + user_id,
        method: 'GET',
        headers: {
          'X-Auth-token': valid_token
        }
      };

      request(read_user, function (error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('user');
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('5) When updating user info', function () {
    let user_id;
    let username;

    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const create_user = {
        url: config.host + '/v1/users',
        method: 'POST',
        body: JSON.stringify(users.update.create),
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': valid_token
        }
      };

      request(create_user, function (error, response, body) {
        const json = JSON.parse(body);
        user_id = json.user.id;
        username = json.user.username;
        done();
      });
    });

    it('should return a 200 OK', function (done) {
      const update_user = {
        url: config.host + '/v1/users/' + user_id,
        method: 'PATCH',
        body: JSON.stringify(users.update.new_values),
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': valid_token
        }
      };

      request(update_user, function (error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('values_updated');
        const response_username = json.values_updated.username;
        should.notEqual(username, response_username);
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('6) When deleting user info', function () {
    let user_id;

    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const create_user = {
        url: config.host + '/v1/users',
        method: 'POST',
        body: JSON.stringify(users.delete.create),
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': valid_token
        }
      };

      request(create_user, function (error, response, body) {
        const json = JSON.parse(body);
        user_id = json.user.id;
        done();
      });
    });

    it('should return a 204 OK', function (done) {
      const delete_user = {
        url: config.host + '/v1/users/' + user_id,
        method: 'DELETE',
        headers: {
          'X-Auth-token': valid_token
        }
      };

      request(delete_user, function (error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(204);
        done();
      });
    });
  });
});
