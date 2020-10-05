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
const pep_proxies = utils.readExampleFile('./test/templates/api/006-pep_proxies.json');

let token;

describe('API - 6 - Pep Proxy: ', function () {
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

  describe('1) When creating a Pep Proxy', function () {
    let application_id;

    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const create_application = {
        url: config.host + '/v1/applications',
        method: 'POST',
        body: JSON.stringify(pep_proxies.create),
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

    it('should return a 201 OK', function (done) {
      const create_pep_proxy = {
        url: config.host + '/v1/applications/' + application_id + '/pep_proxies',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(create_pep_proxy, function (error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('pep_proxy');
        response.statusCode.should.equal(201);
        done();
      });
    });
  });

  describe('2) When reading Pep Proxy info', function () {
    let application_id;

    // Create application
    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const create_application = {
        url: config.host + '/v1/applications',
        method: 'POST',
        body: JSON.stringify(pep_proxies.read),
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

    // Create pep proxy
    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const create_pep_proxy = {
        url: config.host + '/v1/applications/' + application_id + '/pep_proxies',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(create_pep_proxy, function () {
        done();
      });
    });

    it('should return a 200 OK', function (done) {
      const read_pep_proxy = {
        url: config.host + '/v1/applications/' + application_id + '/pep_proxies',
        method: 'GET',
        headers: {
          'X-Auth-token': token
        }
      };

      request(read_pep_proxy, function (error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('pep_proxy');
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('3) When updating a Pep Proxy', function () {
    let application_id;

    // Create application
    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const create_application = {
        url: config.host + '/v1/applications',
        method: 'POST',
        body: JSON.stringify(pep_proxies.update),
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

    // Create pep proxy
    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const create_pep_proxy = {
        url: config.host + '/v1/applications/' + application_id + '/pep_proxies',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(create_pep_proxy, function () {
        done();
      });
    });

    it('should return a 200 OK', function (done) {
      const update_pep_proxy = {
        url: config.host + '/v1/applications/' + application_id + '/pep_proxies',
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(update_pep_proxy, function (error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('new_password');
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('4) When deleting a Pep Proxy', function () {
    let application_id;
    // Create application
    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const create_application = {
        url: config.host + '/v1/applications',
        method: 'POST',
        body: JSON.stringify(pep_proxies.delete),
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

    // Create pep proxy
    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const create_pep_proxy = {
        url: config.host + '/v1/applications/' + application_id + '/pep_proxies',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(create_pep_proxy, function () {
        done();
      });
    });

    it('should return a 204 OK', function (done) {
      const delete_pep_proxy = {
        url: config.host + '/v1/applications/' + application_id + '/pep_proxies',
        method: 'DELETE',
        headers: {
          'X-Auth-token': token
        }
      };

      request(delete_pep_proxy, function (error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(204);
        done();
      });
    });
  });
});
