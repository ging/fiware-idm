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

const login = utils.readExampleFile('./test/templates/api/000-authenticate.json').good_admin_login;
const permissions = utils.readExampleFile('./test/templates/api/009-permissions.json');

let token;
let application_id;

describe('API - 9 - Permissions: ', function () {
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
      body: JSON.stringify(permissions.before),
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

  describe('1) When requesting list of permissions', function () {
    it('should return a 200 OK', function (done) {
      const list_permissions = {
        url: config.host + '/v1/applications/' + application_id + '/permissions',
        method: 'GET',
        headers: {
          'X-Auth-token': token
        }
      };
      request(list_permissions, function (error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('permissions');
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('2) When creating a permission', function () {
    it('should return a 201 OK', function (done) {
      const create_permission = {
        url: config.host + '/v1/applications/' + application_id + '/permissions',
        method: 'POST',
        body: JSON.stringify(permissions.create.valid_perm_body),
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(create_permission, function (error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('permission');
        response.statusCode.should.equal(201);
        done();
      });
    });
  });

  describe('3) When creating a permission with resource+password and xml in the body', function () {
    it('should return a 400 Bad request', function (done) {
      const create_permission = {
        url: config.host + '/v1/applications/' + application_id + '/permissions',
        method: 'POST',
        body: JSON.stringify(permissions.create.invalid_perm_body),
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(create_permission, function (error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(400);
        done();
      });
    });
  });

  describe('4) When reading permission info', function () {
    let permission_id;

    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const create_permission = {
        url: config.host + '/v1/applications/' + application_id + '/permissions',
        method: 'POST',
        body: JSON.stringify(permissions.read.create),
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

    it('should return a 200 OK', function (done) {
      const read_permission = {
        url: config.host + '/v1/applications/' + application_id + '/permissions/' + permission_id,
        method: 'GET',
        headers: {
          'X-Auth-token': token
        }
      };

      request(read_permission, function (error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('permission');
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('5) When updating a permission', function () {
    let permission_id;
    let permission_name;
    let permission_description;
    let permission_resource;
    let permission_action;
    // eslint-disable-next-line no-unused-vars
    let permission_authorization_service_header;
    // eslint-disable-next-line no-unused-vars
    let permission_use_authorization_service_header;
    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const create_permission = {
        url: config.host + '/v1/applications/' + application_id + '/permissions',
        method: 'POST',
        body: JSON.stringify(permissions.update.create),
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(create_permission, function (error, response, body) {
        const json = JSON.parse(body);
        permission_id = json.permission.id;
        permission_name = json.permission.name;
        permission_description = json.permission.description;
        permission_action = json.permission.action;
        permission_resource = json.permission.resource;
        // eslint-disable-next-line no-unused-vars
        permission_authorization_service_header = json.authorization_service_header;
        // eslint-disable-next-line no-unused-vars
        permission_use_authorization_service_header = json.use_authorization_service_header;
        done();
      });
    });

    it('should return a 200 OK', function (done) {
      const update_permission = {
        url: config.host + '/v1/applications/' + application_id + '/permissions/' + permission_id,
        method: 'PATCH',
        body: JSON.stringify(permissions.update.new_values),
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(update_permission, function (error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('values_updated');
        const response_name = json.values_updated.name;
        const response_description = json.values_updated.description;
        const response_action = json.values_updated.action;
        const response_resource = json.values_updated.resource;
        const response_authorization_service_header = json.values_updated.authorization_service_header;
        const response_use_authorization_service_header = json.values_updated.use_authorization_service_header;
        should.notEqual(permission_name, response_name);
        should.notEqual(permission_description, response_description);
        should.notEqual(permission_action, response_action);
        should.notEqual(permission_resource, response_resource);
        should.equal(undefined, response_authorization_service_header);
        should.equal(false, response_use_authorization_service_header);
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('6) When deleting a permission', function () {
    let permission_id;

    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const create_permission = {
        url: config.host + '/v1/applications/' + application_id + '/permissions',
        method: 'POST',
        body: JSON.stringify(permissions.delete.create),
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

    it('should return a 204 OK', function (done) {
      const delete_permission = {
        url: config.host + '/v1/applications/' + application_id + '/permissions/' + permission_id,
        method: 'DELETE',
        headers: {
          'X-Auth-token': token
        }
      };

      request(delete_permission, function (error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(204);
        done();
      });
    });
  });
});
describe('7) When creating a permission with resource+password+use_authorization_service_header and no authorization_service_header', function () {
  it('should return a 400 Bad request', function (done) {
    const create_permission = {
      url: config.host + '/v1/applications/' + application_id + '/permissions',
      method: 'POST',
      body: JSON.stringify(
        permissions.create.invalid_perm_body_no_authorization_service_header_but_use_authorization_service_header
      ),
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-token': token
      }
    };

    request(create_permission, function (error, response) {
      should.not.exist(error);
      response.statusCode.should.equal(400);
      done();
    });
  });
});
describe('8) When creating a permission with resource+password+authorization_service_header and no use_authorization_service_header', function () {
  it('should return a 400 Bad request', function (done) {
    const create_permission = {
      url: config.host + '/v1/applications/' + application_id + '/permissions',
      method: 'POST',
      body: JSON.stringify(
        permissions.create.invalid_perm_body_no_use_authorization_service_header_but_authorization_service_header
      ),
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-token': token
      }
    };

    request(create_permission, function (error, response) {
      should.not.exist(error);
      response.statusCode.should.equal(400);
      done();
    });
  });
});
describe('9) When creating a permission with authorization_service_header and xml in body', function () {
  it('should return a 400 Bad request', function (done) {
    const create_permission = {
      url: config.host + '/v1/applications/' + application_id + '/permissions',
      method: 'POST',
      body: JSON.stringify(permissions.create.invalid_perm_body_authorization_service_header_and_xml),
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-token': token
      }
    };

    request(create_permission, function (error, response) {
      should.not.exist(error);
      response.statusCode.should.equal(400);
      done();
    });
  });
});
describe('10) When creating a permission with use_authorization_service_header and xml in body', function () {
  it('should return a 400 Bad request', function (done) {
    const create_permission = {
      url: config.host + '/v1/applications/' + application_id + '/permissions',
      method: 'POST',
      body: JSON.stringify(permissions.create.invalid_perm_body_use_authorization_service_header_and_xml),
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-token': token
      }
    };

    request(create_permission, function (error, response) {
      should.not.exist(error);
      response.statusCode.should.equal(400);
      done();
    });
  });
});
describe('11) When creating a permission with use_authorization_service_header equal false', function () {
  it('should return a 201 OK', function (done) {
    const create_permission = {
      url: config.host + '/v1/applications/' + application_id + '/permissions',
      method: 'POST',
      body: JSON.stringify(
        permissions.create.valid_perm_body_no_authorization_service_header_but_use_authorization_service_header_is_false
      ),
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-token': token
      }
    };

    request(create_permission, function (error, response) {
      should.not.exist(error);
      response.statusCode.should.equal(201);
      done();
    });
  });
});
