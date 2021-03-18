/*
 * Copyright 2019 -  Universidad Politécnica de Madrid.
 *
 * This file is part of Keyrock
 *
 */

// Load database configuration before
require('../../config/config_database');

// const keyrock = require('../../bin/www');
const config = require('../../../config.js');
const should = require('should');
const request = require('request');
const utils = require('../../utils');

const login = utils.readExampleFile('./test/templates/api/000-authenticate.json').good_admin_login;
const resource_requests = utils.readExampleFile('./test/templates/api/012-resource_request.json');

let token;
let application_id;
let application_secret;
let oauth_access_token;
let permissions_id_1;
let permissions_id_2;
let role_id;

describe('API - 12 - Authorization Service Header permission request: ', function () {
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
      body: JSON.stringify(resource_requests.before),
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-token': token
      }
    };

    request(create_application, function (error, response, body) {
      const json = JSON.parse(body);
      application_id = json.application.id;
      application_secret = json.application.secret;
      done();
    });
  });

  // CREATE PERMISSIONS 1
  // eslint-disable-next-line no-undef
  before(function (done) {
    const create_permission1 = {
      url: config.host + '/v1/applications/' + application_id + '/permissions',
      method: 'POST',
      body: JSON.stringify(resource_requests.create.valid_perm_body1),
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-token': token
      }
    };

    request(create_permission1, function (error, response, body) {
      const json = JSON.parse(body);
      permissions_id_1 = json.permission.id;
      done();
    });
  });
  // CREATE PERMISSIONS 2
  // eslint-disable-next-line no-undef
  before(function (done) {
    const create_permission2 = {
      url: config.host + '/v1/applications/' + application_id + '/permissions',
      method: 'POST',
      body: JSON.stringify(resource_requests.create.valid_perm_body2),
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-token': token
      }
    };

    request(create_permission2, function (error, response, body) {
      const json = JSON.parse(body);
      permissions_id_2 = json.permission.id;
      done();
    });
  });
  // CREATE ROLE
  // eslint-disable-next-line no-undef
  before(function (done) {
    const create_permission2 = {
      url: config.host + '/v1/applications/' + application_id + '/roles',
      method: 'POST',
      body: JSON.stringify(resource_requests.create.valid_role_body),
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-token': token
      }
    };

    request(create_permission2, function (error, response, body) {
      const json = JSON.parse(body);
      role_id = json.role.id;
      done();
    });
  });
  // ASSIGN PERMISSION 1 TO ROLE
  // eslint-disable-next-line no-undef
  before(function (done) {
    const assign_permission_1_to_role = {
      url:
        config.host + '/v1/applications/' + application_id + '/roles/' + role_id + '/permissions/' + permissions_id_1,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-token': token
      }
    };

    request(assign_permission_1_to_role, function () {
      done();
    });
  });
  // ASSIGN PERMISSION 2 TO ROLE
  // eslint-disable-next-line no-undef
  before(function (done) {
    const assign_permission_2_to_role = {
      url:
        config.host + '/v1/applications/' + application_id + '/roles/' + role_id + '/permissions/' + permissions_id_2,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-token': token
      }
    };

    request(assign_permission_2_to_role, function () {
      done();
    });
  });
  // ASSIGN ROLE TO USER
  // eslint-disable-next-line no-undef
  before(function (done) {
    const assign_role_to_user = {
      url:
        config.host +
        '/v1/applications/' +
        application_id +
        '/users/' +
        'aaaaaaaa-good-0000-0000-000000000000' +
        '/roles/' +
        role_id,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-token': token
      }
    };

    request(assign_role_to_user, function () {
      done();
    });
  });
  // GET OAUTH2 Token
  // eslint-disable-next-line no-undef
  before(function (done) {
    const get_oauth_token = {
      url: config.host + '/oauth2/token',
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(application_id + ':' + application_secret).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=password&username=' + login.name + '&password=' + login.password
    };

    request(get_oauth_token, function (error, response, body) {
      const json = JSON.parse(body);
      oauth_access_token = json.access_token;
      done();
    });
  });
  describe('1) When requesting a resource only with resource and action that is permitted', function () {
    it('should return a 200 OK and a Permit', function (done) {
      const list_permissions = {
        url:
          config.host +
          '/user?access_token=' +
          oauth_access_token +
          '&action=GET&resource=/v2/entities&app_id=' +
          application_id,
        method: 'GET'
      };
      request(list_permissions, function (error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should.equal(json.authorization_decision, 'Permit');
        response.statusCode.should.equal(200);
        done();
      });
    });
  });
  describe('2) When requesting a resource with resource, action and authorization_service_header that is permitted', function () {
    it('should return a 200 OK and a Permit', function (done) {
      const list_permissions = {
        url:
          config.host +
          '/user?access_token=' +
          oauth_access_token +
          '&action=POST&resource=/login&authorization_service_header=test&app_id=' +
          application_id,
        method: 'GET'
      };
      request(list_permissions, function (error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should.equal(json.authorization_decision, 'Permit');
        response.statusCode.should.equal(200);
        done();
      });
    });
  });
  describe('3) When requesting a resource with resource, action and wrong authorization_service_header that is not permitted', function () {
    it('should return a 200 OK and a Deny', function (done) {
      const list_permissions = {
        url:
          config.host +
          '/user?access_token=' +
          oauth_access_token +
          '&action=GET&resource=login&authorization_service_header=wrong&app_id=' +
          application_id,
        method: 'GET'
      };
      request(list_permissions, function (error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should.equal(json.authorization_decision, 'Deny');
        response.statusCode.should.equal(200);
        done();
      });
    });
  });
  describe('4) When requesting a resource with authorization_service_header, action and wrong resource that is not permitted', function () {
    it('should return a 200 OK and a Deny', function (done) {
      const list_permissions = {
        url:
          config.host +
          '/user?access_token=' +
          oauth_access_token +
          '&action=GET&resource=wrong&authorization_service_header=test&app_id=' +
          application_id,
        method: 'GET'
      };
      request(list_permissions, function (error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should.equal(json.authorization_decision, 'Deny');
        response.statusCode.should.equal(200);
        done();
      });
    });
  });
});
