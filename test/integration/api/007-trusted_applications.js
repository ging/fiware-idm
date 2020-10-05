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
const trusted_applications = utils.readExampleFile('./test/templates/api/007-trusted_applications.json');

let token;
let application_id;

describe('API - 7 - Trusted applications: ', function () {
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
      body: JSON.stringify(trusted_applications.before),
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

  describe('1) When adding a trusted application', function () {
    let trusted_application_id;

    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const create_trusted_application = {
        url: config.host + '/v1/applications',
        method: 'POST',
        body: JSON.stringify(trusted_applications.update),
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(create_trusted_application, function (error, response, body) {
        const json = JSON.parse(body);
        trusted_application_id = json.application.id;
        done();
      });
    });

    it('should return a 201 OK', function (done) {
      const add_trusted_application = {
        url: config.host + '/v1/applications/' + application_id + '/trusted_applications/' + trusted_application_id,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(add_trusted_application, function (error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('oauth_client_id');
        should(json).have.property('trusted_oauth_client_id');
        response.statusCode.should.equal(201);
        done();
      });
    });
  });

  describe('2) When requesting list trusted applications', function () {
    let trusted_application_id_1;
    let trusted_application_id_2;

    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const create_application = {
        url: config.host + '/v1/applications',
        method: 'POST',
        body: JSON.stringify(trusted_applications.list.applications[0]),
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(create_application, function (error, response, body) {
        const json = JSON.parse(body);
        trusted_application_id_1 = json.application.id;
        done();
      });
    });

    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const create_application = {
        url: config.host + '/v1/applications',
        method: 'POST',
        body: JSON.stringify(trusted_applications.list.applications[1]),
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(create_application, function (error, response, body) {
        const json = JSON.parse(body);
        trusted_application_id_2 = json.application.id;
        done();
      });
    });

    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const add_trusted_application = {
        url: config.host + '/v1/applications/' + application_id + '/trusted_applications/' + trusted_application_id_1,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(add_trusted_application, function () {
        done();
      });
    });

    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const add_trusted_application = {
        url: config.host + '/v1/applications/' + application_id + '/trusted_applications/' + trusted_application_id_2,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(add_trusted_application, function () {
        done();
      });
    });

    it('should return a 200 OK', function (done) {
      const list_trusted_applications = {
        url: config.host + '/v1/applications/' + application_id + '/trusted_applications',
        method: 'GET',
        headers: {
          'X-Auth-token': token
        }
      };
      request(list_trusted_applications, function (error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('trusted_applications');
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('3) When removing a trusted application', function () {
    let trusted_application_id;

    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const create_application = {
        url: config.host + '/v1/applications',
        method: 'POST',
        body: JSON.stringify(trusted_applications.list.applications[0]),
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(create_application, function (error, response, body) {
        const json = JSON.parse(body);
        trusted_application_id = json.application.id;
        done();
      });
    });

    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const add_trusted_application = {
        url: config.host + '/v1/applications/' + application_id + '/trusted_applications/' + trusted_application_id,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(add_trusted_application, function () {
        done();
      });
    });

    it('should return a 201 OK', function (done) {
      const delete_trusted_application = {
        url: config.host + '/v1/applications/' + application_id + '/trusted_applications/' + trusted_application_id,
        method: 'DELETE',
        headers: {
          'X-Auth-token': token
        }
      };
      request(delete_trusted_application, function (error, response) {
        response.statusCode.should.equal(204);
        done();
      });
    });
  });
});
