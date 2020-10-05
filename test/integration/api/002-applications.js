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

const login = utils.readExampleFile('./test/templates/api/000-authenticate.json').good_login;
const applications = utils.readExampleFile('./test/templates/api/002-applications.json');

let token;

describe('API - 2 - Applications: ', function () {
  // CREATE A VALID TOKEN
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

  describe('1) When requesting list of applications', function () {
    it('should return a 200 OK', function (done) {
      const list_applications = {
        url: config.host + '/v1/applications',
        method: 'GET',
        headers: {
          'X-Auth-token': token
        }
      };
      request(list_applications, function (error, response, body) {
        should.not.exist(error);
        response.statusCode.should.equal(200);
        const json = JSON.parse(body);
        should(json).have.property('applications');
        done();
      });
    });
  });

  describe('2) When creating an application', function () {
    it('should return a 201 OK', function (done) {
      const create_application = {
        url: config.host + '/v1/applications',
        method: 'POST',
        body: JSON.stringify(applications.create.valid_app_body),
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(create_application, function (error, response, body) {
        should.not.exist(error);
        response.statusCode.should.equal(201);
        const json = JSON.parse(body);
        should(json).have.property('application');
        done();
      });
    });
  });

  describe('3) When reading application info', function () {
    let application_id;

    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const create_application = {
        url: config.host + '/v1/applications',
        method: 'POST',
        body: JSON.stringify(applications.read.create),
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

    it('should return a 200 OK', function (done) {
      const read_application = {
        url: config.host + '/v1/applications/' + application_id,
        method: 'GET',
        headers: {
          'X-Auth-token': token
        }
      };

      request(read_application, function (error, response, body) {
        should.not.exist(error);
        response.statusCode.should.equal(200);
        const json = JSON.parse(body);
        should(json).have.property('application');
        done();
      });
    });
  });

  describe('4) When updating an application', function () {
    let application_id;
    let application_name;

    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const create_application = {
        url: config.host + '/v1/applications',
        method: 'POST',
        body: JSON.stringify(applications.update.create),
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(create_application, function (error, response, body) {
        const json = JSON.parse(body);
        application_id = json.application.id;
        application_name = json.application.name;
        done();
      });
    });

    it('should return a 200 OK', function (done) {
      const update_application = {
        url: config.host + '/v1/applications/' + application_id,
        method: 'PATCH',
        body: JSON.stringify(applications.update.new_values),
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(update_application, function (error, response, body) {
        should.not.exist(error);
        response.statusCode.should.equal(200);
        const json = JSON.parse(body);
        should(json).have.property('values_updated');
        const response_name = json.values_updated.name;
        should.notEqual(application_name, response_name);
        done();
      });
    });
  });

  describe('4) When deleting an application', function () {
    let application_id;

    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const create_application = {
        url: config.host + '/v1/applications',
        method: 'POST',
        body: JSON.stringify(applications.delete.create),
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

    it('should return a 204 OK', function (done) {
      const delete_application = {
        url: config.host + '/v1/applications/' + application_id,
        method: 'DELETE',
        headers: {
          'X-Auth-token': token
        }
      };

      request(delete_application, function (error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(204);
        done();
      });
    });
  });

  describe('6) When creating an application with token type not configure', function () {
    it('should return a 201 OK', function (done) {
      const create_application = {
        url: config.host + '/v1/applications',
        method: 'POST',
        body: JSON.stringify(applications.create.app_token_type),
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(create_application, function (error, response, body) {
        should.not.exist(error);
        response.statusCode.should.equal(201);
        const json = JSON.parse(body);
        should(json).have.property('application');
        done();
      });
    });
  });
});
