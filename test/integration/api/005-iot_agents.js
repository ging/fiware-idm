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
const iot_agents = utils.readExampleFile('./test/templates/api/005-iot_agents.json');

let token;
let application_id;

describe('API - 5 - iot_agents: ', function () {
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
      body: JSON.stringify(iot_agents.before),
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

  describe('1) When creating a iot_agent', function () {
    it('should return a 201 OK', function (done) {
      const create_iot_agent = {
        url: config.host + '/v1/applications/' + application_id + '/iot_agents',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(create_iot_agent, function (error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('iot_agent');
        response.statusCode.should.equal(201);
        done();
      });
    });
  });

  describe('2) When requesting list of iot_agents', function () {
    const create_iot_agent = {
      url: config.host + '/v1/applications/' + application_id + '/iot_agents',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-token': token
      }
    };

    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      request(create_iot_agent, function () {
        done();
      });
    });
    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      request(create_iot_agent, function () {
        done();
      });
    });
    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      request(create_iot_agent, function () {
        done();
      });
    });

    it('should return a 200 OK', function (done) {
      const list_iot_agents = {
        url: config.host + '/v1/applications/' + application_id + '/iot_agents',
        method: 'GET',
        headers: {
          'X-Auth-token': token
        }
      };
      request(list_iot_agents, function (error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('iot_agents');
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('3) When reading iot_agent info', function () {
    let iot_agent_id;

    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const create_iot_agent = {
        url: config.host + '/v1/applications/' + application_id + '/iot_agents',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(create_iot_agent, function (error, response, body) {
        const json = JSON.parse(body);
        iot_agent_id = json.iot_agent.id;
        done();
      });
    });

    it('should return a 200 OK', function (done) {
      const read_iot_agent = {
        url: config.host + '/v1/applications/' + application_id + '/iot_agents/' + iot_agent_id,
        method: 'GET',
        headers: {
          'X-Auth-token': token
        }
      };

      request(read_iot_agent, function (error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('iot_agent');
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('4) When updating a iot_agent', function () {
    let iot_agent_id;
    let iot_agent_password;

    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const create_iot_agent = {
        url: config.host + '/v1/applications/' + application_id + '/iot_agents',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(create_iot_agent, function (error, response, body) {
        const json = JSON.parse(body);
        iot_agent_id = json.iot_agent.id;
        iot_agent_password = json.iot_agent.password;
        done();
      });
    });

    it('should return a 200 OK', function (done) {
      const update_iot_agent = {
        url: config.host + '/v1/applications/' + application_id + '/iot_agents/' + iot_agent_id,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(update_iot_agent, function (error, response, body) {
        should.not.exist(error);
        const json = JSON.parse(body);
        should(json).have.property('new_password');
        const response_password = json.new_password;
        should.notEqual(iot_agent_password, response_password);
        response.statusCode.should.equal(200);
        done();
      });
    });
  });

  describe('5) When deleting a iot_agent', function () {
    let iot_agent_id;

    // eslint-disable-next-line snakecase/snakecase
    beforeEach(function (done) {
      const create_iot_agent = {
        url: config.host + '/v1/applications/' + application_id + '/iot_agents',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-token': token
        }
      };

      request(create_iot_agent, function (error, response, body) {
        const json = JSON.parse(body);
        iot_agent_id = json.iot_agent.id;
        done();
      });
    });

    it('should return a 204 OK', function (done) {
      const delete_iot_agent = {
        url: config.host + '/v1/applications/' + application_id + '/iot_agents/' + iot_agent_id,
        method: 'DELETE',
        headers: {
          'X-Auth-token': token
        }
      };

      request(delete_iot_agent, function (error, response) {
        should.not.exist(error);
        response.statusCode.should.equal(204);
        done();
      });
    });
  });
});
