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

const provider_login = authenticate.good_admin_login;
const user_login = authenticate.good_login;

const role_permission_assignments = utils.readExampleFile('./test/templates/api/010-role_permission_assignments.json');

let token;
let unauhtorized_token;
let application_id;

describe('API - 10 - Role permission assignment: ', function () {
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
      body: JSON.stringify(role_permission_assignments.before),
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

  describe('1) When assigning a permission to a role using a token of the provider of the application', function () {
    let role_id;
    let permission_id;

    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const create_role = {
        url: config.host + '/v1/applications/' + application_id + '/roles',
        method: 'POST',
        body: JSON.stringify(role_permission_assignments.add.role_body),
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

    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const create_permission = {
        url: config.host + '/v1/applications/' + application_id + '/permissions',
        method: 'POST',
        body: JSON.stringify(role_permission_assignments.add.permission_body),
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(create_permission, function (error, response, body) {
        const json = JSON.parse(body);
        permission_id = json.permission.id;
        done();
      });
    });

    it('should return a 201 OK', function (done) {
      const assign_permission = {
        url: config.host + '/v1/applications/' + application_id + '/roles/' + role_id + '/permissions/' + permission_id,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };
      request(assign_permission, function (error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('role_permission_assignments');
        response.statusCode.should.equal(201);
        done();
      });
    });
  });

  describe('2) When assigning a permission to a role using a token of a non-provider of the application', function () {
    let role_id;
    let permission_id;

    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const create_role = {
        url: config.host + '/v1/applications/' + application_id + '/roles',
        method: 'POST',
        body: JSON.stringify(role_permission_assignments.add.role_body),
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

    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const create_permission = {
        url: config.host + '/v1/applications/' + application_id + '/permissions',
        method: 'POST',
        body: JSON.stringify(role_permission_assignments.add.permission_body),
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(create_permission, function (error, response, body) {
        const json = JSON.parse(body);
        permission_id = json.permission.id;
        done();
      });
    });

    it('should return a 403 OK', function (done) {
      const assign_permission = {
        url: config.host + '/v1/applications/' + application_id + '/roles/' + role_id + '/permissions/' + permission_id,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': unauhtorized_token
        }
      };
      request(assign_permission, function (error, response) {
        response.statusCode.should.equal(403);
        done();
      });
    });
  });

  describe('3) When requesting a list of permissions assigned to a role', function () {
    let role_id;
    let permission_id;

    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const create_role = {
        url: config.host + '/v1/applications/' + application_id + '/roles',
        method: 'POST',
        body: JSON.stringify(role_permission_assignments.add.role_body),
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

    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const create_permission = {
        url: config.host + '/v1/applications/' + application_id + '/permissions',
        method: 'POST',
        body: JSON.stringify(role_permission_assignments.add.permission_body),
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(create_permission, function (error, response, body) {
        const json = JSON.parse(body);
        permission_id = json.permission.id;
        done();
      });
    });

    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const assign_permission = {
        url: config.host + '/v1/applications/' + application_id + '/roles/' + role_id + '/permissions/' + permission_id,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };
      request(assign_permission, function () {
        done();
      });
    });

    it('should return a 200 OK', function (done) {
      const list_permissions = {
        url: config.host + '/v1/applications/' + application_id + '/roles/' + role_id + '/permissions',
        method: 'GET',
        headers: {
          'X-Auth-token': token
        }
      };
      request(list_permissions, function (error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('role_permission_assignments');
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('4) When removing an assignmenet of a role', function () {
    let role_id;
    let permission_id;

    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const create_role = {
        url: config.host + '/v1/applications/' + application_id + '/roles',
        method: 'POST',
        body: JSON.stringify(role_permission_assignments.add.role_body),
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

    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const create_permission = {
        url: config.host + '/v1/applications/' + application_id + '/permissions',
        method: 'POST',
        body: JSON.stringify(role_permission_assignments.add.permission_body),
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(create_permission, function (error, response, body) {
        const json = JSON.parse(body);
        permission_id = json.permission.id;
        done();
      });
    });

    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const assign_permission = {
        url: config.host + '/v1/applications/' + application_id + '/roles/' + role_id + '/permissions/' + permission_id,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };
      request(assign_permission, function () {
        done();
      });
    });

    it('should return a 204 OK', function (done) {
      const list_permissions = {
        url: config.host + '/v1/applications/' + application_id + '/roles/' + role_id + '/permissions/' + permission_id,
        method: 'DELETE',
        headers: {
          'X-Auth-token': token
        }
      };
      request(list_permissions, function (error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(204);
        done();
      });
    });
  });
});
