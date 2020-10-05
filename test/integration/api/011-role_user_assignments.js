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

const authenticate = utils.readExampleFile('./test/templates/api/000-authenticate.json');

const provider_login = authenticate.good_admin_login;
const user_login = authenticate.good_login;

const role_user_assignments = utils.readExampleFile('./test/templates/api/011-role_user_assignments.json');

let token;
let unauhtorized_token;
let application_id;
const users = [];
const roles = [];

describe('API - 11 - Role user assignment: ', function () {
  // CREATE TOKEN WITH PROVIDER CREDENTIALS
  // eslint-disable-next-line no-undef
  before(function (done) {
    const good_login = {
      url: config.host + '/v1/auth/tokens',
      method: 'POST',
      json: provider_login,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    return request(good_login, function (error, response) {
      token = response.headers['x-subject-token'];
      done();
    });
  });

  // CREATE NOT AUTHORIZED TOKEN IN APPLICATION
  // eslint-disable-next-line no-undef
  before(function (done) {
    const good_login = {
      url: config.host + '/v1/auth/tokens',
      method: 'POST',
      json: user_login,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    return request(good_login, function (error, response) {
      unauhtorized_token = response.headers['x-subject-token'];
      done();
    });
  });

  // CREATE APPLICATION
  // eslint-disable-next-line no-undef
  before(function (done) {
    const create_application = {
      url: config.host + '/v1/applications',
      method: 'POST',
      body: JSON.stringify(role_user_assignments.before.applications[0]),
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

  // CREATE USERS
  // eslint-disable-next-line no-undef
  before(function (done) {
    const users_template = role_user_assignments.before.users;

    for (let i = 0; i < users_template.length; i++) {
      const create_user = {
        url: config.host + '/v1/users',
        method: 'POST',
        body: JSON.stringify(users_template[i]),
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(create_user, function (error, response, body) {
        const json = JSON.parse(body);
        users.push(json.user.id);
        if (i === users_template.length - 1) {
          done();
        }
      });
    }
  });

  // CREATE ROLES
  // eslint-disable-next-line no-undef
  before(function (done) {
    const roles_template = role_user_assignments.before.roles;

    for (let i = 0; i < roles_template.length; i++) {
      const create_role = {
        url: config.host + '/v1/applications/' + application_id + '/roles',
        method: 'POST',
        body: JSON.stringify(roles_template[i]),
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(create_role, function (error, response, body) {
        const json = JSON.parse(body);
        roles.push(json.role.id);
        if (i === roles_template.length - 1) {
          done();
        }
      });
    }
  });

  describe('1) When assigning a role to a user with provider token', function () {
    it('should return a 201 OK', function (done) {
      const assign_role = {
        url: config.host + '/v1/applications/' + application_id + '/users/' + users[0] + '/roles/' + roles[0],
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };
      request(assign_role, function (error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('role_user_assignments');
        response.statusCode.should.equal(201);
        done();
      });
    });
  });

  describe('2) When assigning a role to a user with an unauhtorized token', function () {
    it('should return a 403 Forbidden', function (done) {
      const assign_role = {
        url: config.host + '/v1/applications/' + application_id + '/users/' + users[0] + '/roles/' + roles[0],
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': unauhtorized_token
        }
      };
      request(assign_role, function (error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(403);
        done();
      });
    });
  });

  describe('3) When list users authorized in an application', function () {
    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const max_index = users.length > roles.length ? users.length : roles.length;

      for (let i = 0; i < max_index; i++) {
        const assign_role = {
          url: config.host + '/v1/applications/' + application_id + '/users/' + users[i] + '/roles/' + roles[i],
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-token': token
          }
        };

        request(assign_role, function () {
          if (i === max_index - 1) {
            done();
          }
        });
      }
    });

    it('should return a 200 OK', function (done) {
      const assign_permission = {
        url: config.host + '/v1/applications/' + application_id + '/users',
        method: 'GET',
        headers: {
          'X-Auth-token': token
        }
      };
      request(assign_permission, function (error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('role_user_assignments');
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('4) When list roles of a user authorized in the application', function () {
    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const max_index = roles.length;

      for (let i = 0; i < max_index; i++) {
        const assign_role = {
          url: config.host + '/v1/applications/' + application_id + '/users/' + users[0] + '/roles/' + roles[i],
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-token': token
          }
        };

        request(assign_role, function () {
          if (i === max_index - 1) {
            done();
          }
        });
      }
    });

    it('should return a 200 OK', function (done) {
      const assign_permission = {
        url: config.host + '/v1/applications/' + application_id + '/users/' + users[0] + '/roles',
        method: 'GET',
        headers: {
          'X-Auth-token': token
        }
      };
      request(assign_permission, function (error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('role_user_assignments');
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('4) When removing a role from a user authorized in the application', function () {
    let user_id;
    let role_id;

    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      user_id = users[1];
      role_id = roles[2];

      const assign_role = {
        url: config.host + '/v1/applications/' + application_id + '/users/' + user_id + '/roles/' + role_id,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(assign_role, function () {
        done();
      });
    });

    it('should return a 204 OK', function (done) {
      const assign_permission = {
        url: config.host + '/v1/applications/' + application_id + '/users/' + user_id + '/roles/' + role_id,
        method: 'DELETE',
        headers: {
          'X-Auth-token': token
        }
      };
      request(assign_permission, function (error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(204);
        done();
      });
    });
  });
});
