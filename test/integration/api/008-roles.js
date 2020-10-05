/*
 * Copyright 2019 -  Universidad Politécnica de Madrid.
 *
 * This file is part of Keyrock
 *
 */

// Load database configuration before
require('../../config/config_database');

// const keyrock = require('../../bin/www');
const config_service = require('../../../lib/configService.js');
config_service.set_config(require('../../config-test.js'));
const config = config_service.get_config();
const should = require('should');
const request = require('request');
const utils = require('../../utils');

const login = utils.readExampleFile('./test/templates/api/000-authenticate.json').good_admin_login;
const roles = utils.readExampleFile('./test/templates/api/008-roles.json');

let token;
let application_id;

describe('API - 8 - Roles: ', function () {
  // CREATE TOKEN WITH PROVIDER CREDENTIALS
  // eslint-disable-next-line no-undef
  before(function (done) {
    const good_login = {
      url: config.host + '/v1/auth/tokens',
      method: 'POST',
      json: login,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    return request(good_login, function (error, response) {
      token = response.headers['x-subject-token'];
      done();
    });
  });

  // CREATE APPLICATION
  // eslint-disable-next-line no-undef
  before(function (done) {
    const create_application = {
      url: config.host + '/v1/applications',
      method: 'POST',
      body: JSON.stringify(roles.before),
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-token': token
      }
    };

    request(create_application, function (error, response, body) {
      const json = JSON.parse(body);
      application_id = json.application.id;
      done();
    });
  });

  describe('1) When requesting list of roles', function () {
    it('should return a 200 OK', function (done) {
      const list_roles = {
        url: config.host + '/v1/applications/' + application_id + '/roles',
        method: 'GET',
        headers: {
          'X-Auth-token': token
        }
      };
      request(list_roles, function (error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('roles');
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('2) When creating a role', function () {
    it('should return a 201 OK', function (done) {
      const create_role = {
        url: config.host + '/v1/applications/' + application_id + '/roles',
        method: 'POST',
        body: JSON.stringify(roles.create.valid_role_body),
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(create_role, function (error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('role');
        response.statusCode.should.equal(201);
        done();
      });
    });
  });

  describe('3) When reading role info', function () {
    let role_id;

    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const create_role = {
        url: config.host + '/v1/applications/' + application_id + '/roles',
        method: 'POST',
        body: JSON.stringify(roles.read.create),
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(create_role, function (error, response, body) {
        const json = JSON.parse(body);
        role_id = json.role.id;
        done();
      });
    });

    it('should return a 200 OK', function (done) {
      const read_role = {
        url: config.host + '/v1/applications/' + application_id + '/roles/' + role_id,
        method: 'GET',
        headers: {
          'X-Auth-token': token
        }
      };

      request(read_role, function (error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('role');
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('4) When updating a role', function () {
    let role_id;
    let role_name;

    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const create_role = {
        url: config.host + '/v1/applications/' + application_id + '/roles',
        method: 'POST',
        body: JSON.stringify(roles.update.create),
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(create_role, function (error, response, body) {
        const json = JSON.parse(body);
        role_id = json.role.id;
        role_name = json.role.name;
        done();
      });
    });

    it('should return a 200 OK', function (done) {
      const update_role = {
        url: config.host + '/v1/applications/' + application_id + '/roles/' + role_id,
        method: 'PATCH',
        body: JSON.stringify(roles.update.new_values),
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(update_role, function (error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('values_updated');
        const response_name = json.values_updated.name;
        should.notEqual(role_name, response_name);
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('4) When deleting a role', function () {
    let role_id;

    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const create_role = {
        url: config.host + '/v1/applications/' + application_id + '/roles',
        method: 'POST',
        body: JSON.stringify(roles.delete.create),
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(create_role, function (error, response, body) {
        const json = JSON.parse(body);
        role_id = json.role.id;
        done();
      });
    });

    it('should return a 204 OK', function (done) {
      const delete_role = {
        url: config.host + '/v1/applications/' + application_id + '/roles/' + role_id,
        method: 'DELETE',
        headers: {
          'X-Auth-token': token
        }
      };

      request(delete_role, function (error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(204);
        done();
      });
    });
  });
});
